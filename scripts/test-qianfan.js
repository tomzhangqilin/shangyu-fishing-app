const fs = require("fs");

for (const line of fs.readFileSync(".env.local", "utf8").replace(/^﻿/, "").split(/\r?\n/)) {
  const index = line.indexOf("=");
  if (index > 0) process.env[line.slice(0, index).trim()] = line.slice(index + 1).trim();
}

const body = {
  style: "路亚",
  fish: "黑鲈",
  weather: {
    city: "北京",
    condition: "多云",
    temperature: 23,
    wind: 10,
  },
};

const fallback = {
  fish_behavior: "鲈鱼在多云低风速时更容易靠近浅层结构区活动。",
  season_pattern: "偏好水温上升快、有遮挡物的浅层区域。",
  recommended_area: "草区边缘、倒木附近",
  recommended_depth: "1.2–1.8米",
  recommended_bait: "红色软虫",
  retrieve_style: "慢速收线",
  best_time: "傍晚前后",
  casting_tip: "顺风45度抛投，优先搜索草线与明暗交界处。",
  activity_score: 72,
  summary: "建议使用红色软虫慢速收线，重点搜索浅层草区与倒木结构。",
};

function extractJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return cleaned;
  return cleaned.slice(start, end + 1);
}

function cleanField(value, fallbackValue, blocked) {
  const text = String(value || "").trim();
  if (!text || text === "未知") return fallbackValue;
  if (blocked.some((word) => word && text.includes(word))) return fallbackValue;
  return text;
}

function parseStrategy(text) {
  const parsed = JSON.parse(extractJson(text));
  const score = parseInt(parsed.activity_score, 10);
  return {
    title: "今日钓法",
    fish_behavior: cleanField(parsed.fish_behavior, fallback.fish_behavior, []),
    season_pattern: cleanField(parsed.season_pattern, fallback.season_pattern, []),
    recommended_area: cleanField(parsed.recommended_area, fallback.recommended_area, [body.weather.city]),
    recommended_depth: cleanField(parsed.recommended_depth, fallback.recommended_depth, ["未知"]),
    recommended_bait: cleanField(parsed.recommended_bait, fallback.recommended_bait, [body.style, body.fish]),
    retrieve_style: cleanField(parsed.retrieve_style, fallback.retrieve_style, ["未知"]),
    best_time: cleanField(parsed.best_time, fallback.best_time, ["未知"]),
    casting_tip: cleanField(parsed.casting_tip, fallback.casting_tip, []),
    activity_score: score >= 0 && score <= 100 ? score : fallback.activity_score,
    summary: cleanField(parsed.summary, fallback.summary, []),
  };
}

async function main() {
  const response = await fetch("https://qianfan.baidubce.com/v2/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.QIANFAN_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.QIANFAN_MODEL || "ernie-4.5-0.3b",
      messages: [
        {
          role: "system",
          content:
            "你是上渔的专业钓鱼策略助手。只返回 JSON，不要 Markdown，不要解释。必须包含以下字段：fish_behavior（目标鱼当前行为，一句话）、season_pattern（季节规律，一句话）、recommended_area（推荐钓点类型，不能是城市名）、recommended_depth（水深范围，单位米）、recommended_bait（具体饵料名称）、retrieve_style（收线或作钓节奏）、best_time（最佳垂钓时段）、casting_tip（抛投或操作技巧，一句话）、activity_score（鱼类活性评分0-100的整数）、summary（一句综合建议）。全部使用中文，禁止出现英文单词或英文单位。",
        },
        {
          role: "user",
          content:
            '请生成今日钓鱼策略。钓法：路亚。目标鱼：黑鲈。城市仅作天气参考，不可作为推荐区域：北京。天气：多云。气温：23摄氏度。风速：10千米每小时。返回示例：{"fish_behavior":"鲈鱼在阴天时靠近浅层结构区活动。","season_pattern":"春季偏好水温上升快的区域。","recommended_area":"草区边缘、倒木附近","recommended_depth":"1.2–1.8米","recommended_bait":"红色软虫","retrieve_style":"慢速收线","best_time":"傍晚前后","casting_tip":"顺风45度抛投，优先搜索阴影区域。","activity_score":82,"summary":"建议使用红色软虫慢速收线，重点搜索浅层草区与倒木结构。"}',
        },
      ],
      temperature: 0.8,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      repetition_penalty: 1,
      stop: [],
    }),
  });

  const data = await response.json();
  console.log(response.status);
  console.log(JSON.stringify({ code: 0, msg: "成功", data: parseStrategy(data.choices[0].message.content) }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  if (error.cause?.message) console.error(error.cause.message);
  process.exit(1);
});
