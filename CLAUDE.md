# 上渔 · 智能钓鱼策略 App

移动端优先的钓鱼策略 PWA。基于当前位置与天气，通过千帆 AI 生成今日钓鱼策略，并导出像素风分享卡。

## 技术栈

- **Next.js 15** + **React 19** + **TypeScript** + **Tailwind CSS 4**
- **framer-motion** — 页面切换动画
- **html2canvas** — 将 HTML 模板渲染为 PNG 分享卡
- **Open-Meteo API** — 实时天气（免费，无需 key）
- **BigDataCloud API** — 反向地理编码（免费，无需 key）
- **百度千帆 API** — AI 策略生成 + 鱼图生成

## 项目结构

```
app/
  page.tsx                  # 全部 UI 逻辑（单文件组件）
  globals.css               # 全局样式、lake-motion 动画
  generated/
    fish-art-data.ts        # 像素鱼图 base64（勿手动修改）
    poster-icon-data.ts     # 海报图标 base64（勿手动修改）
static-server.js            # 生产服务器，含 /api/strategy 和 /api/share-card-image
generate-card-svg.mts       # 导出分享卡 SVG（供 Figma 编辑）
.claude/launch.json         # Claude Code 预览服务器配置
```

## 常用命令

```bash
# 开发（修改代码后必须重新 build）
npm run build               # 编译到 out/
npm run preview             # 启动静态服务器 http://localhost:3000

# 生成 Figma 可编辑 SVG
npx tsx generate-card-svg.mts

# 类型检查
npx tsc --noEmit
```

> ⚠️ **不要用 `npm run dev`**：`assetPrefix: "./"` 导致 dev server 加载旧的 out/ 静态文件，不会热更新。每次改完代码都要 `npm run build` 再重启 preview。

## 环境变量

`.env.local`（本地，不提交 git）：

```
QIANFAN_API_KEY=your_key_here
QIANFAN_MODEL=ernie-4.5-0.3b          # 可选，默认值
QIANFAN_IMAGE_MODEL=qwen-image         # 可选，默认值
```

千帆 API Key 从 [百度智能云](https://console.bce.baidu.com/) 获取。没有 key 时自动降级使用本地策略（`localStrategies`），功能完整可用。

## 核心流程（5 步）

```
step 0  Landing    → 点击"开始"
step 1  选择钓法   → 路亚 / 台钓 / 飞钓 / 海钓
step 2  今日天气   → 自动获取 GPS + 天气（失败时用 fallbackWeather）
step 3  目标鱼     → 从 fishOptions 选择
step 4  今日策略   → 调用 /api/strategy，失败降级 localStrategies
step 5  分享卡     → html2canvas 捕获隐藏模板 → 生成 1080×1536 PNG
```

## 分享卡实现

分享卡不使用 Canvas 2D 手绘，而是：
1. 页面中始终有一个 `position: fixed; left: -9999px` 的隐藏 HTML 模板（`id="share-card-tpl"`，540×768px）
2. `buildShareCard()` 先清理鱼图背景（`cleanFishImageBackground`），注入到模板的 `[data-role="fish-art"]`
3. 调用 `html2canvas(el, { scale: 2 })` 生成 1080×1536 PNG

模板使用**内联 style**（不用 Tailwind class），以确保 html2canvas 能正确读取样式。

## 颜色规范

| 变量         | 值        | 用途              |
|------------|-----------|-----------------|
| `--lime`   | `#d6e264` | 主强调色、标题、按钮     |
| `--navy`   | `#061526` | 背景渐变顶色          |
| `--deep`   | `#020b15` | 背景渐变底色          |
| `--panel`  | `#0b2033` | 信息卡片背景          |
| `--line`   | `#4f7894` | 描边、分割线          |
| `--white`  | `#f4f6ec` | 正文文字            |

## 已知问题

- **Claude Code 预览浏览器**设置了 `prefers-reduced-motion: reduce`，导致 framer-motion 的 `AnimatePresence` 页面切换失效。已移除 `mode="wait"` 规避，但切换时可能短暂同时显示两个步骤。
- 鱼图（`fish-art-data.ts`）和图标（`poster-icon-data.ts`）文件很大，git clone 后不需要重新生成。
