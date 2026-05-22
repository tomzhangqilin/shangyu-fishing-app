const { createServer } = require("http");
const { createReadStream, existsSync } = require("fs");
const { readFile } = require("fs/promises");
const path = require("path");

loadLocalEnv();

const root = path.join(__dirname, "out");
const port = Number(process.env.PORT || 3000);
const qianfanApiKey = process.env.QIANFAN_API_KEY;
const qianfanModel = process.env.QIANFAN_MODEL || "ernie-4.5-0.3b";
const qianfanImageModel = process.env.QIANFAN_IMAGE_MODEL || "qwen-image";

// ─── 上下文计算 ────────────────────────────────────────────

function getSeason(month) {
  if (month >= 2 && month <= 4) return "春季";
  if (month >= 5 && month <= 7) return "夏季";
  if (month >= 8 && month <= 10) return "秋季";
  return "冬季";
}

function getTimePeriod(hour) {
  if (hour >= 5 && hour < 8) return "清晨";
  if (hour >= 8 && hour < 11) return "上午";
  if (hour >= 11 && hour < 14) return "中午";
  if (hour >= 14 && hour < 17) return "下午";
  if (hour >= 17 && hour < 20) return "傍晚";
  return "夜晚";
}

function estimateWaterTemp(airTemp, season) {
  const offset = { 春季: -3, 夏季: -2, 秋季: -2, 冬季: -5 };
  return Math.max(0, Math.round(airTemp + (offset[season] || -2)));
}

function getActivityScore(waterTemp, timePeriod, condition, fish) {
  let score = 60;

  // 时间段加成
  if (timePeriod === "清晨" || timePeriod === "傍晚") score += 15;
  else if (timePeriod === "中午") score -= 10;
  else if (timePeriod === "夜晚") score += 5;

  // 天气加成
  if (condition.includes("阴") || condition.includes("多云")) score += 8;
  if (condition.includes("雨") || condition.includes("毛雨")) score += 12;
  if (condition.includes("晴") || condition.includes("少云")) score -= 5;
  if (condition.includes("雷")) score -= 15;

  // 水温加成（通用）
  if (waterTemp < 8) score -= 25;
  else if (waterTemp >= 8 && waterTemp < 12) score -= 12;
  else if (waterTemp >= 15 && waterTemp <= 22) score += 10;
  else if (waterTemp > 28) score -= 8;

  // 鲶鱼夜晚特殊加成
  if ((fish === "鲶鱼" || fish.includes("鲶")) && timePeriod === "夜晚") score += 20;

  return Math.min(98, Math.max(15, score));
}

function getFishHint(fish, waterTemp, season, timePeriod) {
  const name = fish || "目标鱼";

  if (fish === "黑鲈" || fish.includes("鲈")) {
    if (waterTemp < 10) return `${name}水温低于10°C，活性极低，需极慢跳底操作，重点搜索深水结构区`;
    if (waterTemp < 15) return `${name}水温偏低，活性受限，偏好较深的结构区，慢速钓法为主`;
    if (waterTemp <= 22) return `${name}处于最佳活跃期（15–22°C），各层均可积极搜索，偏好倒木、草边、礁石等结构`;
    if (waterTemp <= 28) return `${name}水温偏高，白天偏向阴影和深水结构，${timePeriod === "清晨" || timePeriod === "傍晚" ? "此时段可搜索浅层" : "避开阳光直射区"}`;
    return `${name}水温超过28°C，活性下降，需搜索深水阴凉处或水下障碍物旁`;
  }

  if (fish === "翘嘴" || fish.includes("翘")) {
    const layer = timePeriod === "清晨" || timePeriod === "傍晚" ? "水面追食小鱼" : "中上层巡游，偏好开阔水域";
    return `${name}追逐小鱼，${layer}；${season === "夏季" ? "夏季高温时偏向清晨傍晚活跃" : "全天均有觅食行为"}`;
  }

  if (fish === "鲤鱼" || fish.includes("鲤")) {
    const depth = season === "冬季" ? "深水区守钓，活性极低" : "泥底或水草根部底层觅食";
    return `${name}主食底层，偏好${depth}；${timePeriod === "清晨" || timePeriod === "上午" ? "清晨觅食积极，适合打窝等口" : "上午过后补窝为主"}`;
  }

  if (fish === "鲶鱼" || fish.includes("鲶")) {
    const active = timePeriod === "夜晚" ? "夜晚为最佳钓时，靠近底层障碍物和深坑" : "白天躲藏在深水和障碍物下，效果较差";
    return `${name}夜行性，${active}；偏好腥味饵料和浑浊水域`;
  }

  if (fish === "黑鱼" || fish.includes("黑鱼")) {
    const bait = season === "夏季" ? "水面系饵或噗噗饵效果最佳" : "水草边缘缓慢引诱";
    return `${name}伏击型猎手，偏好密集水草区；${bait}`;
  }

  if (fish === "草鱼" || fish.includes("草")) {
    return `${name}食草性，偏好水草茂盛区域和浅水带；${season === "秋季" ? "秋季大量进食储备能量，活性最高" : "对植物性饵料反应最好"}`;
  }

  // 通用兜底
  return `${name}：${season}水温约${waterTemp}°C，${timePeriod}时段，根据鱼种习性选择对应水层和饵料`;
}

