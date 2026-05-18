import { fishArtDataUrls } from "./app/generated/fish-art-data";
import { posterIconDataUrls } from "./app/generated/poster-icon-data";
import { writeFileSync } from "fs";

const W = 540, H = 768;
const LIME = "#d6e264";
const WHITE = "#f4f6ec";
const NAVY = "#061526";
const DEEP = "#020b15";
const PANEL = "#0b2033";
const LINE = "#4f7894";
const TARGET_BG = "rgba(9,31,45,0.92)";

const strategy = {
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
};
const weather = { condition: "多云", temperature: 23, wind: 10 };
const targetFish = "黑鲈";
const fishArt = fishArtDataUrls.bass;

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function icon(src: string, x: number, y: number, w: number, h: number, id?: string) {
  return `<image${id ? ` id="${id}"` : ""} x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" href="${src}" image-rendering="pixelated"/>`;
}

function rect(x: number, y: number, w: number, h: number, fill: string, stroke?: string, sw = 2, rx = 0) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ""}${rx ? ` rx="${rx}"` : ""}/>`;
}

function text(content: string, x: number, y: number, fill: string, size: number, weight = "normal", anchor = "start") {
  return `<text x="${x}" y="${y}" fill="${fill}" font-size="${size}" font-weight="${weight}" font-family="Microsoft YaHei,PingFang SC,sans-serif" text-anchor="${anchor}">${esc(content)}</text>`;
}

const infoItems = [
  { icon: posterIconDataUrls.radar,  label: "今日状态", value: strategy.fish_behavior },
  { icon: posterIconDataUrls.mapPin, label: "推荐区域", value: strategy.recommended_area },
  { icon: posterIconDataUrls.depth,  label: "推荐水深", value: strategy.recommended_depth },
  { icon: posterIconDataUrls.fish,   label: "推荐饵料", value: strategy.recommended_bait },
  { icon: posterIconDataUrls.reel,   label: "操作方式", value: strategy.retrieve_style },
  { icon: posterIconDataUrls.clock,  label: "最佳时间", value: strategy.best_time },
  { icon: posterIconDataUrls.log,    label: "推荐结构", value: "浅层阴影区" },
  { icon: posterIconDataUrls.sun,    label: "活跃度",   value: `${strategy.activity_score} / 100` },
];

const weatherItems = [
  { icon: posterIconDataUrls.calendar,    label: "日期",   value: "5月17日" },
  { icon: posterIconDataUrls.cloud,       label: "天气",   value: weather.condition },
  { icon: posterIconDataUrls.thermometer, label: "温度",   value: `${weather.temperature}°C` },
  { icon: posterIconDataUrls.wind,        label: "风速",   value: "微风" },
  { icon: posterIconDataUrls.sunset,      label: "时间段", value: "上午" },
];

const lines: string[] = [];

// ── Background ─────────────────────────────────────────────
lines.push(`<defs>
  <linearGradient id="bg-grad" x1="0" y1="0" x2="0" y2="${H}" gradientUnits="userSpaceOnUse">
    <stop offset="0%" stop-color="${NAVY}"/>
    <stop offset="100%" stop-color="${DEEP}"/>
  </linearGradient>
