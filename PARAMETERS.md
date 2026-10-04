# Signal Deck 参数与实现路径

界面参数在 `static/app.js` 的 `parameterGroups` 中定义。实时预览由同文件的 WebGL fragment shader 执行；点击“渲染成片”后，`server.py` 把同一份设置传给 `render_engine.py`，后者生成 FFmpeg filter graph。所有预设均完整包含下列 42 个参数。

## VHS 信号

| 参数键 | 界面名称 | 作用 | WebGL 实时预览 | FFmpeg 成片 |
|---|---|---|---|---|
| `chroma_smear` | 色度拖尾 | 将色度向水平方向拖开 | `signalSample()` 对 YIQ 色度做加权多点采样 | `chroma_radius` 扩大 Cb/Cr 水平模糊半径 |
| `tape_wave` | 逐行波动 | 让各扫描行产生平滑的水平弯曲 | `main()` 的 `lineA`、`lineB` 和 `keyed` 修改 `uv.x` | `wave` 表达式写入 `geq` 的 `sample_x` |
| `tape_crease` | 磁带折痕 | 生成移动折痕并局部拉扯画面 | 高斯形 `crease` 修改 `uv.x`，并叠加折痕亮度 | `crease` 表达式同时改变采样位置和亮度 |
| `crease_speed` | 折痕速度 | 控制折痕上下移动速度 | 控制 `creaseCenter` 的时间频率 | 控制 `crease_center` 的 `sin(T)` 频率 |
| `crease_discoloration` | 折痕偏色 | 改变折痕区域的色度 | 折痕区域旋转 YIQ 的 I/Q 分量 | 折痕区域衰减 Cb/Cr 分量 |

## 平成翻录

| 参数键 | 界面名称 | 作用 | WebGL 实时预览 | FFmpeg 成片 |
|---|---|---|---|---|
| `jpeg_quality` | JPEG 质量 | 降低数字翻录质量 | `sourceAt()` 做块采样和色阶量化 | 先缩小再用 nearest 放大 |
| `tone_low` | 黑位压缩 | 截断暗部并提高对比 | `hardwareAt()` 重映射输入黑点 | `lutrgb` 重映射 RGB 黑点 |
| `tone_high` | 白位截断 | 让亮部更早达到白色 | `hardwareAt()` 重映射输入白点 | `lutrgb` 重映射 RGB 白点 |
| `sharpen_amount` | 粗锐化振铃 | 增强硬边和翻录描边 | `hardwareAt()` 用原图减水平模糊 | FFmpeg `unsharp` 的 amount |
| `sharpen_size` | 振铃宽度 | 控制振铃离边缘的距离 | 控制两侧采样间距 | 控制 `unsharp` kernel 尺寸 |
| `cutoff_y` | 亮度带宽 | 限制亮度水平分辨率 | `signalSample()` 混合左右亮度采样 | `boxblur` 的 luma radius |
| `cutoff_i` | I 色差带宽 | 控制橙蓝色差扩散 | 单独模糊 YIQ 的 I 分量 | 参与 Cb/Cr 水平模糊半径计算 |
| `cutoff_q` | Q 色差带宽 | 控制紫绿色差扩散 | 单独模糊 YIQ 的 Q 分量 | 参与 Cb/Cr 水平模糊半径计算 |
| `chroma_crosstalk` | 垂直色度串扰 | 让上下行的颜色互相渗透 | 混合上下色度采样 | `gblur` 仅处理 Cb/Cr 平面 |
| `chroma_shift_x` | 水平色度偏移 | 让色度整体偏离亮度 | 色度从水平偏移后的坐标采样 | Cb/Cr 的 `sample_x` 加固定偏移 |
| `heisei_noise_y` | 亮度噪声 | 添加黑白随机噪点 | 在 YIQ 的 Y 分量加入逐帧 hash | FFmpeg `noise` 的 `c0s` |
| `heisei_noise_c` | 色度噪声 | 添加彩色随机噪点 | 在 YIQ 的 I/Q 分量加入逐帧 hash | FFmpeg `noise` 的 `c1s`、`c2s` |
| `color_banding` | 横向彩色条纹 | 添加移动的绿/洋红横带 | 独立正弦色带叠加 | `geq` 独立调制 Cb/Cr；与扫描线无耦合 |
| `jitter_freq` | 逐行抖动频率 | 控制行位移的垂直频率 | `lineJitter` 的正弦频率 | `line_jitter` 表达式的频率 |
| `jitter_amp` | 逐行抖动幅度 | 控制各行水平错位距离 | `lineJitter` 修改 `uv.x` | `line_jitter` 写入 `sample_x` |
| `jitter_roughness` | 抖动粗糙度 | 控制多少相邻行共享一次位移 | 对行号分组后计算抖动 | `floor(Y / roughness)` 对行分组 |
| `head_switch_rows` | 磁头切换高度 | 定义底部故障区域高度 | 生成底部 `head` mask；0 时显式关闭 | `gt(Y,H-rows)` 生成底部 mask |
| `head_switch_pull` | 底部拉扯 | 水平拉扯磁头切换区域 | `head` mask 修改 `uv.x` | `head_drag` 写入 `sample_x` |
| `head_switch_noise` | 底部静电密度 | 在底部故障区加入静电 | `headStatic` hash 覆盖颜色 | `geq` 在 `head` mask 内加入噪声 |
| `cast_r` | 红色偏移 | 缩放红色通道 | `hardwareAt()` 乘 `u_cast.r` | `lutrgb` 的红色通道倍率 |
| `cast_g` | 绿色偏移 | 缩放绿色通道 | `hardwareAt()` 乘 `u_cast.g` | `lutrgb` 的绿色通道倍率 |
| `cast_b` | 蓝色偏移 | 缩放蓝色通道 | `hardwareAt()` 乘 `u_cast.b` | `lutrgb` 的蓝色通道倍率 |
| `dropout_count` | Dropout 短横划痕 | 控制每帧划痕数量 | 固定 50 次循环，以 count 激活实例 | 按 count 生成 `between()` 划痕表达式 |
| `dropout_max_len` | 划痕最大长度 | 控制短横划痕长度 | 转成画布归一化宽度 | 直接作为输出像素长度 |
| `dropout_strength` | 划痕强度 | 控制划痕覆盖强度 | `mix()` 的覆盖权重 | `geq` 划痕亮度幅度 |