function getWeatherHint(condition, wind) {
  const parts = [];

  if (condition.includes("晴") || condition.includes("少云")) {
    parts.push("晴天光线强，鱼群向深水或阴影退缩，重点搜索遮挡物下方和深水结构，避开暴晒开阔区");
  } else if (condition.includes("多云") || condition.includes("局部多云")) {
    parts.push("多云天气光线柔和，鱼群活跃度提升，可搜索浅中层，扩大搜索范围");
  } else if (condition.includes("阴")) {
    parts.push("阴天气压偏低，鱼群更敢进入浅层觅食，是绝佳时机，重点搜索浅层草区和水面附近");
  } else if (condition.includes("毛雨") || condition.includes("小雨")) {
    parts.push("小雨增加水面扰动并带来食物，鱼类活性普遍提升，浅层搜索效果好");
  } else if (condition.includes("中雨") || condition.includes("大雨")) {
    parts.push("中大雨浑水影响视线，可使用气味型饵料；注意水流变化，找缓流汇集处");
  } else if (condition.includes("雷")) {
    parts.push("雷雨前气压骤变鱼类短暂活跃，但应注意安全，雷雨中停止垂钓");
  } else if (condition.includes("雾")) {
    parts.push("有雾时气压偏低，鱼群活性较好，可搜索中上层");
  } else if (condition.includes("雪")) {
    parts.push("降雪天气水温急降，鱼类活性极低，守钓深水稳定区");
  }

  if (wind >= 25) {
    parts.push(`风速${wind}千米/时，优先搜索迎风岸（风吹来的方向），食物和小鱼随风聚集；选择较重钓组抗风，顺风抛投`);
  } else if (wind >= 15) {
    parts.push(`中等风速${wind}千米/时，水面有波纹利于遮蔽鱼线，迎风岸食物更集中`);
  } else {
    parts.push(`风速低，水面平静，鱼线容易被发现，建议细线轻钓组，动作轻柔`);
  }

  return parts.join("；");
}

function getTimeHint(timePeriod, season) {
  const map = {
    清晨: `清晨水温开始回升，鱼群从深水向浅层迁移觅食，${season === "夏季" ? "夏季此时是全天最佳时段" : "是一天中的黄金时段"}`,
    上午: "上午光线逐渐增强，鱼群仍较活跃，可搜索浅中层，但活跃度开始下降",
    中午: `中午气温最高，${season === "夏季" ? "夏季鱼群全线退入深水或阴影，应搜索3米以深的结构区" : "鱼群向深水移动，减少浅层搜索"}`,
    下午: "下午气温开始回落，鱼群从深水逐渐回归，搜索中层结构区",
    傍晚: `傍晚是一天中${season === "冬季" ? "较好的" : "最佳的"}垂钓时段，鱼群大量进入浅层积极觅食`,
    夜晚: "夜晚光线极暗，夜行性鱼类（鲶鱼、鲈鱼）活跃，可用气味饵或发光饵搜索底层",
  };
  return map[timePeriod] || "当前时段鱼类活动正常";
}

// ─── 动态 Fallback（API 失败时使用） ────────────────────────