</defs>`);
lines.push(`<g id="Background">`);
lines.push(rect(0, 0, W, H, "url(#bg-grad)"));
lines.push(`</g>`);

// ── Outer border ───────────────────────────────────────────
lines.push(`<g id="OuterBorder">`);
lines.push(rect(32, 39, 476, 690, "none", LINE, 2));
lines.push(`</g>`);

// ── WeatherBar ────────────────────────────────────────────
lines.push(`<g id="WeatherBar">`);
const barX = 50, barY = 54, barW = 440, cellW = barW / 5;
weatherItems.forEach(({ icon: src, label, value }, i) => {
  const cx = barX + i * cellW;
  if (i < 4) lines.push(`<line x1="${cx + cellW}" y1="${barY}" x2="${cx + cellW}" y2="${barY + 44}" stroke="${LINE}" stroke-width="1" stroke-dasharray="3,3"/>`);
  lines.push(icon(src, cx + 4, barY + 5, 22, 22));
  lines.push(text(label, cx + 30, barY + 16, LIME, 10, "bold"));
  lines.push(text(value, cx + 30, barY + 31, WHITE, 11));
});
lines.push(`</g>`);

// ── Divider ───────────────────────────────────────────────
lines.push(`<line id="Divider" x1="50" y1="107" x2="490" y2="107" stroke="${LINE}" stroke-width="1"/>`);

// ── Title ─────────────────────────────────────────────────
lines.push(`<g id="Title">`);
lines.push(text(strategy.title, W / 2, 135, LIME, 22, "bold", "middle"));
const dotCount = 10, dotSize = 5, dotGap = 9;
const dotsW = dotCount * dotSize + (dotCount - 1) * dotGap;
const dotsStartX = W / 2 - dotsW / 2;
for (let i = 0; i < dotCount; i++) {
  lines.push(rect(dotsStartX + i * (dotSize + dotGap), 143, dotSize, dotSize, LIME));
}
lines.push(`</g>`);

// ── FishArt ───────────────────────────────────────────────
lines.push(`<g id="FishArt">`);
lines.push(rect(46, 152, 314, 124, "none"));
lines.push(icon(fishArt, 46, 152, 314, 124, "fish-image"));
lines.push(`</g>`);

// ── TargetFishBox ─────────────────────────────────────────
lines.push(`<g id="TargetFishBox">`);
lines.push(rect(378, 158, 86, 100, "#091f2d", LIME, 2));
lines.push(text("目标鱼", 378 + 43, 175, LIME, 10, "bold", "middle"));
lines.push(text(targetFish, 378 + 43, 200, WHITE, 18, "bold", "middle"));
lines.push(icon(posterIconDataUrls.fishSprite, 378 + 43 - 23, 210, 46, 18));
lines.push(`</g>`);

// ── InfoPanel ─────────────────────────────────────────────
lines.push(`<g id="InfoPanel">`);
lines.push(rect(32, 283, 476, 194, PANEL, LINE, 1));
lines.push(`<line x1="${32 + 238}" y1="${283 + 12}" x2="${32 + 238}" y2="${283 + 182}" stroke="${LINE}" stroke-width="1" stroke-dasharray="5,5" opacity="0.5"/>`);
infoItems.forEach(({ icon: src, label, value }, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const cx = col === 0 ? 40 : 40 + 238;
  const cy = 295 + row * 46;
  lines.push(icon(src, cx, cy, 22, 22));
  lines.push(text(label, cx + 28, cy + 12, LIME, 10, "bold"));
  lines.push(text(value, cx + 28, cy + 26, WHITE, 11));
});
lines.push(`</g>`);

// ── SeasonPanel ───────────────────────────────────────────
lines.push(`<g id="SeasonPanel">`);
lines.push(rect(32, 484, 476, 82, PANEL, LINE, 1));
lines.push(icon(posterIconDataUrls.leaf, 42, 493, 18, 18));
lines.push(rect(64, 492, 52, 14, LIME, undefined, 0));
lines.push(text("季节习性", 90, 503, "#071426", 10, "bold", "middle"));
lines.push(text(strategy.season_pattern, 64, 521, WHITE, 11));
lines.push(`</g>`);

// ── TipPanel ──────────────────────────────────────────────
lines.push(`<g id="TipPanel">`);
lines.push(rect(32, 573, 476, 80, PANEL, LINE, 1));
lines.push(icon(posterIconDataUrls.fisherman, 42, 580, 36, 26));
lines.push(rect(84, 579, 52, 14, LIME, undefined, 0));
lines.push(text("钓手建议", 110, 590, "#071426", 10, "bold", "middle"));
lines.push(text(strategy.casting_tip, 84, 609, WHITE, 11));
lines.push(`</g>`);

// ── Footer ────────────────────────────────────────────────
lines.push(`<g id="Footer">`);
lines.push(text("· · ·  上渔  · · ·", W / 2, 695, LIME, 13, "bold", "middle"));
lines.push(`</g>`);

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
${lines.join("\n")}
</svg>`;

const outPath = new URL("./shangyu-card.svg", import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1");
writeFileSync(outPath, svg, "utf-8");
console.log(`Saved: ${outPath}`);
