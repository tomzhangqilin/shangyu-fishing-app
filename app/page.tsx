"use client";

import { AnimatePresence } from "framer-motion";
import { Check, ChevronRight, Download, LocateFixed } from "lucide-react";
import { useMemo, useState } from "react";

const icon = (name: string) => `/poster-icons/${name}.png`;
const fishArt = (name: string) => `/fish-art/${name}.png`;

const HookSvg = ({ color = "#1e2d5c", size = 20 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 22 26" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 4 C15 2, 16.5 1, 18 1 C19.5 1, 21 2, 21 4 L21 16 C21 21, 16.5 25, 11 25 C5.5 25, 1 21, 1 16 C1 11.5, 5 9, 8.5 10.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M8.5 10.5 L2 5.5" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const posterIconDataUrls = {
  calendar: icon("calendar"),
  cloud: icon("cloud"),
  clock: icon("clock"),
  depth: icon("depth"),
  fish: icon("fish"),
  fisherman: icon("fisherman"),
  fishSprite: icon("fishSprite"),
  grass: icon("grass"),
  leaf: icon("leaf"),
  log: icon("log"),
  mapPin: icon("mapPin"),
  radar: icon("radar"),
  reel: icon("reel"),
  star: icon("star"),
  sun: icon("sun"),
  sunset: icon("sunset"),
  thermometer: icon("thermometer"),
  wind: icon("wind"),
};

const cardIconDataUrls = {
  ...posterIconDataUrls,
  sunny: icon("sunny"),
  rain: icon("rain"),
  thunderstorm: icon("thunderstorm"),
  mapPin2: icon("mapPin"),
  bait: icon("cornBait"),
  cornBait: icon("cornBait"),
  lure: icon("lure"),
  vibLure: icon("vibLure"),
  spoonLure: icon("spoonLure"),
  rocky: icon("rocky"),
  bridge: icon("bridge"),
  grassArt: icon("grassArt"),
  seasonScene: icon("seasonScene"),
  shoreScene: icon("shoreScene"),
  // 三类饵专属图标
  baitWorm: icon("baitWorm"),
  baitDough: icon("baitDough"),
  baitLure: icon("baitLure"),
  // 今日状态专属星形
  activityStar: "/poster-icons/activityStar.svg",
  // 分享卡 footer logo
  yuyueLogo: "/poster-icons/yuyueLogo.png",
};

const fishArtDataUrls = {
  bass: fishArt("bass"),
  blackCarp: fishArt("black-carp"),
  catfish: fishArt("catfish"),
  generic: fishArt("generic"),
  grassCarp: fishArt("grass-carp"),
  mandarin: fishArt("mandarin"),
  pike: fishArt("pike"),
  seaBass: fishArt("sea-bass"),
  snakehead: fishArt("snakehead"),
  whitebait: fishArt("whitebait"),
};

type Weather = {
  city: string;
  condition: string;
  temperature: number;
  wind: number;
};

type Strategy = {
  title: string;
  fish_behavior: string;
  season_pattern: string;
  recommended_area: string;
  recommended_depth: string;
  recommended_bait: string;
  retrieve_style: string;
  best_time: string;
  casting_tip: string;
  activity_score: number;
  summary: string;
};

const fishingStyles = ["路亚", "台钓", "飞钓", "海钓"];
const fishOptions = ["黑鲈", "黑鱼", "鲤鱼", "鲶鱼", "草鱼", "白条", "鳜鱼", "海鲈", "狗鱼"];

const fallbackWeather: Weather = {
  city: "北京",
  condition: "多云",
  temperature: 23,
  wind: 10,
};

const weatherText: Record<number, string> = {
  0: "晴",
  1: "少云",
  2: "局部多云",
  3: "多云",
  45: "有雾",
  48: "有雾",
  51: "小毛雨",
  53: "毛雨",
  55: "大毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  80: "阵雨",
  81: "阵雨",
  82: "强阵雨",
  95: "雷雨",
};

const localStrategies: Record<string, Strategy> = {
  路亚: {
    title: "夏季主攻阴影区慢搜",
    fish_behavior: "掠食鱼藏于阴凉障碍物下等待猎物",
    season_pattern: "夏季高温下，掠食性鱼类白天藏匿于水草内侧、桥墩阴影、倒木下方，清晨及傍晚上浅水捕食。雷雨前后气压骤降时全天均有爆口机会，是夏季路亚最不可错过的窗口。",
    recommended_area: "水草边缘、桥墩阴影区、倒木附近",
    recommended_depth: "0.5–2.0米",
    recommended_bait: "5cm软虫（德州钓）/ 米诺",
    retrieve_style: "慢收线 + 短顿停（Stop & Go）",
    best_time: "清晨5:00–8:00 / 傍晚17:30–20:00",
    casting_tip: "优先攻草缘，距草0.5m处抛投沿边缘慢操；晴天强光选自然色系，阴天换荧光色；雷雨前后气压骤降是全天爆口的绝佳窗口。",
    activity_score: 82,
    summary: "高温迫使掠食鱼避光藏底，清晨傍晚是最佳出竿时机，阴凉结构区是夏季路亚的核心钓位。",
  },
  台钓: {
    title: "夏季深水守底调灵找层",
    fish_behavior: "底层鱼下潜深水，开口轻微需精细调钓",
    season_pattern: "夏季鲤鱼、草鱼受高温影响下潜至2–4米深水，开口时间集中在溶氧较高的清晨与傍晚。草鱼夏季食欲旺盛会上浮，鲤鱼则紧贴底层觅食。",
    recommended_area: "深水区2–4m、树荫下、进水口附近",
    recommended_depth: "2.0–4.0米",
    recommended_bait: "轻麸+玉米香型饵（减腥增香）",
    retrieve_style: "调三钓一，稳守逐层探鱼",
    best_time: "清晨5:00–8:00 / 傍晚17:00–19:00",
    casting_tip: "先底钓探位，无信号则上推浮漂至半水逐步找层；夏季小杂鱼干扰多，改用硬饵减少雾化；草鱼可改浮钓配撸草或草段。",
    activity_score: 68,
    summary: "夏季台钓关键在于找准水层、调灵浮漂；放弃小杂鱼干扰，专注大鱼轻微的进食信号。",
  },
  飞钓: {
    title: "夏季昆虫旺季干毛钩当道",
    fish_behavior: "白条全天追食水面漂浮昆虫，进食频繁",
    season_pattern: "夏季是飞钓全年最佳季节，昆虫孵化旺盛。白条整天活跃于水面，黑鲈傍晚上浮捕食，鳜鱼喜湿毛钩流水区。清晨与傍晚阴影边缘鱼口最旺。",
    recommended_area: "清澈溪流缓流区、水草边缘静水区、瀑布脚水潭",
    recommended_depth: "0.1–0.5米（水面漂流）",
    recommended_bait: "干毛钩#14–#18 / 若虫#12–#16",
    retrieve_style: "轻落水，顺流自然漂移不主动抖动",
    best_time: "清晨6:00–9:00 / 傍晚17:00–20:00",
    casting_tip: "站在进食点上风10–15m处顺风送饵；毛钩入水声要轻，宁缩抛距也要精准落点；让毛钩随流漂移，无需主动抖动。",
    activity_score: 74,
    summary: "夏季昆虫大量孵化，干毛钩飞钓进入旺季；轻落水、精准落点、顺流漂移是夏日飞钓三要素。",
  },
  海钓: {
    title: "夏季礁边搜底把握潮汐窗口",
    fish_behavior: "海鲈随涨潮近岸，追逐礁石区饵鱼",
    season_pattern: "夏季海鲈随水温升高向近岸迁移，礁石带、防波堤柱脚及河口咸淡水交汇处是最佳钓位。涨潮前1小时至满潮后1小时为最强捕食窗口。",
    recommended_area: "礁石外缘、防波堤柱脚、河口咸淡水交汇处",
    recommended_depth: "2.4–5.0米",
    recommended_bait: "沉水米诺90–120mm / 铁板20–60g",
    retrieve_style: "远投后慢速匀收，配合海浪辅助动作",
    best_time: "涨潮前1小时至满潮后1小时 / 黎明5:00–7:00",
    casting_tip: "涨潮前提前到位，优先覆盖礁石缝隙与防波堤柱脚；退潮后改用铁板攻深水区；正午11:00–15:00建议避开，注意防晒防滑。",
    activity_score: 78,
    summary: "潮汐是海钓的核心节律，涨潮窗口+黎明低光是全天最佳钓鱼组合，礁石边缘是海鲈夏季的必守据点。",
  },
};

type FishProfile = {
  behavior: string;
  season_pattern: string;
  recommended_area: string;
  recommended_depth: string;
  recommended_bait: string;
  best_time: string;
  activity_score: number;
};

const fishProfiles: Record<string, FishProfile> = {
  黑鲈: {
    behavior: "高温下藏于阴凉障碍物，清晨傍晚上浅水捕食",
    season_pattern: "夏季黑鲈白天藏匿于水草内侧、倒木、桥墩阴影下，清晨傍晚上浅水主动捕食，阴天及雷雨前后气压骤降时全天均有爆口机会。",
    recommended_area: "水草边缘、桥墩阴影、倒木附近",
    recommended_depth: "1.0–2.0米",
    recommended_bait: "5cm软虫德州钓 / 米诺",
    best_time: "清晨5:00–8:00 / 傍晚17:30–20:00",
    activity_score: 82,
  },
  黑鱼: {
    behavior: "夏季活跃于水草区，雨后气压骤降时爆口明显",
    season_pattern: "黑鱼是最耐高温的淡水鱼之一，夏季在水草密集区极为活跃。喜欢在草洞、芦苇根部伏击猎物，雨后30分钟往往迎来全天最强爆口。",
    recommended_area: "水草密集区、草洞内部、芦苇边",
    recommended_depth: "0.3–1.2米",
    recommended_bait: "青蛙饵 / 虫形软饵",
    best_time: "全天有效，雨后30分钟及清晨最佳",
    activity_score: 88,
  },
  鲤鱼: {
    behavior: "高温下潜深水，开口轻微，早晚觅食",
    season_pattern: "夏季鲤鱼受高温影响下潜至2–4米深水区，白天代谢降低、开口迟缓，清晨与傍晚是最佳进食时段。进水口和树荫处溶氧充足，是聚鱼首选。",
    recommended_area: "深水缓流区2–4m、进水口附近、树荫下",
    recommended_depth: "2.0–4.0米",
    recommended_bait: "玉米香型轻麸饵（减腥增香）",
    best_time: "清晨5:00–8:00 / 傍晚17:00–19:00",
    activity_score: 68,
  },
  鲶鱼: {
    behavior: "白天藏于障碍物下，日落后大范围觅食",
    season_pattern: "鲶鱼夏季白天藏于深坑、障碍物下几乎不动，日落后开始大范围觅食。夜钓是夏季鲶鱼的核心策略，重腥饵气味越重越能引鱼远距离觅食。",
    recommended_area: "障碍物旁、深坑底部、桥墩脚下",
    recommended_depth: "2.5–5.0米",
    recommended_bait: "活蚯蚓 / 腥香底饵（气味越重越好）",
    best_time: "夜间20:00–23:00最佳",
    activity_score: 75,
  },
  草鱼: {
    behavior: "夏季上浮活跃，清晨食欲旺盛但警觉性高",
    season_pattern: "草鱼夏季食欲旺盛且会上浮，是少数在高温下依然活跃的淡水鱼。喜在水草边、进水口附近浮游觅食，浮钓配撸草或草段效果极佳。",
    recommended_area: "水草边缘、进水口、宽阔深水湾",
    recommended_depth: "0.3–0.8米（浮钓）",
    recommended_bait: "撸草 / 草段 / 菜叶（浮钓首选）",
    best_time: "清晨5:30–8:30",
    activity_score: 72,
  },
  白条: {
    behavior: "夏季全天活跃，追逐水面漂浮昆虫",
    season_pattern: "白条是夏季溪流中最活跃的鱼种，整天追逐水面漂流昆虫，对飞钓干毛钩反应极为积极。清澈缓流区和迎风岸是其聚集的天然食场。",
    recommended_area: "清澈溪流缓流区、迎风岸边",
    recommended_depth: "0.1–0.5米",
    recommended_bait: "干毛钩#14–#18 / 微型路亚（3cm以下）",
    best_time: "全天，上午9:00–11:00最活跃",
    activity_score: 85,
  },
  鳜鱼: {
    behavior: "傍晚后活跃，伏击小鱼，偏爱流水结构",
    season_pattern: "鳜鱼是夏季傍晚至夜间最活跃的掠食性淡水鱼，偏爱活水入口和流速边缘。以伏击方式捕食小鱼，米诺类饵型慢速抽停能有效模拟受伤小鱼。",
    recommended_area: "活水入口、流速边缘、礁石旁",
    recommended_depth: "1.5–3.0米",
    recommended_bait: "6–9cm米诺 / 铅笔饵 / 软虫",
    best_time: "傍晚17:30–20:00 / 夜间",
    activity_score: 76,
  },
  海鲈: {
    behavior: "夏季近岸迁移，随涨潮至礁石带捕食",
    season_pattern: "夏季海鲈跟随水温升高向近岸迁移，礁石带、防波堤柱脚及河口咸淡水交汇处是最佳钓位。涨潮前1小时至满潮后1小时为最强捕食窗口。",
    recommended_area: "礁石外缘、防波堤柱脚、河口咸淡水交汇",
    recommended_depth: "2.4–5.0米",
    recommended_bait: "沉水米诺90–120mm / 铁板20–60g",
    best_time: "涨潮前1小时至满潮后1小时 / 黎明5:00–7:00",
    activity_score: 78,
  },
  狗鱼: {
    behavior: "偏好低温清水，清晨阴天追食大型饵",
    season_pattern: "狗鱼偏好低温，夏季活性相对偏低，但在清晨气温最低时段及阴天仍会积极追饵。大型米诺和金属匙的快速强烈动作最易激发攻击本能。",
    recommended_area: "清冷深水区、水草边缘、入水口附近",
    recommended_depth: "2.0–4.5米",
    recommended_bait: "大型米诺12–18cm / 金属匙",
    best_time: "清晨5:00–8:00 / 阴天全天",
    activity_score: 65,
  },
};

function getLocalStrategy(style: string, fish: string): Strategy {
  const base = localStrategies[style];
  const profile = fishProfiles[fish];
  if (!profile) return base;
  return {
    ...base,
    fish_behavior: profile.behavior,
    season_pattern: profile.season_pattern,
    recommended_area: profile.recommended_area,
    recommended_depth: profile.recommended_depth,
    recommended_bait: profile.recommended_bait,
    best_time: profile.best_time,
    activity_score: profile.activity_score,
  };
}

export default function Home() {
  const [step, setStep] = useState(0);
  const [style, setStyle] = useState("路亚");
  const [fish, setFish] = useState("黑鲈");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cardDataUrl, setCardDataUrl] = useState<string | null>(null);
  const [cardGenerating, setCardGenerating] = useState(false);
  const [cardError, setCardError] = useState(false);
  const [cardErrorDetail, setCardErrorDetail] = useState("");
  const [posterIcons, setPosterIcons] = useState<Record<string, HTMLImageElement | null>>({});

  const targetFish = fish;
  const currentWeather = weather || fallbackWeather;
  const currentStrategy = useMemo(() => strategy || getLocalStrategy(style, fish), [strategy, style, fish]);

  async function detectEnvironment() {
    setStep(2);
    setDetecting(true);

    const settle = (value: Weather) => {
      setWeather(value);
      setDetecting(false);
    };

    if (!navigator.geolocation) {
      settle(fallbackWeather);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,weather_code,wind_speed_10m&temperature_unit=celsius&wind_speed_unit=kmh`;
          const placeUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=zh-CN`;
          const [weatherRes, placeRes] = await Promise.all([fetch(weatherUrl), fetch(placeUrl)]);
          const weatherJson = await weatherRes.json();
          const placeJson = await placeRes.json();
          const current = weatherJson.current;

          settle({
            city: placeJson.city || placeJson.locality || fallbackWeather.city,
            condition: weatherText[current.weather_code] || "多云",
            temperature: Math.round(current.temperature_2m),
            wind: Math.round(current.wind_speed_10m),
          });
        } catch {
          settle(fallbackWeather);
        }
      },
      () => settle(fallbackWeather),
      { enableHighAccuracy: false, timeout: 7000, maximumAge: 300000 },
    );
  }

  async function generateStrategy() {
    setStep(4);
    setGenerating(true);

    try {
      if (window.location.protocol === "file:") {
        throw new Error("静态文件预览使用本地策略");
      }

      const response = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          style,
          fish: targetFish,
          weather: currentWeather,
          hour: new Date().getHours(),
        }),
      });

      if (!response.ok) throw new Error("千帆策略生成失败");
      const data = await response.json();
      if (data.code !== 0) throw new Error("千帆策略生成失败");
      setStrategy(data.data);
    } catch {
      setStrategy(getLocalStrategy(style, targetFish));
    } finally {
      setGenerating(false);
    }
  }

  async function buildShareCard(): Promise<string> {
    // Clean fish image background and inject into template
    const rawSrc = getFishArtSrc(targetFish);
    let fishDataUrl = rawSrc || "";
    let localFish: HTMLImageElement | null = null;
    if (rawSrc) {
      try {
        const img = await loadImage(rawSrc);
        if (!img) throw new Error("load failed");
        localFish = img;
        const crop = getFishArtCrop(img);
        const cleaned = cleanFishImageBackground(img, crop);
        if (cleaned) fishDataUrl = cleaned.toDataURL("image/png");
      } catch { /* use raw */ }
    }
    const el = document.getElementById("share-card-tpl");
    if (!el) return "";
    if (document.fonts?.load) {
      await Promise.race([
        Promise.all([document.fonts.load('16px "Zpix"'), document.fonts.ready]),
        new Promise((resolve) => window.setTimeout(resolve, 1200)),
      ]).catch(() => {});
    }
    const fishImg = el.querySelector("[data-role='fish-art']") as HTMLImageElement | null;
    if (fishImg && fishDataUrl) {
      fishImg.src = fishDataUrl;
      await new Promise<void>(r => { const t = setTimeout(r, 300); fishImg.onload = () => { clearTimeout(t); r(); }; });
    }
    await inlineImagesAsDataUrls(el);
    try {
      return buildSvgShareCard(el);
    } catch {
      return buildManualSvgShareCard({
        weather: currentWeather,
        fish: targetFish,
        strategy: currentStrategy,
        fishSrc: fishDataUrl,
      });
    }
  }

  async function requestAiShareImage(): Promise<string | null> {
    if (window.location.protocol === "file:") return null;
    if (!currentStrategy.recommended_area || !currentStrategy.recommended_bait || !currentStrategy.summary) return null;

    try {
      const response = await fetch("/api/share-card-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weather: currentWeather,
          style,
          fish: targetFish,
          strategy: currentStrategy,
        }),
      });
      if (!response.ok) return null;
      const data = await response.json();
      if (data.code !== 0 || !data.fishImageDataUrl) return null;
      return data.fishImageDataUrl;
    } catch {
      return null;
    }
  }

  async function saveShareCard() {
    setCardGenerating(true);
    try {
      const dataUrl = cardDataUrl || (await buildShareCard());
      const link = document.createElement("a");
      link.download = dataUrl.startsWith("data:image/svg+xml") ? "shangyu-pixel-card.svg" : "shangyu-pixel-card.png";
      link.href = dataUrl;
      link.click();
      setSaved(true);
    } finally {
      setCardGenerating(false);
    }
  }

  async function createShareCard() {
    setSaved(false);
    setCardDataUrl(null);
    setCardError(false);
    setCardErrorDetail("");
    setCardGenerating(true);
    setStep(5);
    try {
      const dataUrl = await buildShareCard();
      if (!dataUrl) throw new Error("empty card");
      setCardDataUrl(dataUrl);
    } catch (error) {
      setCardError(true);
      setCardErrorDetail(error instanceof Error ? error.message : String(error));
      setCardDataUrl("");
    } finally {
      setCardGenerating(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6">
      <div className="lake-motion" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-md flex-col">
        <header className="flex items-center justify-between py-2">
          <div className="flex items-center gap-1.5">
            <HookSvg color="#1e2d5c" size={22} />
            <span className="text-xl font-bold tracking-widest text-slate-800">上渔</span>
          </div>
          {step > 0 && (
            <button className="rounded-full px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100" onClick={() => setStep(0)}>
              重置
            </button>
          )}
        </header>

        <AnimatePresence>
          {step === 0 && (
            <Screen key="landing" className="items-center justify-center text-center">
              <div>
                <p className="mb-6 text-sm thin-text text-slate-500">千帆智能钓鱼策略</p>
                <h1 className="text-5xl thin-text leading-tight">今天怎么钓？</h1>
                <p className="mx-auto mt-6 max-w-xs whitespace-pre-line text-xl thin-text leading-8 text-slate-600">
                  {"基于当前位置与天气，\n生成今日钓鱼策略。"}
                </p>
                <PrimaryButton className="mt-12" onClick={() => setStep(1)}>
                  开始
                  <ChevronRight size={18} />
                </PrimaryButton>
              </div>
            </Screen>
          )}

          {step === 1 && (
            <Screen key="style">
              <StepTitle eyebrow="01" title="选择钓法" />
              <div className="mt-9 grid gap-4">
                {fishingStyles.map((item) => (
                  <ChoiceCard key={item} selected={style === item} onClick={() => setStyle(item)}>
                    <span>{item}</span>
                    {style === item && <Check size={18} />}
                  </ChoiceCard>
                ))}
              </div>
              <PrimaryButton className="mt-auto" onClick={detectEnvironment}>
                继续
                <LocateFixed size={17} />
              </PrimaryButton>
            </Screen>
          )}

          {step === 2 && (
            <Screen key="environment">
              <StepTitle eyebrow="02" title="今日天气" />
              <div className="mt-12 soft-card rounded-[28px] p-7">
                {detecting ? (
                  <div className="space-y-5">
                    <div className="h-8 w-44 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-5 w-32 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-5 w-24 animate-pulse rounded-full bg-slate-100" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl thin-text">{currentWeather.city}</h2>
                    <p className="mt-5 text-xl thin-text text-slate-600">
                      {currentWeather.condition} · {currentWeather.temperature}°C
                    </p>
                    <p className="mt-2 text-xl thin-text text-slate-600">风 {currentWeather.wind} 千米/时</p>
                  </>
                )}
              </div>
              <PrimaryButton className="mt-auto" disabled={detecting} onClick={() => setStep(3)}>
                继续
                <ChevronRight size={18} />
              </PrimaryButton>
            </Screen>
          )}

          {step === 3 && (
            <Screen key="fish">
              <StepTitle eyebrow="03" title="目标鱼" />
              <div className="mt-9 grid gap-4">
                {fishOptions.map((item) => (
                  <ChoiceCard
                    key={item}
                    selected={fish === item}
                    onClick={() => setFish(item)}
                  >
                    <span>{item}</span>
                    {fish === item && <Check size={18} />}
                  </ChoiceCard>
                ))}
              </div>
              <PrimaryButton className="mt-auto" onClick={generateStrategy}>
                生成策略
                <ChevronRight size={18} />
              </PrimaryButton>
            </Screen>
          )}

          {step === 4 && (
            <Screen key="result">
              <StepTitle eyebrow="04" title="今日策略" />
              <div className="mt-9 soft-card rounded-[30px] p-7">
                {generating ? (
                  <div className="space-y-6 py-2">
                    <div className="h-5 w-28 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-8 w-44 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-5 w-24 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-8 w-36 animate-pulse rounded-full bg-slate-100" />
                  </div>
                ) : (
                  <>
                    <ResultLine label="推荐区域" value={currentStrategy.recommended_area} />
                    <ResultLine label="推荐水深" value={currentStrategy.recommended_depth} />
                    <ResultLine label="推荐饵料" value={currentStrategy.recommended_bait} />
                    <ResultLine label="操作方式" value={currentStrategy.retrieve_style} />
                    <ResultLine label="最佳时间" value={currentStrategy.best_time} />
                    <ResultLine label="活跃度" value={`${currentStrategy.activity_score} / 100`} />
                    <div className="pt-6">
                      <p className="text-sm thin-text text-slate-400">综合建议</p>
                      <p className="mt-3 text-2xl thin-text leading-9">&ldquo;{currentStrategy.summary}&rdquo;</p>
                    </div>
                  </>
                )}
              </div>
              <PrimaryButton
                className="mt-auto"
                disabled={generating}
                onClick={createShareCard}
              >
                生成分享卡
                <ChevronRight size={18} />
              </PrimaryButton>
            </Screen>
          )}

          {step === 5 && (
            <Screen key="share">
              <StepTitle eyebrow="05" title="分享卡" />
              <div className="mt-6 flex-1 overflow-y-auto pb-2">
                {cardDataUrl ? (
                  <img
                    src={cardDataUrl}
                    alt="分享卡"
                    className="w-full rounded-[20px] shadow-2xl shadow-black/40"
                  />
                ) : cardError ? (
                  <div className="flex aspect-[9/13] w-full flex-col items-center justify-center rounded-[20px] border border-red-200 bg-red-50 px-8 text-center text-lg thin-text leading-8 text-red-600">
                    <span>生成失败，请返回后再试一次</span>
                    {cardErrorDetail ? (
                      <span className="mt-4 max-w-full break-words text-xs leading-5 text-red-400">{cardErrorDetail}</span>
                    ) : null}
                  </div>
                ) : (
                  <div className="flex aspect-[9/13] w-full items-center justify-center rounded-[20px] border border-slate-200 bg-slate-50 text-lg thin-text text-slate-400">
                    正在生成…
                  </div>
                )}
              </div>
              <PrimaryButton className="mt-4 shrink-0" disabled={cardGenerating} onClick={saveShareCard}>
                {cardGenerating ? "生成中" : saved ? "已保存" : "保存至相册"}
                <Download size={17} />
              </PrimaryButton>
            </Screen>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden share card template used for SVG generation */}
      <div style={{ position: 'fixed', left: -9999, top: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div id="share-card-tpl" className="scard">

          {/* Corner brackets */}
          {(['tl','tr','bl','br'] as const).map(pos => (
            <div key={pos} className={`scard-corner ${pos}`}>
              <svg viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="11" height="2" fill="#b8d76b"/>
                <rect width="2" height="11" fill="#b8d76b"/>
              </svg>
            </div>
          ))}

          {/* Weather top row */}
          <div className="scard-top-row">
            {[
              { icon: cardIconDataUrls.calendar, label: '日期', value: formatDate() },
              { icon: getWeatherIcon(currentWeather.condition), label: '天气', value: currentWeather.condition },
              { icon: cardIconDataUrls.thermometer, label: '温度', value: `${currentWeather.temperature}°C` },
              { icon: cardIconDataUrls.wind, label: '风速', value: currentWeather.wind <= 12 ? '微风' : `${currentWeather.wind}km/h` },
              { icon: cardIconDataUrls.sunset, label: '时间段', value: getTimePeriod() },
            ].map(({ icon, label, value }, i) => (
              <div key={i} className="scard-stat">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon} alt="" className="scard-stat-icon" />
                <div>
                  <div className="scard-stat-label">{label}</div>
                  <div className="scard-stat-value">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Title */}
          <div className="scard-title-row">
            <div className="scard-title-main">{currentStrategy.title}</div>
          </div>
          <div className="scard-subtitle-row">
            <span className="scard-subtitle-label">目标鱼</span>
            <span className="scard-subtitle-value">{targetFish}</span>
          </div>

          {/* Hero: fish art */}
          <div className="scard-hero">
            <div className="scard-hero-bg" />
            <div className="scard-bubble b1" />
            <div className="scard-bubble b2" />
            <div className="scard-bubble b3" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cardIconDataUrls.grassArt} alt="" style={{ position: 'absolute', bottom: 0, left: 28, width: 96, height: 'auto', imageRendering: 'pixelated' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cardIconDataUrls.grassArt} alt="" style={{ position: 'absolute', bottom: 0, right: 28, width: 96, height: 'auto', imageRendering: 'pixelated', transform: 'scaleX(-1)' }} />
            <div className="scard-water-line one" />
            <div className="scard-water-line two" />
            <div className="scard-fish-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img data-role="fish-art" alt="fish" className="scard-hero-fish" />
            </div>
          </div>

          {/* Info grid */}
          <div className="scard-info-grid">
            {[
              { icon: getStructureIcon(currentStrategy.recommended_area), label: '推荐结构', value: extractStructure(currentStrategy.recommended_area), extra: '' },
              { icon: cardIconDataUrls.mapPin,   label: '推荐区域', value: currentStrategy.recommended_area, extra: '' },
              { icon: cardIconDataUrls.depth,    label: '推荐水深', value: currentStrategy.recommended_depth, extra: '' },
              { icon: getBaitIcon(currentStrategy.recommended_bait), label: '推荐饵料', value: currentStrategy.recommended_bait, extra: '' },
              { icon: cardIconDataUrls.reel,     label: '操作方式', value: currentStrategy.retrieve_style, extra: '' },
              { icon: cardIconDataUrls.clock,    label: '最佳时间', value: currentStrategy.best_time, extra: '' },
              { icon: cardIconDataUrls.activityStar, label: '今日状态', value: currentStrategy.fish_behavior, extra: 'activity' },
            ].map(({ icon, label, value, extra }, i) => (
              <div key={i} className={`scard-info-cell ${extra === 'activity' ? 'scard-info-cell-wide' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <span className="scard-icon-box"><img src={icon} alt="" /></span>
                <div className="scard-info-text">
                  {extra === 'activity' ? (
                    <>
                      <div className="scard-info-label-row">
                        <span className="scard-info-label">{label}</span>
                        <span className="scard-activity-num">{currentStrategy.activity_score}<span>/100</span></span>
                      </div>
                      <div className="scard-info-value-row">
                        <span className="scard-info-value">{value}</span>
                        <div className="scard-meter">
                          {Array.from({ length: 12 }).map((_, mi) => (
                            <span
                              key={mi}
                              style={{
                                background: mi < Math.round(currentStrategy.activity_score / 100 * 12) ? '#7eb337' : '#1c324f',
                                borderColor: mi < Math.round(currentStrategy.activity_score / 100 * 12) ? '#5a8a22' : '#233a55',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="scard-info-label">{label}</div>
                      <div className="scard-info-value">{value}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Season section */}
          <div className="scard-section-box">
            <div className="scard-scene">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cardIconDataUrls.seasonScene} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            </div>
            <div className="scard-section-body">
              <div className="scard-section-header">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <span className="scard-section-icon"><img src={cardIconDataUrls.leaf} alt="" /></span>
                <span className="scard-section-title-wrap"><span className="scard-section-title">季节习性</span></span>
              </div>
              <div className="scard-section-text">{currentStrategy.season_pattern}</div>
            </div>
          </div>

          {/* Tip section */}
          <div className="scard-section-box">
            <div className="scard-scene">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cardIconDataUrls.shoreScene} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            </div>
            <div className="scard-section-body">
              <div className="scard-section-header">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <span className="scard-section-icon"><img src={cardIconDataUrls.fisherman} alt="" /></span>
                <span className="scard-section-title-wrap"><span className="scard-section-title">钓手建议</span></span>
              </div>
              <div className="scard-section-text">{currentStrategy.casting_tip || currentStrategy.summary}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="scard-footer" style={{ justifyContent: 'space-between', padding: '10px 4px 4px' }}>
            <span style={{ fontSize: '16px', color: '#b8d76b', letterSpacing: '3px', fontFamily: 'Zpix, sans-serif' }}>上渔</span>
            <span style={{ fontSize: '13px', color: '#b8c3cc', letterSpacing: '1px', fontFamily: 'Zpix, sans-serif' }}>渔悦大学生钓鱼交流平台</span>
          </div>
        </div>
      </div>
    </main>
  );
}

function Screen({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex flex-1 flex-col pb-4 pt-10 ${className}`}>
      {children}
    </section>
  );
}

async function inlineImagesAsDataUrls(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll("img[src]")) as HTMLImageElement[];
  await Promise.all(
    imgs.map(async (img) => {
      const src = img.src;
      if (!src || src.startsWith("data:")) return;
      try {
        const resp = await fetch(src);
        if (!resp.ok) return;
        const blob = await resp.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        img.src = dataUrl;
      } catch { /* keep original */ }
    }),
  );
}

function buildSvgShareCard(el: HTMLElement) {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.setAttribute("xmlns", "http://www.w3.org/1999/xhtml");
  clone.querySelectorAll("img").forEach((img) => {
    const src = img.getAttribute("src");
    if (src?.startsWith("/")) img.setAttribute("src", `${window.location.origin}${src}`);
  });

  const width = Math.ceil(el.getBoundingClientRect().width || 720);
  const height = Math.ceil(el.scrollHeight || el.getBoundingClientRect().height || 1184);
  let cssText = "";
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      Array.from(sheet.cssRules).forEach((rule) => {
        cssText += `${rule.cssText}\n`;
      });
    } catch {
      /* Ignore stylesheets the browser does not expose. */
    }
  });
  cssText = cssText
    .replaceAll('url("/', `url("${window.location.origin}/`)
    .replaceAll("url('/", `url('${window.location.origin}/`)
    .replaceAll("url(/", `url(${window.location.origin}/`);

  const style = document.createElement("style");
  style.textContent = cssText;
  clone.prepend(style);

  const html = new XMLSerializer().serializeToString(clone);
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<foreignObject width="100%" height="100%">${html}</foreignObject>`,
    "</svg>",
  ].join("");
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildManualSvgShareCard({
  weather,
  fish,
  strategy,
  fishSrc,
}: {
  weather: Weather;
  fish: string;
  strategy: Strategy;
  fishSrc: string;
}) {
  const esc = (value: string | number) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  const imageHref = fishSrc.startsWith("data:") ? fishSrc : `${window.location.origin}${fishSrc}`;
  const statY = 48;
  const info = [
    ["推荐结构", extractStructure(strategy.recommended_area), 74, 450],
    ["推荐区域", strategy.recommended_area, 396, 450],
    ["推荐水深", strategy.recommended_depth, 74, 514],
    ["推荐饵料", strategy.recommended_bait, 396, 514],
    ["操作方式", strategy.retrieve_style, 74, 578],
    ["最佳时间", strategy.best_time, 396, 578],
  ];
  const infoSvg = info.map(([label, value, x, y]) => `
    <text x="${x}" y="${y}" class="label">${esc(label)}</text>
    <text x="${x}" y="${Number(y) + 28}" class="value">${esc(value)}</text>
  `).join("");
  const activeBlocks = Math.round(strategy.activity_score / 100 * 12);
  const meter = Array.from({ length: 12 }).map((_, index) => {
    const x = 428 + index * 16;
    return `<rect x="${x}" y="664" width="13" height="13" fill="${index < activeBlocks ? "#7eb337" : "#1c324f"}" stroke="#233a55" stroke-width="1"/>`;
  }).join("");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1080" viewBox="0 0 720 1080">
  <style>
    @font-face{font-family:Zpix;src:url("${window.location.origin}/fonts/ark-pixel.otf") format("opentype");}
    text{font-family:Zpix,"Noto Sans SC",sans-serif;dominant-baseline:hanging}
    .stat-label{fill:#b8d76b;font-size:16px;letter-spacing:2px}
    .stat-value{fill:#f4f6ec;font-size:15px}
    .label{fill:#b8d76b;font-size:17px;letter-spacing:2px}
    .value{fill:#f4f6ec;font-size:15px}
    .body{fill:#f4f6ec;font-size:15px}
  </style>
  <rect width="720" height="1080" fill="#110d37"/>
  <rect x="20" y="20" width="680" height="1040" fill="#110d37" stroke="#3a3175" stroke-width="2"/>
  <line x1="48" y1="104" x2="672" y2="104" stroke="#4f7894" stroke-width="2" stroke-dasharray="4 6"/>

  <text x="66" y="${statY}" class="stat-label">日期</text><text x="66" y="${statY + 28}" class="stat-value">${esc(formatDate())}</text>
  <text x="190" y="${statY}" class="stat-label">天气</text><text x="190" y="${statY + 28}" class="stat-value">${esc(weather.condition)}</text>
  <text x="314" y="${statY}" class="stat-label">温度</text><text x="314" y="${statY + 28}" class="stat-value">${esc(weather.temperature)}°C</text>
  <text x="438" y="${statY}" class="stat-label">风速</text><text x="438" y="${statY + 28}" class="stat-value">微风</text>
  <text x="562" y="${statY}" class="stat-label">时间段</text><text x="562" y="${statY + 28}" class="stat-value">${esc(getTimePeriod())}</text>

  <text x="360" y="140" text-anchor="middle" fill="#b8d76b" font-size="48" letter-spacing="6">${esc(strategy.title)}</text>
  <text x="290" y="214" fill="#b8c3cc" font-size="19" letter-spacing="3">目标鱼</text>
  <rect x="370" y="207" width="72" height="32" fill="#0f1230" stroke="#5a8a22" stroke-width="2"/>
  <text x="386" y="214" fill="#f4f6ec" font-size="19" letter-spacing="4">${esc(fish)}</text>

  <rect x="50" y="262" width="620" height="188" fill="#0d1230"/>
  <circle cx="104" cy="300" r="10" fill="none" stroke="#7bd4ff" stroke-width="4"/>
  <rect x="88" y="420" width="112" height="14" fill="#49351e"/>
  <rect x="520" y="420" width="112" height="14" fill="#49351e"/>
  <image href="${esc(imageHref)}" x="96" y="248" width="540" height="230" preserveAspectRatio="xMidYMid meet"/>

  <rect x="50" y="468" width="620" height="248" fill="#0f1230" stroke="#3a3175" stroke-width="2"/>
  <line x1="360" y1="468" x2="360" y2="652" stroke="#233a55" stroke-dasharray="3 5"/>
  <line x1="50" y1="532" x2="670" y2="532" stroke="#233a55" stroke-dasharray="3 5"/>
  <line x1="50" y1="596" x2="670" y2="596" stroke="#233a55" stroke-dasharray="3 5"/>
  <line x1="50" y1="652" x2="670" y2="652" stroke="#233a55" stroke-dasharray="3 5"/>
  ${infoSvg}
  <text x="74" y="666" class="label">今日状态</text>
  <text x="74" y="694" class="value">${esc(strategy.fish_behavior)}</text>
  <text x="610" y="650" fill="#f4f6ec" font-size="24" text-anchor="end">${esc(strategy.activity_score)}<tspan font-size="13" fill="#b8c3cc">/100</tspan></text>
  ${meter}

  <rect x="50" y="738" width="620" height="112" fill="#0f1230" stroke="#3a3175" stroke-width="2"/>
  <rect x="76" y="760" width="160" height="76" fill="#d86832"/>
  <rect x="274" y="762" width="128" height="42" fill="#7eb337"/>
  <text x="298" y="772" fill="#fff" font-size="19" letter-spacing="4">季节习性</text>
  <text x="256" y="818" class="body">${esc(strategy.season_pattern)}</text>

  <rect x="50" y="866" width="620" height="112" fill="#0f1230" stroke="#3a3175" stroke-width="2"/>
  <rect x="76" y="894" width="160" height="56" fill="#32a8d8"/>
  <rect x="274" y="890" width="128" height="42" fill="#7eb337"/>
  <text x="298" y="900" fill="#fff" font-size="19" letter-spacing="4">钓手建议</text>
  <text x="256" y="946" class="body">${esc(strategy.casting_tip || strategy.summary)}</text>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function StepTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-sm thin-text text-[#5a7a00]">{eyebrow}</p>
      <h1 className="mt-4 text-4xl thin-text">{title}</h1>
    </div>
  );
}

function PrimaryButton({
  children,
  className = "",
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`flex w-full items-center justify-center gap-2 rounded-full bg-[#D6E264] px-6 py-5 text-base font-medium text-[#071426] shadow-[0_18px_42px_rgba(214,226,100,0.22)] transition duration-300 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function ChoiceCard({ children, selected, onClick }: { children: React.ReactNode; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex min-h-24 items-center justify-between rounded-[28px] border px-6 text-left text-2xl thin-text transition duration-300 ${
        selected
          ? "border-[#D6E264] bg-[#D6E264]/20 text-slate-900 shadow-[0_8px_24px_rgba(90,122,0,0.15)]"
          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 py-5 first:pt-0">
      <p className="text-sm thin-text text-slate-400">{label}</p>
      <p className="mt-2 text-2xl thin-text">{value}</p>
    </div>
  );
}

function formatDate() {
  return new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
}

function getWeatherIcon(condition: string): string {
  if (condition.includes("晴")) return cardIconDataUrls.sunny;
  if (condition.includes("雷") || condition.includes("雷雨")) return cardIconDataUrls.thunderstorm;
  if (condition.includes("雨") || condition.includes("毛雨")) return cardIconDataUrls.rain;
  return cardIconDataUrls.cloud;
}

function getBaitIcon(bait: string): string {
  // 人工假饵（路亚、拟饵）
  if (bait.includes("软虫") || bait.includes("假饵") || bait.includes("路亚") ||
      bait.includes("米诺") || bait.includes("VIB") || bait.includes("铁板") ||
      bait.includes("若虫") || bait.includes("毛钩") || bait.includes("匙") ||
      bait.includes("勺") || bait.includes("拟饵") || bait.includes("水面系"))
    return cardIconDataUrls.baitLure;
  // 荤腥 / 动物饵
  if (bait.includes("腥") || bait.includes("红虫") || bait.includes("蚯蚓") ||
      bait.includes("沙蚕") || bait.includes("鱼肉") || bait.includes("虾") ||
      bait.includes("活饵") || bait.includes("虫"))
    return cardIconDataUrls.baitWorm;
  // 植物 / 谷物饵（兜底）
  return cardIconDataUrls.baitDough;
}

function getStructureIcon(area: string): string {
  if (area.includes("礁") || area.includes("石")) return cardIconDataUrls.rocky;
  if (area.includes("倒木") || area.includes("木")) return cardIconDataUrls.log;
  if (area.includes("码头") || area.includes("桥")) return cardIconDataUrls.bridge;
  if (area.includes("草")) return cardIconDataUrls.grassArt;
  return cardIconDataUrls.mapPin2;
}

const posterLayout = {
  canvas: { width: 1080, height: 1536 },
  border: { x: 64, y: 78, width: 952, height: 1382 },
  topBar: { x: 100, y: 118, width: 880, height: 78 },
  topDivider: { y: 214, x1: 100, x2: 980 },
  title: { x: 540, y: 272, maxWidth: 820, fontSize: 60 },
  titleDots: { x: 220, y: 300, width: 640, size: 6 },
  fish: { x: 130, y: 308, s: 9 },
  fishArt: { x: 92, y: 304, width: 628, height: 240 },
  targetBox: { x: 742, y: 296, width: 210, height: 256 },
  infoPanel: { x: 64, y: 558, width: 952, height: 390 },
  infoGrid: {
    leftX: 108,
    rightX: 580,
    rowY: [600, 686, 772, 858],
    iconSize: 52,
    labelFontSize: 26,
    valueFontSize: 24,
  },
  seasonPanel: { x: 64, y: 970, width: 952, height: 165 },
  seasonImage: { x: 84, y: 992, width: 210, height: 118 },
  seasonLabel: { x: 336, y: 984 },
  seasonText: { x: 336, y: 1030, width: 606, fontSize: 22 },
  tipPanel: { x: 64, y: 1154, width: 952, height: 160 },
  fisherman: { x: 80, y: 1167, width: 185, height: 120 },
  tipLabel: { x: 322, y: 1158 },
  tipText: { x: 322, y: 1200, width: 626, fontSize: 24 },
  footer: { x: 540, y: 1342, fontSize: 22 },
};

const posterIconSpec = {
  date: { width: 56, height: 56 },
  weather: { width: 64, height: 56 },
  temperature: { width: 36, height: 64 },
  wind: { width: 64, height: 48 },
  time: { width: 64, height: 56 },
  titleArrow: { width: 40, height: 40 },
  bubble: { min: 28, max: 40 },
  grass: { width: 90, height: 110 },
  log: { width: 120, height: 80 },
  targetFish: { width: 110, height: 50 },
  status: { width: 64, height: 64 },
  star: { width: 24, height: 24 },
  area: { width: 64, height: 64 },
  depth: { width: 64, height: 64 },
  bait: { width: 72, height: 54 },
  reel: { width: 64, height: 64 },
  clock: { width: 64, height: 64 },
  structure: { width: 80, height: 56 },
  sun: { width: 56, height: 56 },
  progressBlock: { width: 18, height: 18 },
  leaf: { width: 28, height: 28 },
  seasonImage: { width: 220, height: 145 },
  bulb: { width: 36, height: 36 },
  fisherman: { width: 205, height: 120 },
  footerFish: { width: 64, height: 28 },
  dividerDot: { width: 6, height: 6 },
  borderCorner: { width: 48, height: 48 },
} as const;

function drawPixelPoster(
  ctx: CanvasRenderingContext2D,
  data: {
    weather: Weather;
    style: string;
    fish: string;
    strategy: Strategy;
    localFish: HTMLImageElement | null;
    icons: Record<string, HTMLImageElement | null>;
  },
) {
  const { weather, fish, strategy, localFish, icons } = data;
  const pl = posterLayout;
  const navy = "#061526";
  const deep = "#020b15";
  const panel = "#0b2033";
  const line = "#4f7894";
  const lime = "#d6e264";
  const white = "#f4f6ec";
  const muted = "#aeb9c0";
  const gold = "#ffc84d";

  const bg = ctx.createLinearGradient(0, 0, 0, pl.canvas.height);
  bg.addColorStop(0, navy);
  bg.addColorStop(1, deep);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, pl.canvas.width, pl.canvas.height);
  ctx.imageSmoothingEnabled = false;

  drawPixelBorder(ctx, pl.border.x, pl.border.y, pl.border.width, pl.border.height, line);
  drawTopBar(ctx, pl.topBar, pl.topDivider, weather, icons, lime, white, muted, line, gold);

  ctx.fillStyle = lime;
  ctx.textAlign = "center";
  fitText(ctx, strategy.title, pl.title.x, pl.title.y, pl.title.maxWidth, pl.title.fontSize, "bold", "center");
  ctx.textAlign = "left";
  dottedLine(ctx, pl.titleDots.x, pl.titleDots.y, pl.titleDots.width, lime, pl.titleDots.size);

  drawBubbles(ctx);
  drawWaterPlants(ctx, icons);
  if (localFish) {
    drawFishOnlyArt(ctx, localFish, pl.fishArt);
  } else {
    drawPixelFishAt(ctx, pl.fish.x, pl.fish.y, pl.fish.s, fish);
  }
  drawTargetBox(ctx, pl.targetBox, fish, icons, lime, white);
  drawInfoPanel(ctx, pl.infoPanel, icons, panel, line, lime, white, muted, gold, strategy);
  drawSeasonPanel(ctx, pl.seasonPanel, icons, panel, line, lime, white, strategy);
  drawTipPanel(ctx, pl.tipPanel, icons, panel, line, lime, white, strategy);

  ctx.fillStyle = lime;
  ctx.font = `bold ${pl.footer.fontSize}px monospace`;
  ctx.textAlign = "left";
  ctx.fillText("⚓ 上渔", pl.footer.x - 460, pl.footer.y);
  ctx.textAlign = "right";
  ctx.fillStyle = white;
  ctx.font = `${pl.footer.fontSize - 2}px monospace`;
  ctx.fillText("渔悦大学生钓鱼交流平台", pl.footer.x + 460, pl.footer.y);
  ctx.textAlign = "left";
}

function drawTopBar(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
  divider: { y: number; x1: number; x2: number },
  weather: Weather,
  icons: Record<string, HTMLImageElement | null>,
  lime: string,
  white: string,
  muted: string,
  line: string,
  gold: string,
) {
  const { x, y, width: w, height: h } = rect;
  const items: [string, string, string][] = [
    ["date", "日期", formatDate()],
    ["weather", "天气", weather.condition],
    ["temperature", "温度", `${weather.temperature}°C`],
    ["wind", "风速", weather.wind <= 12 ? "微风" : `${weather.wind}km/h`],
    ["time", "时间段", getTimePeriod()],
  ];
  ctx.textAlign = "left";
  const slot = w / items.length;
  items.forEach(([icon, label, value], index) => {
    const itemX = x + 12 + index * slot;
    drawScaledTopIcon(ctx, icon, itemX, y + 8, icons, white, lime, gold, muted, 0.72);
    ctx.fillStyle = lime;
    ctx.font = "bold 22px 'Microsoft YaHei', sans-serif";
    ctx.fillText(label, itemX + 52, y + 26);
    ctx.fillStyle = white;
    ctx.font = "24px 'Microsoft YaHei', sans-serif";
    ctx.fillText(value, itemX + 52, y + 56);
    if (index < items.length - 1) dashedVLine(ctx, x + (index + 1) * slot, y + 10, h - 20, line);
  });
  ctx.strokeStyle = line;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(divider.x1, divider.y);
  ctx.lineTo(divider.x2, divider.y);
  ctx.stroke();
}

function drawInfoPanel(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
  icons: Record<string, HTMLImageElement | null>,
  panel: string,
  line: string,
  lime: string,
  white: string,
  muted: string,
  gold: string,
  strategy: Strategy,
) {
  const { x, y, width: w, height: h } = rect;
  const grid = posterLayout.infoGrid;
  pixelPanel(ctx, x, y, w, h, panel, line);
  dashedVLine(ctx, x + w / 2, y + 24, h - 48, "rgba(79,120,148,0.55)");

  const cells: [string, string, string, string][] = [
    ["status", "今日状态", strategy.fish_behavior, "stars"],
    ["area", "推荐区域", strategy.recommended_area, ""],
    ["depth", "推荐水深", strategy.recommended_depth, ""],
    ["bait", "推荐饵料", strategy.recommended_bait, ""],
    ["reel", "操作方式", strategy.retrieve_style, ""],
    ["clock", "最佳时间", strategy.best_time, ""],
    ["structure", "推荐结构", extractStructure(strategy.recommended_area), ""],
    ["sun", "活跃度", `${strategy.activity_score} /100`, "progress"],
  ];

  cells.forEach(([icon, label, value, extra], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const cx = col === 0 ? grid.leftX : grid.rightX;
    const cy = grid.rowY[row];
    const textX = cx + grid.iconSize + 10;
    const textWidth = col === 0 ? 330 : 320;
    drawInfoIcon(ctx, icon, cx, cy - 20, icons, lime, gold, white, grid.iconSize);
    ctx.fillStyle = lime;
    ctx.font = `bold ${grid.labelFontSize}px 'Microsoft YaHei', sans-serif`;
    ctx.fillText(label, textX, cy - 2);
    ctx.fillStyle = white;
    ctx.font = `${grid.valueFontSize}px 'Microsoft YaHei', sans-serif`;
    wrapText(ctx, value, textX, cy + 30, textWidth, grid.valueFontSize + 4, 2);
    if (extra === "stars") {
      drawStars(ctx, textX, cy + 58, strategy.activity_score, icons, gold, muted, 22);
    } else if (extra === "progress") {
      drawProgressBlocks(ctx, textX, cy + 58, strategy.activity_score, lime, line, 15);
    }
  });
}

function drawSeasonPanel(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
  icons: Record<string, HTMLImageElement | null>,
  panel: string,
  line: string,
  lime: string,
  white: string,
  strategy: Strategy,
) {
  const { x, y, width: w, height: h } = rect;
  const pl = posterLayout;
  pixelPanel(ctx, x, y, w, h, panel, line);
  drawMiniLake(ctx, pl.seasonImage.x, pl.seasonImage.y, pl.seasonImage.width, pl.seasonImage.height);
  drawIconImage(ctx, icons.leaf, pl.seasonLabel.x - 32, pl.seasonLabel.y + 10, 24, 24);
  labelRibbon(ctx, pl.seasonLabel.x, pl.seasonLabel.y, 170, 38, "季节习性", lime, panel, 24);
  ctx.fillStyle = white;
  ctx.font = `${pl.seasonText.fontSize}px 'Microsoft YaHei', sans-serif`;
  wrapText(ctx, strategy.season_pattern, pl.seasonText.x, pl.seasonText.y, pl.seasonText.width, pl.seasonText.fontSize + 8, 2);
}

function drawTipPanel(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
  icons: Record<string, HTMLImageElement | null>,
  panel: string,
  line: string,
  lime: string,
  white: string,
  strategy: Strategy,
) {
  const { x, y, width: w, height: h } = rect;
  const pl = posterLayout;
  pixelPanel(ctx, x, y, w, h, panel, line);
  drawAngler(ctx, { x: pl.fisherman.x, y: pl.fisherman.y, width: pl.fisherman.width, height: pl.fisherman.height }, icons);
  drawIconImage(ctx, icons.bulb, pl.tipLabel.x - 32, pl.tipLabel.y + 10, 24, 24);
  labelRibbon(ctx, pl.tipLabel.x, pl.tipLabel.y, 170, 38, "钓手建议", lime, panel, 24);
  ctx.fillStyle = white;
  ctx.font = `${pl.tipText.fontSize}px 'Microsoft YaHei', sans-serif`;
  wrapText(ctx, strategy.casting_tip || strategy.summary, pl.tipText.x, pl.tipText.y, pl.tipText.width, pl.tipText.fontSize + 6, 2);
}

function drawTargetBox(
  ctx: CanvasRenderingContext2D,
  rect: { x: number; y: number; width: number; height: number },
  fish: string,
  icons: Record<string, HTMLImageElement | null>,
  lime: string,
  white: string,
) {
  const { x, y, width: w, height: h } = rect;
  pixelRect(ctx, x, y, w, h, "rgba(9,31,45,0.92)");
  ctx.strokeStyle = lime;
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = lime;
  ctx.textAlign = "center";
  ctx.font = "bold 28px 'Microsoft YaHei', sans-serif";
  ctx.fillText("目标鱼", x + w / 2, y + 48);
  ctx.fillStyle = white;
  fitText(ctx, fish, x + w / 2, y + 102, w - 24, 42, "bold", "center");
  if (!drawIconImage(ctx, icons.fishSprite || icons.fish, x + 16, y + 130, 118, 52)) {
    drawTinyFish(ctx, x + 12, y + 125, fish);
  }
  ctx.textAlign = "left";
}

function drawScaledTopIcon(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  icons: Record<string, HTMLImageElement | null>,
  white: string,
  lime: string,
  gold: string,
  muted: string,
  scale: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawTopIcon(ctx, type, 0, 0, icons, white, lime, gold, muted);
  ctx.restore();
}

function drawTopIcon(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  icons: Record<string, HTMLImageElement | null>,
  white: string,
  lime: string,
  gold: string,
  muted: string,
) {
  if (type === "date") {
    const s = posterIconSpec.date;
    if (drawIconImage(ctx, icons.calendar, x, y, s.width, s.height)) return;
    pixelRect(ctx, x, y + 6, s.width, s.height - 8, white);
    pixelRect(ctx, x + 8, y + 20, s.width - 16, s.height - 28, "#0b2033");
    pixelRect(ctx, x + 8, y + 8, s.width - 16, 10, gold);
    pixelRect(ctx, x + 16, y, 6, 14, gold);
    pixelRect(ctx, x + 34, y, 6, 14, gold);
  } else if (type === "weather") {
    const s = posterIconSpec.weather;
    if (drawIconImage(ctx, icons.cloud, x, y, s.width, s.height)) return;
    ctx.strokeStyle = muted;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x + 26, y + 32, 15, Math.PI, Math.PI * 2);
    ctx.arc(x + 42, y + 30, 18, Math.PI, Math.PI * 2);
    ctx.arc(x + 54, y + 36, 11, Math.PI, Math.PI * 2);
    ctx.stroke();
    pixelRect(ctx, x + 16, y + 36, s.width - 18, 5, muted);
  } else if (type === "temperature") {
    const s = posterIconSpec.temperature;
    if (drawIconImage(ctx, icons.thermometer, x + 10, y - 2, s.width, s.height)) return;
    pixelRect(ctx, x + 13, y, 10, s.height - 18, white);
    pixelRect(ctx, x + 8, y + s.height - 24, 20, 20, gold);
    pixelRect(ctx, x + 16, y + 8, 4, s.height - 28, gold);
    pixelRect(ctx, x + 26, y + 4, 8, 4, white);
    pixelRect(ctx, x + 26, y + 20, 8, 4, white);
  } else if (type === "wind") {
    const s = posterIconSpec.wind;
    if (drawIconImage(ctx, icons.wind, x, y + 4, s.width, s.height)) return;
    ctx.strokeStyle = white;
    ctx.lineWidth = 5;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.moveTo(x, y + 14 + i * 14);
      ctx.quadraticCurveTo(x + 24, y + 2 + i * 14, x + s.width, y + 14 + i * 14);
      ctx.stroke();
    }
  } else {
    const s = posterIconSpec.time;
    if (drawIconImage(ctx, icons.sunset, x, y, s.width, s.height)) return;
    ctx.fillStyle = gold;
    ctx.beginPath();
    ctx.arc(x + 32, y + 30, 24, Math.PI, Math.PI * 2);
    ctx.fill();
    pixelRect(ctx, x + 6, y + 30, s.width - 12, 5, white);
  }
}

function drawInfoIcon(ctx: CanvasRenderingContext2D, type: string, x: number, y: number, icons: Record<string, HTMLImageElement | null>, lime: string, gold: string, white: string, size = 64) {
  if (size !== 64) {
    const scale = size / 64;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    drawInfoIcon(ctx, type, 0, 0, icons, lime, gold, white, 64);
    ctx.restore();
    return;
  }

  if (type === "status") {
    if (!drawIconImage(ctx, icons.radar, x, y, posterIconSpec.status.width, posterIconSpec.status.height)) drawRadar(ctx, x, y, lime);
  } else if (type === "area") {
    if (!drawIconImage(ctx, icons.mapPin, x, y, posterIconSpec.area.width, posterIconSpec.area.height)) drawMapPin(ctx, x, y, lime, gold);
  } else if (type === "depth") {
    if (!drawIconImage(ctx, icons.depth, x, y, posterIconSpec.depth.width, posterIconSpec.depth.height)) drawDepthGauge(ctx, x, y, lime, white);
  } else if (type === "bait") {
    if (!drawIconImage(ctx, icons.fish, x - 2, y + 5, posterIconSpec.bait.width, posterIconSpec.bait.height)) drawWorm(ctx, x, y, "#e6503f", gold);
  } else if (type === "reel") {
    if (!drawIconImage(ctx, icons.reel, x, y, posterIconSpec.reel.width, posterIconSpec.reel.height)) drawReel(ctx, x, y, lime, white);
  } else if (type === "clock") {
    if (!drawIconImage(ctx, icons.clock, x, y, posterIconSpec.clock.width, posterIconSpec.clock.height)) drawClock(ctx, x, y, lime);
  } else if (type === "structure") {
    if (!drawIconImage(ctx, icons.log, x - 6, y + 4, posterIconSpec.structure.width, posterIconSpec.structure.height)) drawStructureIcon(ctx, x, y, lime);
  }
  else if (!drawIconImage(ctx, icons.sun, x, y, posterIconSpec.sun.width, posterIconSpec.sun.height)) drawSmallSun(ctx, x, y, gold);
}

function drawRadar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x + 32, y + 32, 24, 0, Math.PI * 2);
  ctx.stroke();
  pixelRect(ctx, x + 28, y + 28, 8, 8, color);
  ctx.beginPath();
  ctx.moveTo(x + 32, y + 32);
  ctx.lineTo(x + 52, y + 20);
  ctx.stroke();
}

function drawMapPin(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, accent: string) {
  pixelRect(ctx, x + 14, y + 22, 42, 34, color);
  pixelRect(ctx, x + 22, y + 12, 26, 20, accent);
  pixelRect(ctx, x + 30, y + 24, 10, 10, "#0b2033");
}

function drawDepthGauge(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, white: string) {
  pixelRect(ctx, x + 18, y + 4, 28, 56, white);
  pixelRect(ctx, x + 24, y + 12, 16, 42, "#0b2033");
  for (let i = 0; i < 5; i += 1) pixelRect(ctx, x + 42, y + 12 + i * 8, 10, 3, color);
  pixelRect(ctx, x + 8, y + 50, 48, 8, "#2f7ea0");
}

function drawWorm(ctx: CanvasRenderingContext2D, x: number, y: number, red: string, accent: string) {
  [[12, 35], [24, 27], [36, 30], [48, 22], [58, 28]].forEach(([px, py]) => {
    pixelRect(ctx, x + px, y + py, 14, 14, red);
  });
  pixelRect(ctx, x + 60, y + 18, 8, 8, accent);
}

function drawReel(ctx: CanvasRenderingContext2D, x: number, y: number, color: string, white: string) {
  ctx.strokeStyle = white;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x + 30, y + 34, 20, 0, Math.PI * 2);
  ctx.stroke();
  pixelRect(ctx, x + 24, y + 28, 12, 12, color);
  pixelRect(ctx, x + 48, y + 20, 22, 8, color);
  pixelRect(ctx, x + 52, y + 44, 18, 8, color);
}

function drawClock(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(x + 32, y + 32, 23, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 32, y + 32);
  ctx.lineTo(x + 32, y + 16);
  ctx.lineTo(x + 45, y + 32);
  ctx.stroke();
}

function drawStructureIcon(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  pixelRect(ctx, x + 2, y + 40, posterIconSpec.structure.width, 12, "#5a3a20");
  pixelRect(ctx, x + 18, y + 24, 68, 10, "#5a3a20");
  pixelRect(ctx, x + 12, y + 10, 8, 46, color);
  pixelRect(ctx, x + 54, y + 14, 8, 38, color);
}

function drawSmallSun(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  pixelRect(ctx, x + 24, y + 24, 18, 18, color);
  [[30, 4], [30, 50], [4, 30], [50, 30], [12, 12], [48, 12], [12, 48], [48, 48]].forEach(([px, py]) => {
    pixelRect(ctx, x + px, y + py, 8, 8, color);
  });
}

function loadFishArt(fish: string): Promise<HTMLImageElement | null> {
  const src = getFishArtSrc(fish);
  if (!src) return Promise.resolve(null);
  return loadImage(src);
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (value: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };
    const timer = window.setTimeout(() => finish(null), 1800);
    image.onload = () => {
      window.clearTimeout(timer);
      finish(image);
    };
    image.onerror = () => {
      window.clearTimeout(timer);
      finish(null);
    };
    image.src = src;
  });
}

async function loadPosterIcons() {
  const entries = await Promise.all(
    Object.entries(posterIconDataUrls).map(async ([key, src]) => [key, await loadImage(src)] as const),
  );
  return Object.fromEntries(entries);
}

function drawIconImage(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement | null | undefined,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  if (!image) return false;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, x, y, w, h);
  ctx.restore();
  return true;
}

function getFishArtSrc(fish: string) {
  if (fish.includes("海鲈")) return fishArtDataUrls.seaBass;
  if (fish.includes("鳜") || fish.includes("桂鱼")) return fishArtDataUrls.mandarin;
  if (fish.includes("白条") || fish.includes("餐条")) return fishArtDataUrls.whitebait;
  if (fish.includes("草鱼")) return fishArtDataUrls.grassCarp;
  if (isCatfish(fish)) return fishArtDataUrls.catfish;
  if (isCarp(fish)) return fishArtDataUrls.blackCarp;
  if (isSnakehead(fish)) return fishArtDataUrls.snakehead;
  if (fish.includes("鲈")) return fishArtDataUrls.bass;
  if (fish.includes("狗鱼") || fish.includes("梭鱼")) return fishArtDataUrls.pike;
  return fishArtDataUrls.generic;
}

type Rect = { x: number; y: number; width: number; height: number };

function drawFishOnlyArt(ctx: CanvasRenderingContext2D, image: HTMLImageElement, rect: Rect) {
  const { x, y, width: w, height: h } = rect;
  const crop = getFishArtCrop(image);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const cleaned = cleanFishImageBackground(image, crop);
  if (cleaned) {
    ctx.drawImage(cleaned, x, y, w, h);
  } else {
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, x, y, w, h);
  }
  ctx.restore();
  drawWaterRipples(ctx, x + 120, y + h - 16, "#17496a");
}

function cleanFishImageBackground(image: HTMLImageElement, crop: Rect) {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = crop.width;
    canvas.height = crop.height;
    const temp = canvas.getContext("2d");
    if (!temp) return null;
    temp.imageSmoothingEnabled = false;
    temp.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);
    const pixels = temp.getImageData(0, 0, crop.width, crop.height);
    const data = pixels.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const nearWhite = r > 225 && g > 225 && b > 225;
      const checkerGray = Math.abs(r - g) < 4 && Math.abs(g - b) < 4 && r > 185;
      if (nearWhite || checkerGray) data[i + 3] = 0;
    }
    temp.putImageData(pixels, 0, 0);
    return canvas;
  } catch {
    return null;
  }
}

function getFishArtCrop(image: HTMLImageElement) {
  return {
    x: Math.round(image.width * 0.04),
    y: Math.round(image.height * 0.14),
    width: Math.round(image.width * 0.9),
    height: Math.round(image.height * 0.68),
  };
}

function drawPixelFish(ctx: CanvasRenderingContext2D, rect: Rect, fish: string) {
  const { x, y, width: w } = rect;
  const s = 10;
  const p = (cx: number, cy: number, cw: number, ch: number, color: string) => pixelRect(ctx, x + cx * s, y + cy * s, cw * s, ch * s, color);

  if (isSnakehead(fish)) {
    drawSnakehead(ctx, p);
  } else if (isCarp(fish)) {
    drawCarp(ctx, p);
  } else if (isCatfish(fish)) {
    drawCatfish(ctx, p);
  } else {
    drawBass(ctx, p);
  }

  ctx.strokeStyle = "#0a1a19";
  ctx.lineWidth = 8;
  ctx.strokeRect(x + 25, y + 100, w - 100, 6);
  drawWaterRipples(ctx, x + 95, y + 240, "#17496a");
}

function drawBass(ctx: CanvasRenderingContext2D, p: PixelPainter) {
  const dark = "#1d2a1d";
  const green = "#506d34";
  const light = "#aeb678";
  const cream = "#e4dfb5";
  const black = "#101010";
  p(8, 9, 33, 8, green);
  p(5, 10, 38, 6, "#6f8743");
  p(3, 12, 42, 5, light);
  p(6, 16, 34, 5, cream);
  p(2, 14, 7, 4, cream);
  p(1, 11, 8, 5, "#d8d2ad");
  p(43, 10, 9, 4, green);
  p(50, 8, 8, 5, dark);
  p(50, 14, 8, 5, dark);
  p(38, 6, 6, 5, dark);
  p(18, 5, 4, 4, "#c5bc82");
  p(23, 5, 4, 4, "#c5bc82");
  p(29, 6, 4, 4, "#c5bc82");
  p(23, 20, 5, 5, dark);
  p(30, 19, 4, 4, dark);
  p(9, 11, 3, 3, black);
  p(10, 11, 1, 1, "#ffffff");
  for (let i = 0; i < 8; i += 1) {
    p(12 + i * 3, 9 + (i % 2), 2, 2, dark);
    p(16 + i * 3, 13 + (i % 2), 2, 2, dark);
  }
}

function drawSnakehead(ctx: CanvasRenderingContext2D, p: PixelPainter) {
  const dark = "#171f18";
  const olive = "#3d5730";
  const moss = "#668047";
  const tan = "#c6b985";
  const black = "#090909";
  p(9, 8, 35, 7, dark);
  p(5, 9, 43, 7, olive);
  p(2, 11, 48, 6, moss);
  p(4, 16, 42, 5, tan);
  p(0, 10, 9, 7, "#2a3829");
  p(1, 15, 7, 4, "#d5c99a");
  p(46, 10, 9, 4, olive);
  p(53, 8, 7, 5, dark);
  p(53, 14, 7, 5, dark);
  p(19, 5, 12, 3, "#23301f");
  p(26, 20, 6, 4, "#23301f");
  p(9, 10, 2, 2, black);
  p(10, 10, 1, 1, "#ffffff");
  for (let i = 0; i < 10; i += 1) {
    p(12 + i * 3, 11 + (i % 3), 2, 1, "#1b2618");
    p(14 + i * 3, 14 + (i % 2), 2, 1, "#1b2618");
  }
}

function drawCarp(ctx: CanvasRenderingContext2D, p: PixelPainter) {
  const brown = "#8a6531";
  const gold = "#d2a94a";
  const cream = "#ead9a2";
  const dark = "#3b2a17";
  p(10, 7, 30, 6, gold);
  p(5, 9, 40, 8, brown);
  p(3, 12, 44, 8, gold);
  p(8, 18, 32, 5, cream);
  p(1, 13, 9, 5, "#d9b869");
  p(44, 11, 9, 4, brown);
  p(52, 8, 7, 5, dark);
  p(52, 15, 7, 5, dark);
  p(18, 5, 8, 4, "#b68635");
  p(31, 6, 7, 4, "#b68635");
  p(22, 22, 5, 4, dark);
  p(34, 21, 5, 4, dark);
  p(9, 11, 2, 2, "#111111");
  p(10, 11, 1, 1, "#ffffff");
  for (let i = 0; i < 7; i += 1) {
    p(14 + i * 4, 11, 2, 2, "#f0c75b");
    p(16 + i * 4, 15, 2, 2, "#68471f");
  }
}

function drawCatfish(ctx: CanvasRenderingContext2D, p: PixelPainter) {
  const blue = "#4d6570";
  const dark = "#263b43";
  const belly = "#c9c4a0";
  const black = "#101010";
  p(8, 10, 38, 7, dark);
  p(4, 11, 45, 7, blue);
  p(2, 14, 48, 6, "#71858a");
  p(8, 18, 34, 4, belly);
  p(0, 12, 10, 7, "#5a7178");
  p(48, 12, 8, 4, dark);
  p(54, 9, 6, 5, "#1f3036");
  p(54, 16, 6, 5, "#1f3036");
  p(18, 21, 18, 2, "#1f3036");
  p(9, 12, 2, 2, black);
  p(10, 12, 1, 1, "#ffffff");
  p(1, 11, 6, 1, belly);
  p(1, 18, 7, 1, belly);
  p(0, 9, 12, 1, belly);
  p(0, 20, 13, 1, belly);
}

function drawTinyFish(ctx: CanvasRenderingContext2D, x: number, y: number, fish: string) {
  const palette = getFishPalette(fish);
  if (isCatfish(fish)) {
    pixelRect(ctx, x + 26, y + 22, 94, 24, palette.dark);
    pixelRect(ctx, x + 8, y + 26, 42, 18, palette.light);
    pixelRect(ctx, x + 114, y + 18, 32, 13, palette.dark);
    pixelRect(ctx, x + 114, y + 38, 32, 13, palette.dark);
    pixelRect(ctx, x + 4, y + 22, 36, 3, palette.belly);
    pixelRect(ctx, x + 4, y + 48, 42, 3, palette.belly);
    return;
  }
  if (isCarp(fish)) {
    pixelRect(ctx, x + 32, y + 18, 88, 30, palette.dark);
    pixelRect(ctx, x + 10, y + 24, 36, 18, palette.light);
    pixelRect(ctx, x + 114, y + 14, 34, 15, palette.dark);
    pixelRect(ctx, x + 114, y + 39, 34, 15, palette.dark);
    pixelRect(ctx, x + 55, y + 12, 28, 8, palette.light);
    return;
  }
  if (isSnakehead(fish)) {
    pixelRect(ctx, x + 26, y + 18, 96, 28, palette.dark);
    pixelRect(ctx, x + 6, y + 22, 44, 22, palette.light);
    pixelRect(ctx, x + 116, y + 15, 32, 14, palette.dark);
    pixelRect(ctx, x + 116, y + 38, 32, 14, palette.dark);
    pixelRect(ctx, x + 48, y + 29, 62, 5, palette.spot);
    return;
  }
  pixelRect(ctx, x + 34, y + 20, 84, 26, palette.dark);
  pixelRect(ctx, x + 10, y + 25, 34, 18, palette.light);
  pixelRect(ctx, x + 112, y + 16, 34, 16, palette.dark);
  pixelRect(ctx, x + 112, y + 36, 34, 16, palette.dark);
}

type PixelPainter = (cx: number, cy: number, cw: number, ch: number, color: string) => void;

function isSnakehead(fish: string) {
  return fish.includes("黑鱼") || fish.includes("乌鳢") || fish.includes("雷强");
}

function isCarp(fish: string) {
  return fish.includes("鲤") || fish.includes("鲫");
}

function isCatfish(fish: string) {
  return fish.includes("鲶") || fish.includes("塘鲺");
}

function getFishPalette(fish: string) {
  if (isCatfish(fish)) {
    return { dark: "#36505a", light: "#80949a", belly: "#d1c8a4", spot: "#1f3036" };
  }
  if (isCarp(fish)) {
    return { dark: "#8a6531", light: "#d2a94a", belly: "#ead9a2", spot: "#68471f" };
  }
  if (isSnakehead(fish)) {
    return { dark: "#31462a", light: "#668047", belly: "#c6b985", spot: "#182417" };
  }
  return { dark: "#6f8f45", light: "#9db65a", belly: "#e4dfb5", spot: "#1d2a1d" };
}

function drawPixelFishAt(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, fish: string) {
  const p: PixelPainter = (cx, cy, cw, ch, color) =>
    pixelRect(ctx, x + cx * s, y + cy * s, cw * s, ch * s, color);
  if (isSnakehead(fish)) drawSnakehead(ctx, p);
  else if (isCarp(fish)) drawCarp(ctx, p);
  else if (isCatfish(fish)) drawCatfish(ctx, p);
  else drawBass(ctx, p);
  // Water surface line
  ctx.strokeStyle = "#0d3244";
  ctx.lineWidth = 6;
  const fishW = 62 * s;
  ctx.beginPath();
  ctx.moveTo(x + 18, y + 22 * s);
  ctx.lineTo(x + fishW - 36, y + 22 * s);
  ctx.stroke();
  // Ripples
  ctx.strokeStyle = "#17496a";
  ctx.lineWidth = 5;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 40 + i * 82, y + 22 * s + 10 + i * 3);
    ctx.lineTo(x + 108 + i * 82, y + 22 * s + 10 + i * 3);
    ctx.stroke();
  }
}

function drawWaterPlants(ctx: CanvasRenderingContext2D, icons?: Record<string, HTMLImageElement | null>) {
  if (icons?.grass) {
    drawIconImage(ctx, icons.grass, 64, 435, 70, 86);
    drawIconImage(ctx, icons.grass, 934, 440, 70, 86);
  }
  if (icons?.log) {
    drawIconImage(ctx, icons.log, 64, 510, 105, 54);
    drawIconImage(ctx, icons.log, 710, 510, 105, 54);
    return;
  }
  const green = "#6d913d";
  ctx.strokeStyle = green;
  ctx.lineWidth = 9;
  [[80, 530, 58, -112], [108, 538, 30, -92], [128, 536, 76, -84], [742, 524, -38, -68], [922, 538, 38, -50]].forEach(
    ([x, y, dx, dy]) => {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + dx, y + dy);
      ctx.stroke();
    },
  );
  pixelRect(ctx, 62, 550, 125, 14, "#49351e");
  pixelRect(ctx, 736, 545, 172, 12, "#49351e");
}

function drawBubbles(ctx: CanvasRenderingContext2D) {
  ctx.strokeStyle = "#7bd4ff";
  ctx.lineWidth = 5;
  [[104, 322, 13], [88, 378, 10], [110, 426, 7]].forEach(([x, y, r]) => {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function drawWaterRipples(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  for (let i = 0; i < 3; i += 1) {
    ctx.beginPath();
    ctx.moveTo(x + i * 85, y + i * 3);
    ctx.lineTo(x + 70 + i * 85, y + i * 3);
    ctx.stroke();
  }
}

function drawMiniLake(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) {
  pixelRect(ctx, x, y, w, h, "#214960");
  pixelRect(ctx, x, y + 64, w, h - 64, "#315f73");
  pixelRect(ctx, x, y, w, 42, "#9cc7d6");
  pixelRect(ctx, x + 34, y + 22, 170, 36, "#6f9b6d");
  pixelRect(ctx, x + 92, y + 16, 60, 24, "#f4f6ec");
  pixelRect(ctx, x + 155, y + 70, 72, 14, "#4e341f");
  pixelRect(ctx, x + 176, y + 48, 12, 36, "#4e341f");
}

function drawAngler(ctx: CanvasRenderingContext2D, rect: Rect, icons?: Record<string, HTMLImageElement | null>) {
  const { x, y, width: w, height: h } = rect;
  if (drawIconImage(ctx, icons?.fisherman, x, y, w, h)) return;
  const scale = w / 205;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  pixelRect(ctx, 0, 78, 190, 24, "#5a3a20");
  pixelRect(ctx, 48, 25, 46, 48, "#d9b36a");
  pixelRect(ctx, 38, 12, 68, 18, "#789b42");
  pixelRect(ctx, 54, -4, 36, 20, "#789b42");
  pixelRect(ctx, 46, 64, 56, 42, "#5f8a42");
  ctx.strokeStyle = "#c99052";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(104, 28);
  ctx.quadraticCurveTo(164, -18, 190, 65);
  ctx.stroke();
  ctx.restore();
}

function pixelPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, stroke: string) {
  pixelRect(ctx, x, y, w, h, fill);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 4;
  ctx.strokeRect(x, y, w, h);
  pixelRect(ctx, x - 4, y + 18, 4, h - 36, stroke);
  pixelRect(ctx, x + w, y + 18, 4, h - 36, stroke);
}

function drawPixelBorder(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 8;
  ctx.strokeRect(x, y, w, h);
  const blocks = [
    [x, y, 42, 8],
    [x, y, 8, 42],
    [x + w - 42, y, 42, 8],
    [x + w - 8, y, 8, 42],
    [x, y + h - 8, 42, 8],
    [x, y + h - 42, 8, 42],
    [x + w - 42, y + h - 8, 42, 8],
    [x + w - 8, y + h - 42, 8, 42],
  ];
  blocks.forEach(([bx, by, bw, bh]) => pixelRect(ctx, bx, by, bw, bh, color));
}

function labelRibbon(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  fill: string,
  textColor: string,
  fontSize = 28,
) {
  pixelRect(ctx, x, y, w, h, fill);
  pixelRect(ctx, x - 18, y + 8, 18, h - 16, fill);
  pixelRect(ctx, x + w, y + 8, 18, h - 16, fill);
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px 'Microsoft YaHei', sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(label, x + w / 2, y + Math.round(h * 0.7));
  ctx.textAlign = "left";
}

function dottedLine(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string, size: number) {
  for (let i = 0; i < w; i += size * 3) pixelRect(ctx, x + i, y, size, size, color);
}

function dashedVLine(ctx: CanvasRenderingContext2D, x: number, y: number, h: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 9]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.stroke();
  ctx.setLineDash([]);
}

function dashedHLine(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, color: string) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 9]);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  ctx.setLineDash([]);
}

function pixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function drawStars(ctx: CanvasRenderingContext2D, x: number, y: number, score: number, icons: Record<string, HTMLImageElement | null>, fullColor: string, emptyColor: string, size: number = posterIconSpec.star.width) {
  const full = Math.max(1, Math.min(5, Math.round(score / 20)));
  const scale = size / posterIconSpec.star.width;
  for (let i = 0; i < 5; i += 1) {
    const sx = x + i * (size + 4);
    if (i < full && drawIconImage(ctx, icons.star, sx, y, size, size)) continue;
    ctx.save();
    ctx.translate(sx, y);
    ctx.scale(scale, scale);
    drawPixelStar(ctx, 0, 0, i < full ? fullColor : emptyColor);
    ctx.restore();
  }
}

function drawPixelStar(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const s = posterIconSpec.star.width / 6;
  pixelRect(ctx, x + 2 * s, y, 2 * s, s, color);
  pixelRect(ctx, x + s, y + s, 4 * s, s, color);
  pixelRect(ctx, x, y + 2 * s, 6 * s, 2 * s, color);
  pixelRect(ctx, x + s, y + 4 * s, s, s, color);
  pixelRect(ctx, x + 4 * s, y + 4 * s, s, s, color);
  pixelRect(ctx, x + 2 * s, y + 5 * s, 2 * s, s, color);
}

function drawProgressBlocks(ctx: CanvasRenderingContext2D, x: number, y: number, score: number, fill: string, stroke: string, size: number = posterIconSpec.progressBlock.width) {
  const full = Math.max(1, Math.min(10, Math.round(score / 10)));
  for (let i = 0; i < 10; i += 1) {
    const bx = x + i * (size + 4);
    pixelRect(ctx, bx, y, size, size, i < full ? fill : "#10273a");
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, y, size, size);
  }
}

function fitText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  maxSize: number,
  weight = "normal",
  align: CanvasTextAlign = "left",
) {
  let size = maxSize;
  ctx.textAlign = align;
  do {
    ctx.font = `${weight} ${size}px 'Microsoft YaHei', sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  } while (size >= 22);
  ctx.fillText(text, x, y);
  ctx.textAlign = "left";
}

function extractStructure(area: string) {
  if (area.includes("倒木")) return "浅层阴影区";
  if (area.includes("草")) return "水草结构区";
  if (area.includes("礁")) return "礁石外缘";
  return "结构交界区";
}

function getTimePeriod() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 8) return "清晨";
  if (hour >= 8 && hour < 11) return "上午";
  if (hour >= 11 && hour < 14) return "中午";
  if (hour >= 14 && hour < 17) return "下午";
  if (hour >= 17 && hour < 20) return "傍晚";
  return "夜晚";
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 3,
) {
  const chars = text.split("");
  let line = "";
  let lines = 0;
  for (const char of chars) {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = char;
      y += lineHeight;
      lines += 1;
      if (lines >= maxLines - 1) break;
    } else {
      line = testLine;
    }
  }
  if (line) ctx.fillText(line, x, y);
}