function buildFallback(style, fish, season, timePeriod, waterTemp, condition, wind) {
  const isHot = waterTemp > 25;
  const isCold = waterTemp < 12;
  const isMidday = timePeriod === "中午";
  const isPeakTime = timePeriod === "清晨" || timePeriod === "傍晚";
  const isNight = timePeriod === "夜晚";
  const isCloudy = condition.includes("多云") || condition.includes("阴") || condition.includes("雨");
  const isWindy = wind >= 20;

  const score = getActivityScore(waterTemp, timePeriod, condition, fish);

  // 根据时间和温度决定深度
  const depthShallow = "0.8–1.5米";
  const depthMid = "1.5–2.5米";
  const depthDeep = "2.5–4.0米";
  const depth = isHot && isMidday ? depthDeep : isPeakTime && isCloudy ? depthShallow : isCold ? depthDeep : depthMid;

  // 区域逻辑
  const areaMap = {
    路亚: isHot && isMidday ? "深水倒木、桥墩阴影区" : isCloudy && isPeakTime ? "浅层草区边缘、倒木旁" : isWindy ? "迎风礁石区、岬角处" : "中层结构区、沉木附近",
    台钓: isMidday ? "深水静水湾、水草根部" : isPeakTime ? "缓流回湾浅处" : "泥底平坦区、水草旁",
    飞钓: isNight ? "溪流浅水出口处" : isPeakTime ? "树荫浅滩边缘" : "溪流阴影区、大石旁",
    海钓: isWindy ? "迎风礁石外缘、浪头下方" : "礁石外缘、暗流汇聚处",
  };
  const area = areaMap[style] || areaMap.路亚;

  // 饵料逻辑
  const baitMap = {
    路亚: isCold ? "小型软虫（3寸以内）" : isHot && isMidday ? "德州钓组、深潜米诺" : isCloudy ? "水面系饵或浅层软虫" : "中层米诺或铁板",
    台钓: season === "夏季" ? "植物香型拉饵" : isCold ? "红虫搓饵" : "谷物香型饵",
    飞钓: season === "春季" || season === "夏季" ? "干毛钩或蚊型若虫" : "橄榄色若虫",
    海钓: isWindy ? "重型铁板" : "银色米诺或沙蚕",
  };
  const bait = baitMap[style] || baitMap.路亚;

  // 操作节奏
  const styleMap = {
    路亚: isCold ? "极慢跳底" : isHot && isMidday ? "慢速深水搜底" : isCloudy && isPeakTime ? "快速搜索水面" : "慢速匀速收线",
    台钓: isCold ? "长时间守钓" : isPeakTime ? "补窝勤快" : "稳守待口",
    飞钓: isWindy ? "抛投压低弧度控线" : "轻柔漂流控线",
    海钓: isWindy ? "顺风重组搜索" : "中速匀速搜索",
  };
  const retrieve = styleMap[style] || styleMap.路亚;

  const castingTip = isWindy
    ? "顺风抛投，重点覆盖迎风岸食物聚集区，适当加重钓组。"
    : isPeakTime
      ? "轻柔落点，优先搜索阴影与光区交界处。"
      : isMidday
        ? "抛向深水结构旁，等待饵落底后缓慢操作。"
        : "覆盖多个钓点，找到鱼群活跃区后集中搜索。";

  const summary = `${season}${timePeriod}，${condition}，水温约${waterTemp}°C，建议使用${bait}，${retrieve}搜索${area}。`;

  return {
    fish_behavior: getFishHint(fish, waterTemp, season, timePeriod),
    season_pattern: `${season}${fish}偏好${depth}水层，${isPeakTime ? "清晨傍晚" : isMidday ? "中午" : "夜间"}觅食积极。`,
    recommended_area: area,
    recommended_depth: depth,
    recommended_bait: bait,
    retrieve_style: retrieve,
    best_time: isPeakTime ? timePeriod : "清晨或傍晚",
    casting_tip: castingTip,
    activity_score: score,
    summary,
  };
}

// ─── HTTP 服务器 ───────────────────────────────────────────

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".otf": "font/otf",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function safePath(url) {
  const cleanUrl = new URL(url, "http://localhost").pathname;
  const decoded = decodeURIComponent(cleanUrl);
  const filePath = path.normalize(path.join(root, decoded));
  if (!filePath.startsWith(root)) return null;
  if (existsSync(filePath) && !filePath.endsWith(path.sep)) return filePath;
  return path.join(root, "index.html");
}

