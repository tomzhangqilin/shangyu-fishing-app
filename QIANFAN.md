# 千帆模型分工

上渔使用两个千帆模型输出：

1. 文字策略模型
   - 环境变量：`QIANFAN_MODEL`
   - 默认：`ernie-4.5-0.3b`
   - 接口：`POST /api/strategy`
   - 职责：根据天气、钓法、目标鱼生成结构化 JSON 策略。

2. 鱼图生成模型
   - 服务：千帆图片生成接口
   - 环境变量：`QIANFAN_IMAGE_MODEL`
   - 默认：`qwen-image`
   - 接口：`POST /api/share-card-image`
   - 职责：根据目标鱼生成像素风鱼本体图片。

图片模型不重新生成策略，也不负责海报文字、边框、天气栏、信息表格或其它装饰。最终分享卡由前端 Canvas 模板统一排版，只把图片模型生成的鱼放进主视觉区。

前端流程是：

`用户选择 -> /api/strategy -> 策略结果 -> /api/share-card-image -> 鱼图 -> Canvas 模板合成分享图`
