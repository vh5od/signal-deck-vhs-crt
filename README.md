# Signal Deck · VHS / CRT 调校台

双击 `start.command`，浏览器会打开 `http://127.0.0.1:8765`。

需要 Python 3 与 FFmpeg。程序会依次查找 `bin/ffmpeg`、系统 `ffmpeg` 和 `imageio-ffmpeg` 提供的二进制。

界面提供：

- WebGL 实时预览，以及按住查看原片的 A/B 对比
- 点击顶部“更换视频”导入 MP4、MOV、M4V、WebM 或 MKV；预览和渲染会立即改用新视频
- VHS 色度拖影、磁带波动、折痕、底部切换噪声和彩色噪点
- CRT 边缘色散、高光溢出、荧光粉辉光、扫描线、曲面和暗角
- 平衡、磁带损坏、平成 VHS、平成过载、干净 CRT 五组预设
- “平成 VHS”使用原站默认参数范围；“平成过载”对应高振铃、荧光绿/洋红和强磁头故障的截图风格
- 扫描线、横向彩色条纹和 Dropout 短横划痕分别独立控制；重复的噪声与磁头切换参数已收敛
- 每个参数在鼠标停留约 0.7 秒后显示作用说明；完整实现路径见 `PARAMETERS.md`
- 参数保存和 FFmpeg 成片渲染

输入视频为 `../old-digital-camera.mp4`，默认输出为
`../old-digital-camera-vhs-crt-ui.mp4`。

实时预览运行在 GPU 中；最终成片由本地 FFmpeg 渲染，因此细小噪点的形状可能与预览略有区别，效果强度和运动逻辑保持一致。