function loadLocalEnv() {
  const envPath = path.join(__dirname, ".env.local");
  if (!existsSync(envPath)) return;

  const lines = require("fs").readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsAt = trimmed.indexOf("=");
    if (equalsAt === -1) continue;
    const key = trimmed.slice(0, equalsAt).replace(/^﻿/, "").trim();
    const value = trimmed.slice(equalsAt + 1).trim();
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/strategy") {
    await handleStrategy(req, res);
    return;
  }

  if (req.method === "POST" && req.url === "/api/share-card-image") {
    await handleShareCardImage(req, res);
    return;
  }

  const filePath = safePath(req.url || "/");
  if (!filePath) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("禁止访问");
    return;
  }

  try {
    await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": types[path.extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("未找到页面");
  }
}).listen(port, "0.0.0.0", () => {
  console.log(`上渔预览已启动：http://localhost:${port}`);
});

async function handleStrategy(req, res) {
  try {
    if (!qianfanApiKey) {
      sendJson(res, 500, { error: "缺少 QIANFAN_API_KEY" });
      return;
    }

    const body = await readJson(req);

    // 计算上下文变量
    const now = new Date();
    const month = now.getMonth();
    const hour = typeof body.hour === "number" ? body.hour : now.getHours();
    const season = getSeason(month);
    const timePeriod = getTimePeriod(hour);
    const airTemp = body.weather?.temperature ?? 20;
    const waterTemp = estimateWaterTemp(airTemp, season);
    const condition = body.weather?.condition || "多云";
    const wind = body.weather?.wind ?? 0;
    const fish = body.fish || "黑鲈";
    const style = body.style || "路亚";

    const fishHint = getFishHint(fish, waterTemp, season, timePeriod);
    const weatherHint = getWeatherHint(condition, wind);
    const timeHint = getTimeHint(timePeriod, season);
    const activityScore = getActivityScore(waterTemp, timePeriod, condition, fish);

    const systemPrompt =
      "你是上渔的专业钓鱼策略助手。只返回 JSON，不要 Markdown，不要解释。" +
      "必须包含字段：fish_behavior、season_pattern、recommended_area、recommended_depth、recommended_bait、retrieve_style、best_time、casting_tip、activity_score、summary。" +
      "严格规则：" +
      "①recommended_area必须根据天气和时间具体变化，禁止每次都输出草区边缘；" +
      "②recommended_depth必须随时间段和水温变化，中午高温时推荐深水，清晨傍晚推荐浅层；" +
      "③recommended_bait必须匹配鱼种和当前条件，禁止每次都推荐红色软虫；" +
      "④retrieve_style必须根据水温和活性调整速度；" +
      "⑤summary必须引用至少一个具体环境条件（天气或时间段或水温）。" +
      "全部使用中文，禁止英文单词或英文单位。";

    const userPrompt =
      `请根据以下真实环境生成今日${fish}钓鱼策略，结果必须与条件强相关，禁止输出通用模板。\n\n` +
      `【当前环境】\n` +
      `季节：${season}\n` +
      `时间段：${timePeriod}（当地${hour}时）\n` +
      `天气：${condition}\n` +
      `气温：${airTemp}°C（估算水温约${waterTemp}°C）\n` +
      `风速：${wind}千米/时\n` +
      `钓法：${style}\n` +
      `目标鱼：${fish}\n\n` +
      `【鱼种习性参考】\n${fishHint}\n\n` +
      `【天气与风速影响】\n${weatherHint}\n\n` +
      `【时间规律】\n${timeHint}\n\n` +
      `参考活性评分：${activityScore}（请在此基础上根据以上条件综合判断后填写activity_score）\n\n` +
      `城市仅作天气参考，不可出现在推荐区域中：${body.weather?.city}`;

    const response = await fetch("https://qianfan.baidubce.com/v2/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${qianfanApiKey}`,
      },
      body: JSON.stringify({
        model: qianfanModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.2,
        repetition_penalty: 1.1,
        stop: [],
      }),
    });

    if (!response.ok) {
      sendJson(res, response.status, { error: "千帆接口请求失败" });
      return;
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || "";
    const ctx = { style, fish, waterTemp, season, timePeriod, condition, wind };
    sendJson(res, 200, { code: 0, msg: "成功", data: parseStrategy(text, body, ctx) });
  } catch {
    sendJson(res, 500, { error: "千帆策略生成失败" });
  }
}

