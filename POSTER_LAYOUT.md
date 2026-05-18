# 分享卡布局参数

分享卡的主要坐标现在集中在 [app/page.tsx](app/page.tsx) 的 `posterLayout`。

画布尺寸：

```ts
canvas: { width: 1080, height: 1536 }
```

主要区域：

```ts
border      // 外框
title       // 主标题位置、最大宽度、字号
titleDots   // 标题下方点线
fish        // 鱼图位置：local / ai / fallback
targetBox   // 右侧目标鱼框
infoPanel   // 中间 2x4 信息矩阵
seasonPanel // 季节习性卡片
tipPanel    // 钓手建议卡片
footer      // 底部品牌文字
```

常见调整：

```ts
// 鱼更大
fish.local: { x: 90, y: 325, width: 720, height: 285 }

// 标题往上
title: { x: 540, y: 245, maxWidth: 820, fontSize: 64 }

// 信息表格整体下移
infoPanel: { x: 54, y: 670, width: 972, height: 442 }

// 底部建议卡更高
tipPanel: { x: 54, y: 1300, width: 972, height: 175 }
```