## 高光与色彩

| 参数键 | 界面名称 | 作用 | WebGL 实时预览 | FFmpeg 成片 |
|---|---|---|---|---|
| `chromatic_aberration` | 边缘色散 | 让红蓝通道从中心径向分离 | 依据 `(uv - 0.5)` 分别偏移 R/B | `rgbashift` 分别平移 R/B；为近似实现 |
| `highlight_threshold` | 高光阈值 | 决定哪些亮部进入 Bloom | `smoothstep()` 生成高光 mask | `lutrgb` 生成高光 mask |
| `bloom_strength` | 高光 Bloom | 扩散超过阈值的亮部 | 六点采样后用 screen 公式混合 | 高光分支 `gblur` 后 screen blend |
| `bloom_radius` | Bloom 半径 | 控制高光扩散范围 | 控制六点采样半径 | 控制高光分支 `gblur sigma` |
| `overexposure` | 过曝 | 推亮画面并压缩高光层次 | 指数曝光曲线 | FFmpeg `eq` 的 brightness 与 contrast |
| `phosphor_glow` | 磷光辉光 | 扩散整幅画面，不受阈值限制 | 四点模糊后 screen 混合 | 全画面模糊分支 screen blend |
| `phosphor_blur` | 辉光半径 | 控制全画面辉光范围 | 控制四点采样半径 | 控制全画面 `gblur sigma` |

## CRT 屏幕

| 参数键 | 界面名称 | 作用 | WebGL 实时预览 | FFmpeg 成片 |
|---|---|---|---|---|
| `scanlines` | 扫描线强度 | 统一控制扫描线明暗；100% 配合 2 px 间距接近隔行扫描 | 对 `gl_FragCoord.y` 计算周期亮度 | `geq` 按输出行号调制亮度 |
| `scanline_spacing` | 扫描线间距 | 控制扫描线周期 | 依据预览高度换算像素间距 | 直接使用输出像素间距 |
| `curvature` | 屏幕曲率 | 模拟凸面显像管 | 径向修改纹理坐标 | FFmpeg `lenscorrection` |
| `vignette` | 暗角 | 压暗画面四周 | 径向 `smoothstep()` mask | FFmpeg `vignette` |
| `horizontal_jitter` | 整体水平漂移 | 让整帧左右移动 | 时间正弦统一修改 `uv.x` | crop 窗口随 `sin(t)` 水平移动 |

## 收敛记录

- 删除 `switching_noise`：它与 `head_switch_rows`、`head_switch_pull`、`head_switch_noise` 重复，旧值会在加载时迁移到磁头切换参数。
- 删除 `noise` 与 `color_noise`：分别并入 `heisei_noise_y` 与 `heisei_noise_c`，避免同一随机噪声被两套参数叠加。
- 删除 `heisei_scanlines` 与 `heisei_scanline_weight`：并入统一的 `scanlines` 与 `scanline_spacing`。
- 将误名的 `dropout_noise_freq` 改为 `dropout_strength`；旧设置仍可迁移。
- 删除未被 shader 使用的 `u_texel` uniform，并修正磁头切换高度为 0 时的未定义 `smoothstep()` 路径。