async function handleShareCardImage(req, res) {
  try {
    if (!qianfanApiKey) {
      sendJson(res, 500, { error: "缺少 QIANFAN_API_KEY" });
      return;
    }

    const body = await readJson(req);
    const strategy = body.strategy || {};
    const weather = body.weather || {};

    if (!strategy.recommended_area || !strategy.recommended_bait || !strategy.summary) {
      sendJson(res, 400, { error: "缺少文字模型生成的策略结果" });
      return;
    }

    const prompt =
      `Single isolated fish sprite, ${body.fish || "black bass"}, side view, head facing left, full body visible, centered, occupying 85% of the image. ` +
      `High quality 16-bit pixel art game asset, crisp pixel edges, transparent background or plain dark navy background. ` +
      `Only one fish. No scenery. No mountains. No buildings. No temple. No landscape. No water plants. No fishing rod. No person. No text. No numbers. No UI. No frame. No logo. No watermark. ` +
      `只生成一条${body.fish || "黑鲈"}鱼本体，横向侧面，鱼头朝左，完整鱼身，占画面85%。严格禁止风景、山、建筑、寺庙、人物、鱼竿、文字、数字、UI、边框。`;

    const response = await fetch("https://qianfan.baidubce.com/v2/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${qianfanApiKey}`,
      },
      body: JSON.stringify({
        model: qianfanImageModel,
        prompt,
        size: "1024x1024",
        n: 1,
      }),
    });

    if (!response.ok) {
      sendJson(res, response.status, { error: "千帆图片生成失败" });
      return;
    }

    const data = await response.json();
    const rawImage = data?.data?.[0]?.url || data?.data?.[0]?.b64_json || "";
    if (!rawImage) {
      sendJson(res, 500, { error: "千帆未返回图片" });
      return;
    }

    const imageDataUrl = await normalizeImageResult(rawImage);
    sendJson(res, 200, { code: 0, fishImageDataUrl: imageDataUrl });
  } catch {
    sendJson(res, 500, { error: "千帆图片生成失败" });
  }
}

async function normalizeImageResult(rawImage) {
  if (rawImage.startsWith("data:image")) return rawImage;
  if (!rawImage.startsWith("http")) return `data:image/png;base64,${rawImage}`;

  const response = await fetch(rawImage);
  if (!response.ok) throw new Error("图片下载失败");
  const contentType = response.headers.get("content-type") || "image/png";
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${buffer.toString("base64")}`;
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function parseStrategy(text, body, ctx) {
  const { style, fish, waterTemp, season, timePeriod, condition, wind } = ctx;
  const fallback = buildFallback(style, fish, season, timePeriod, waterTemp, condition, wind);
  const cityName = body.weather?.city;

  let parsed = {};
  try {
    parsed = JSON.parse(extractJson(text));
  } catch {
    return { title: "今日钓法", ...fallback };
  }

  const rawScore = parseInt(parsed.activity_score, 10);
  const activity_score = rawScore >= 0 && rawScore <= 100 ? rawScore : fallback.activity_score;

  return {
    title: "今日钓法",
    fish_behavior: cleanField(parsed.fish_behavior, fallback.fish_behavior, []),
    season_pattern: cleanField(parsed.season_pattern, fallback.season_pattern, []),
    recommended_area: cleanField(parsed.recommended_area, fallback.recommended_area, [cityName]),
    recommended_depth: cleanField(parsed.recommended_depth, fallback.recommended_depth, ["未知"]),
    recommended_bait: cleanField(parsed.recommended_bait, fallback.recommended_bait, [style, fish]),
    retrieve_style: cleanField(parsed.retrieve_style, fallback.retrieve_style, ["未知"]),
    best_time: cleanField(parsed.best_time, fallback.best_time, ["未知"]),
    casting_tip: cleanField(parsed.casting_tip, fallback.casting_tip, []),
    activity_score,
    summary: cleanField(parsed.summary, fallback.summary, []),
  };
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return cleaned;
  return cleaned.slice(start, end + 1);
}

function cleanField(value, fallback, blocked) {
  const text = String(value || "").trim();
  if (!text || text === "未知") return fallback;
  if (blocked.some((word) => word && text.includes(word))) return fallback;
  return text;
}
