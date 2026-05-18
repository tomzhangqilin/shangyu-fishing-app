# 上渔 · Onboarding Guide

移动端钓鱼策略 App，基于 GPS 天气 + 千帆 AI 生成今日钓鱼策略，并导出像素风分享卡片。

## 快速启动

```bash
npm install
npm run build
npm run preview        # http://localhost:3000
```

> 每次改完代码都要重新 `npm run build`，**不要用 `npm run dev`**（assetPrefix 导致热更新失效）。

## 环境变量（可选）

新建 `.env.local`：

```
QIANFAN_API_KEY=your_key_here
```

没有 key 时自动使用本地离线策略，功能完整。

## 项目一句话

- **唯一入口**：`app/page.tsx`（所有 UI + 逻辑在一个文件）
- **静态服务器**：`static-server.js`（处理 API 路由 + 静态文件）
- **分享卡**：html2canvas 捕获隐藏 HTML 模板 → 1080×1536 PNG
- **像素素材**：`app/generated/` 下的两个文件，勿手动修改

## 主要任务方向

- 接入真实千帆 API key，验证 AI 策略生成
- 优化分享卡视觉（修改 `app/page.tsx` 里 `id="share-card-tpl"` 的 HTML 模板）
- 新增鱼种或钓法选项（`fishOptions` / `fishingStyles` 数组）
- 调整配色（全局用 `#d6e264` lime 主色，`#061526`→`#020b15` 深蓝背景）
