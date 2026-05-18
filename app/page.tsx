"use client";

import { AnimatePresence, motion } from "framer-motion";
import html2canvas from "html2canvas";
import { Check, ChevronRight, Download, LocateFixed } from "lucide-react";
import { useMemo, useState } from "react";
import { cardIconDataUrls } from "./generated/card-icon-data";
import { fishArtDataUrls } from "./generated/fish-art-data";
import { posterIconDataUrls } from "./generated/poster-icon-data";

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
    title: "今天适合浅层慢搜",
    fish_behavior: "黑鲈活性较高",
    season_pattern: "水温回升后，黑鲈会逐渐靠近浅层结构区觅食。",
    recommended_area: "草区边缘、倒木附近",
    recommended_depth: "1.2-1.8米",
    recommended_bait: "红色软虫",
    retrieve_style: "慢速收线",
    best_time: "日落前1小时",
    casting_tip: "先打草区边缘，再搜索倒木阴影，保持慢速收线。",
    activity_score: 82,
    summary: "阴天低光环境下，黑鲈更容易靠近浅层结构区觅食。",
  },
  台钓: {
    title: "今天适合稳守底层",
    fish_behavior: "鲤鱼觅食稳定",
    season_pattern: "水温稳定时，底层鱼会沿缓流湾和泥底区持续觅食。",
    recommended_area: "缓流回湾、泥底平滩",
    recommended_depth: "1.8-2.5米",
    recommended_bait: "谷物香型饵",
    retrieve_style: "稳守待口",
    best_time: "清晨或上午",
    casting_tip: "先少量做窝，等鱼进窝后放慢补窝频率。",
    activity_score: 68,
    summary: "稳定天气适合守钓，重点放在缓流和泥底交界处。",
  },
  飞钓: {
    title: "今天适合阴影轻漂",
    fish_behavior: "溪鱼活性中等",
    season_pattern: "有遮挡的浅滩和阴影边缘更容易聚鱼。",
    recommended_area: "树荫浅滩、溪流阴影区",
    recommended_depth: "0.6-1.2米",
    recommended_bait: "橄榄色若虫",
    retrieve_style: "轻柔控线漂流",
    best_time: "上午或傍晚",
    casting_tip: "用轻落点搜索阴影边缘，让假饵顺流自然漂过。",
    activity_score: 65,
    summary: "低风速适合细线控漂，重点观察阴影与明水交界。",
  },
  海钓: {
    title: "今天适合礁边搜索",
    fish_behavior: "海鱼随暗流聚集",
    season_pattern: "涨落潮前后，礁石外缘和浪线附近更容易出鱼。",
    recommended_area: "礁石外缘、浪线附近",
    recommended_depth: "2.4-3.6米",
    recommended_bait: "银色米诺",
    retrieve_style: "中速匀速搜索",
    best_time: "涨潮前后",
    casting_tip: "优先覆盖浪线和暗流交界，抛投角度比距离更重要。",
    activity_score: 70,
    summary: "浪线和暗流会带来饵鱼，适合用银色拟饵持续搜索。",
  },
};

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
  const [posterIcons, setPosterIcons] = useState<Record<string, HTMLImageElement | null>>({});

  const targetFish = fish;
  const currentWeather = weather || fallbackWeather;
  const currentStrategy = useMemo(() => strategy || localStrategies[style], [strategy, style]);

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
      setStrategy(localStrategies[style]);
    } finally {
      setGenerating(false);
    }
  }

  async function buildShareCard(): Promise<string> {
    // Clean fish image background and inject into template
    const rawSrc = getFishArtSrc(targetFish);
    let fishDataUrl = rawSrc || "";
    if (rawSrc) {
      try {
        const img = await loadImage(rawSrc);
        if (!img) throw new Error("load failed");
        const crop = getFishArtCrop(img);
        const cleaned = cleanFishImageBackground(img, crop);
        if (cleaned) fishDataUrl = cleaned.toDataURL("image/png");
      } catch { /* use raw */ }
    }
    const el = document.getElementById("share-card-tpl");
    if (!el) return "";
    const fishImg = el.querySelector("[data-role='fish-art']") as HTMLImageElement | null;
    if (fishImg && fishDataUrl) {
      fishImg.src = fishDataUrl;
      await new Promise<void>(r => { const t = setTimeout(r, 300); fishImg.onload = () => { clearTimeout(t); r(); }; });
    }
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      width: 720,
    });
    return canvas.toDataURL("image/png");
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
      link.download = "shangyu-pixel-card.png";
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
    setCardGenerating(true);
    setStep(5);
    try {
      const dataUrl = await buildShareCard();
      setCardDataUrl(dataUrl);
    } catch {
      setCardDataUrl("");
    } finally {
      setCardGenerating(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6">
      <div className="lake-motion" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-md flex-col">
        <header className="flex items-center justify-between py-2 text-sm text-white/55">
          <span className="thin-text">上渔</span>
          {step > 0 && (
            <button className="rounded-full px-3 py-2 transition hover:bg-white/10" onClick={() => setStep(0)}>
              重置
            </button>
          )}
        </header>

        <AnimatePresence>
          {step === 0 && (
            <Screen key="landing" className="items-center justify-center text-center">
              <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }}>
                <p className="mb-6 text-sm thin-text text-white/52">千帆智能钓鱼策略</p>
                <h1 className="text-5xl thin-text leading-tight">今天怎么钓？</h1>
                <p className="mx-auto mt-6 max-w-xs whitespace-pre-line text-xl thin-text leading-8 text-white/68">
                  {"基于当前位置与天气，\n生成今日钓鱼策略。"}
                </p>
                <PrimaryButton className="mt-12" onClick={() => setStep(1)}>
                  开始
                  <ChevronRight size={18} />
                </PrimaryButton>
              </motion.div>
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
                    <div className="h-8 w-44 animate-pulse rounded-full bg-white/12" />
                    <div className="h-5 w-32 animate-pulse rounded-full bg-white/10" />
                    <div className="h-5 w-24 animate-pulse rounded-full bg-white/10" />
                  </div>
                ) : (
                  <>
                    <h2 className="text-4xl thin-text">{currentWeather.city}</h2>
                    <p className="mt-5 text-xl thin-text text-white/68">
                      {currentWeather.condition} · {currentWeather.temperature}°C
                    </p>
                    <p className="mt-2 text-xl thin-text text-white/68">风 {currentWeather.wind} 千米/时</p>
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
                    <div className="h-5 w-28 animate-pulse rounded-full bg-white/12" />
                    <div className="h-8 w-44 animate-pulse rounded-full bg-white/10" />
                    <div className="h-5 w-24 animate-pulse rounded-full bg-white/12" />
                    <div className="h-8 w-36 animate-pulse rounded-full bg-white/10" />
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
                      <p className="text-sm thin-text text-white/42">综合建议</p>
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
                ) : (
                  <div className="flex aspect-[9/13] w-full items-center justify-center rounded-[20px] border border-white/12 bg-white/[0.06] text-lg thin-text text-white/56">
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

      {/* Hidden html2canvas share card template */}
      <div style={{ position: 'fixed', left: -9999, top: 0, zIndex: -100, pointerEvents: 'none' }}>
        <div id="share-card-tpl" className="scard" style={{ fontFamily: '"Noto Sans SC","Microsoft YaHei","PingFang SC",sans-serif' }}>

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
                <img src={icon} alt="" style={{ width: 26, height: 26, imageRendering: 'pixelated', flexShrink: 0 }} />
                <div>
                  <div className="scard-stat-label">{label}</div>
                  <div className="scard-stat-value">{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Title */}
          <div className="scard-title-row">
            <span className="scard-title-deco">&gt;</span>
            <div className="scard-title-main">{currentStrategy.title}</div>
            <span className="scard-title-deco">&lt;</span>
          </div>

          {/* Hero: fish art + target card */}
          <div className="scard-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-role="fish-art" alt="fish" className="scard-hero-fish" />
            <div className="scard-target-card">
              <div className="scard-target-label">目标鱼</div>
              <div className="scard-target-name">{targetFish}</div>
            </div>
          </div>

          {/* Info grid 2×4 */}
          <div className="scard-info-grid">
            {[
              { icon: cardIconDataUrls.radar,    label: '今日状态', value: currentStrategy.fish_behavior, extra: 'stars' },
              { icon: cardIconDataUrls.mapPin,   label: '推荐区域', value: currentStrategy.recommended_area, extra: '' },
              { icon: cardIconDataUrls.depth,    label: '推荐水深', value: currentStrategy.recommended_depth, extra: '' },
              { icon: getBaitIcon(currentStrategy.recommended_bait), label: '推荐饵料', value: currentStrategy.recommended_bait, extra: '' },
              { icon: cardIconDataUrls.reel,     label: '操作方式', value: currentStrategy.retrieve_style, extra: '' },
              { icon: cardIconDataUrls.clock,    label: '最佳时间', value: currentStrategy.best_time, extra: '' },
              { icon: getStructureIcon(currentStrategy.recommended_area), label: '推荐结构', value: extractStructure(currentStrategy.recommended_area), extra: '' },
              { icon: cardIconDataUrls.sun,      label: '活跃度',   value: '', extra: 'meter' },
            ].map(({ icon, label, value, extra }, i) => (
              <div key={i} className="scard-info-cell">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={icon} alt="" style={{ width: 28, height: 28, imageRendering: 'pixelated', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="scard-info-label">{label}</div>
                  {extra === 'stars' ? (
                    <>
                      <div className="scard-info-value">{value}</div>
                      <div className="scard-stars">
                        {Array.from({ length: 5 }).map((_, si) => (
                          si < Math.round(currentStrategy.activity_score / 20)
                            /* eslint-disable-next-line @next/next/no-img-element */
                            ? <img key={si} src={cardIconDataUrls.star} alt="★" style={{ width: 14, height: 14, imageRendering: 'pixelated' }} />
                            : <span key={si} style={{ color: '#2a3a55', fontSize: 13, lineHeight: '14px' }}>★</span>
                        ))}
                      </div>
                    </>
                  ) : extra === 'meter' ? (
                    <>
                      <div className="scard-activity-top">
                        <span className="scard-activity-num">{currentStrategy.activity_score}</span>
                        <span className="scard-activity-sub">/100</span>
                      </div>
                      <div className="scard-meter">
                        {Array.from({ length: 12 }).map((_, mi) => (
                          <span key={mi} style={{ background: mi < Math.round(currentStrategy.activity_score / 100 * 12) ? '#7eb337' : '#1c324f' }} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="scard-info-value">{value}</div>
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
                <img src={cardIconDataUrls.leaf} alt="" style={{ width: 20, height: 20, imageRendering: 'pixelated' }} />
                <span className="scard-section-title">季节习性</span>
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
                <img src={cardIconDataUrls.fisherman} alt="" style={{ width: 32, height: 32, imageRendering: 'pixelated' }} />
                <span className="scard-section-title">钓手建议</span>
              </div>
              <div className="scard-section-text">{currentStrategy.casting_tip || currentStrategy.summary}</div>
            </div>
          </div>

          {/* Footer */}
          <div className="scard-footer">· · ·&nbsp;&nbsp;上渔&nbsp;&nbsp;· · ·</div>
        </div>
      </div>
    </main>
  );
}

function Screen({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      className={`flex flex-1 flex-col pb-4 pt-10 ${className}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -18 }}
      transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.section>
  );
}

function StepTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="text-sm thin-text text-[#D6E264]">{eyebrow}</p>
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
          ? "border-[#D6E264] bg-[#D6E264]/10 text-white shadow-[0_18px_48px_rgba(214,226,100,0.08)]"
          : "border-white/12 bg-white/[0.06] text-white/76 hover:border-white/24 hover:bg-white/[0.09]"
      }`}
    >
      {children}
    </button>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 py-5 first:pt-0">
      <p className="text-sm thin-text text-white/42">{label}</p>
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
  if (bait.includes("虫") || bait.includes("玉米") || bait.includes("谷")) return cardIconDataUrls.cornBait;
  if (bait.includes("软虫") || bait.includes("假饵") || bait.includes("路亚")) return cardIconDataUrls.lure;
  if (bait.includes("米诺") || bait.includes("匙") || bait.includes("VIB")) return cardIconDataUrls.vibLure;
  if (bait.includes("若虫") || bait.includes("毛钩")) return cardIconDataUrls.bait;
  return cardIconDataUrls.spoonLure;
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
  ctx.textAlign = "center";
  ctx.fillText("· · ·  上渔  · · ·", pl.footer.x, pl.footer.y);
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
