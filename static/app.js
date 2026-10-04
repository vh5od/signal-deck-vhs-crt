const parameterGroups = [
  {
    title: "VHS 信号",
    controls: [
      ["chroma_smear", "色度拖尾", 0, 100, 1, "%"],
      ["tape_wave", "逐行波动", 0, 100, 1, "%"],
      ["tape_crease", "磁带折痕", 0, 100, 1, "%"],
      ["crease_speed", "折痕速度", 0, 100, 1, "%"],
      ["crease_discoloration", "折痕偏色", 0, 100, 1, "%"],
    ],
  },
  {
    title: "平成翻录",
    controls: [
      ["jpeg_quality", "JPEG 质量", 1, 100, 1, ""],
      ["tone_low", "黑位压缩", 0, 50, 1, ""],
      ["tone_high", "白位截断", 200, 255, 1, ""],
      ["sharpen_amount", "粗锐化振铃", 0, 10, 0.1, ""],
      ["sharpen_size", "振铃宽度", 1, 5, 1, " px"],
      ["cutoff_y", "亮度带宽", 0.01, 1, 0.01, ""],
      ["cutoff_i", "I 色差带宽", 0.001, 0.1, 0.001, ""],
      ["cutoff_q", "Q 色差带宽", 0.001, 0.1, 0.001, ""],
      ["chroma_crosstalk", "垂直色度串扰", 0, 0.95, 0.01, ""],
      ["chroma_shift_x", "水平色度偏移", 0, 15, 1, " px"],
      ["heisei_noise_y", "亮度噪声", 0, 0.1, 0.001, ""],
      ["heisei_noise_c", "色度噪声", 0, 0.1, 0.001, ""],
      ["color_banding", "横向彩色条纹", 0, 100, 1, "%"],
      ["jitter_freq", "逐行抖动频率", 0.01, 0.2, 0.01, ""],
      ["jitter_amp", "逐行抖动幅度", 0, 5, 0.1, " px"],
      ["jitter_roughness", "抖动粗糙度", 0.3, 10, 0.1, ""],
      ["head_switch_rows", "磁头切换高度", 0, 100, 1, " px"],
      ["head_switch_pull", "底部拉扯", 0, 50, 0.1, " px"],
      ["head_switch_noise", "底部静电密度", 0, 1, 0.05, ""],
      ["cast_r", "红色偏移", 0.8, 1.2, 0.01, ""],
      ["cast_g", "绿色偏移", 0.8, 1.2, 0.01, ""],
      ["cast_b", "蓝色偏移", 0.8, 1.2, 0.01, ""],
      ["dropout_count", "Dropout 短横划痕", 0, 50, 1, ""],
      ["dropout_max_len", "划痕最大长度", 10, 200, 1, " px"],
      ["dropout_strength", "划痕强度", 0, 1, 0.1, ""],
    ],
  },
  {
    title: "高光与色彩",
    controls: [
      ["chromatic_aberration", "边缘色散", 0, 100, 1, "%"],
      ["highlight_threshold", "高光阈值", 80, 245, 1, ""],
      ["bloom_strength", "高光 Bloom", 0, 100, 1, "%"],
      ["bloom_radius", "Bloom 半径", 0.5, 20, 0.5, " px"],
      ["overexposure", "过曝", 0, 100, 1, "%"],
      ["phosphor_glow", "磷光辉光", 0, 100, 1, "%"],
      ["phosphor_blur", "辉光半径", 0.5, 16, 0.5, " px"],
    ],
  },
  {
    title: "CRT 屏幕",
    controls: [
      ["scanlines", "扫描线强度", 0, 100, 1, "%"],
      ["scanline_spacing", "扫描线间距", 2, 10, 1, " px"],
      ["curvature", "屏幕曲率", 0, 100, 1, "%"],
      ["vignette", "暗角", 0, 100, 1, "%"],
      ["horizontal_jitter", "整体水平漂移", 0, 100, 1, "%"],
    ],
  },
];

const parameterHelp = {
  chroma_smear: "把色度向水平方向拖开，形成 VHS 常见的颜色尾巴；与“水平色度偏移”的固定错位不同。",
  tape_wave: "让每一行产生缓慢变化的水平弯曲，模拟磁带走带不稳。",
  tape_crease: "生成一条随时间移动的局部折痕，并在折痕处拉扯画面。",
  crease_speed: "控制磁带折痕上下移动的速度；磁带折痕为 0 时不生效。",
  crease_discoloration: "改变折痕区域的色相与色度；磁带折痕为 0 时不生效。",
  jpeg_quality: "降低数字翻录质量。数值越低，色阶量化和块状边缘越明显。",
  tone_low: "抬高黑色截断点，压掉暗部细节并增加硬对比。",
  tone_high: "降低白色截断点，让亮部更早变白；也会影响高光 Bloom 的触发范围。",
  sharpen_amount: "增加粗糙锐化与边缘振铃，强化老式数字翻录的描边感。",
  sharpen_size: "控制锐化振铃离主体边缘的距离；粗锐化振铃为 0 时不生效。",
  cutoff_y: "限制亮度信号的水平带宽。数值越低，画面细节越软。",
  cutoff_i: "限制 YIQ 的 I 色差信号带宽。数值越低，橙蓝方向的颜色越容易横向扩散。",
  cutoff_q: "限制 YIQ 的 Q 色差信号带宽。数值越低，紫绿方向的颜色越容易横向扩散。",
  chroma_crosstalk: "让上下相邻行的色度互相渗透，产生垂直方向的彩色拖染。",
  chroma_shift_x: "把全部色度相对亮度水平错开，形成固定的彩色重影。",
  heisei_noise_y: "只给亮度通道加入逐帧随机噪点，不改变颜色。",
  heisei_noise_c: "只给色度通道加入逐帧随机噪点，形成彩色雪花。",
  color_banding: "加入随时间移动的洋红与绿色横向色带；它独立于扫描线。",
  jitter_freq: "控制逐行抖动在垂直方向出现的频率；逐行抖动幅度为 0 时不生效。",
  jitter_amp: "让不同扫描行产生不同的水平位移，模拟行同步不稳。",
  jitter_roughness: "控制多少相邻行共享同一次位移；逐行抖动幅度为 0 时不生效。",
  head_switch_rows: "设置画面底部磁头切换故障区域的高度。",
  head_switch_pull: "水平拉扯磁头切换区域；磁头切换高度为 0 时不生效。",
  head_switch_noise: "在磁头切换区域加入静电噪声；磁头切换高度为 0 时不生效。",
  cast_r: "缩放红色通道，低于 1 减少红色，高于 1 增加红色。",
  cast_g: "缩放绿色通道，低于 1 减少绿色，高于 1 增加绿色。",
  cast_b: "缩放蓝色通道，低于 1 减少蓝色，高于 1 增加蓝色。",
  dropout_count: "控制每帧出现的短横划痕数量；这是磁带掉磁，不是扫描线。",
  dropout_max_len: "控制 Dropout 横向划痕的最大长度；数量为 0 时不生效。",
  dropout_strength: "控制 Dropout 划痕覆盖原画面的强度；数量为 0 时不生效。",
  chromatic_aberration: "让红、蓝通道从画面中心向相反方向分离，越靠近边缘越明显。",
  highlight_threshold: "设定高光 Bloom 的起始亮度；数值越低，更多区域会发光。",
  bloom_strength: "只扩散超过高光阈值的亮部，形成过曝光晕。",
  bloom_radius: "控制高光 Bloom 的扩散半径；高光 Bloom 为 0 时不生效。",
  overexposure: "用非线性曝光曲线推亮画面并压缩高光层次。",
  phosphor_glow: "扩散整幅画面的亮度，模拟 CRT 荧光粉余辉；不受高光阈值限制。",
  phosphor_blur: "控制磷光辉光的扩散半径；磷光辉光为 0 时不生效。",
  scanlines: "统一控制扫描线明暗强度。间距为 2 px 时接近平成隔行纹理。",
  scanline_spacing: "控制相邻扫描线的像素间距；扫描线强度为 0 时不生效。",
  curvature: "扭曲画面边缘，模拟凸面 CRT 屏幕。",
  vignette: "压暗画面四周，模拟显像管边缘亮度衰减。",
  horizontal_jitter: "让整帧画面左右漂移；与逐行抖动的局部错位不同。",
};

const parameterKeys = parameterGroups.flatMap((group) =>
  group.controls.map(([key]) => key)
);

function normalizeSettings(raw = {}) {
  const migrated = { ...raw };
  migrated.dropout_strength ??= migrated.dropout_noise_freq;
  migrated.heisei_noise_y = Math.min(0.1, Math.max(
    Number(migrated.heisei_noise_y || 0),
    Number(migrated.noise || 0) / 100 * 0.075,
  ));
  migrated.heisei_noise_c = Math.min(0.1, Math.max(
    Number(migrated.heisei_noise_c || 0),
    Number(migrated.color_noise || 0) / 100 * 0.08,
  ));
  if (Number(migrated.switching_noise || 0) > 0) {
    const legacy = Number(migrated.switching_noise);
    migrated.head_switch_rows = Math.max(Number(migrated.head_switch_rows || 0), legacy * 0.5);
    migrated.head_switch_pull = Math.max(Number(migrated.head_switch_pull || 0), legacy * 0.3);
    migrated.head_switch_noise = Math.max(Number(migrated.head_switch_noise || 0), legacy / 125);
  }
  if (Number(migrated.heisei_scanlines || 0) > 0) {
    const weight = Number(migrated.heisei_scanline_weight || 0.75);
    migrated.scanlines = Math.max(Number(migrated.scanlines || 0), (1 - weight) / 0.42 * 100);
    migrated.scanline_spacing = 2;
  }
  const defaults = presets.balanced.values;
  return Object.fromEntries(parameterKeys.map((key) => [key, migrated[key] ?? defaults[key]]));
}

const neutralHeisei = {
  jpeg_quality: 100, tone_low: 0, tone_high: 255,
  sharpen_amount: 0, sharpen_size: 2,
  cutoff_y: 1, cutoff_i: 0.1, cutoff_q: 0.1,
  chroma_crosstalk: 0, chroma_shift_x: 0,
  heisei_noise_y: 0, heisei_noise_c: 0, color_banding: 0,
  jitter_freq: 0.05, jitter_amp: 0, jitter_roughness: 0.3,
  head_switch_rows: 0, head_switch_pull: 0, head_switch_noise: 0,
  cast_r: 1, cast_g: 1, cast_b: 1,
  dropout_count: 0, dropout_max_len: 80, dropout_strength: 0,
};

const presets = {
  balanced: {
    label: "平衡信号",
    values: {
      chroma_smear: 38, tape_wave: 22, tape_crease: 26, crease_speed: 35,
      crease_discoloration: 32,
      chromatic_aberration: 40, highlight_threshold: 178, bloom_strength: 34,
      bloom_radius: 7, overexposure: 30, phosphor_glow: 16, phosphor_blur: 4.5,
      scanlines: 45, scanline_spacing: 4, curvature: 55, vignette: 65,
      horizontal_jitter: 12,
      ...neutralHeisei,
      heisei_noise_y: 0.02, heisei_noise_c: 0.015,
      head_switch_rows: 9, head_switch_pull: 5.4, head_switch_noise: 0.144,
    },
  },
  tape: {
    label: "磁带损伤",
    values: {
      chroma_smear: 72, tape_wave: 58, tape_crease: 76, crease_speed: 62,
      crease_discoloration: 70,
      chromatic_aberration: 48, highlight_threshold: 164, bloom_strength: 28,
      bloom_radius: 5.5, overexposure: 36, phosphor_glow: 12, phosphor_blur: 3,
      scanlines: 38, scanline_spacing: 4, curvature: 42, vignette: 58,
      horizontal_jitter: 44,
      ...neutralHeisei,
      heisei_noise_y: 0.046, heisei_noise_c: 0.038,
      head_switch_rows: 34, head_switch_pull: 20.4, head_switch_noise: 0.544,
    },
  },
  heisei: {
    label: "平成 VHS",
    values: {
      chroma_smear: 0, tape_wave: 0, tape_crease: 0, crease_speed: 40,
      crease_discoloration: 0,
      chromatic_aberration: 0, highlight_threshold: 230, bloom_strength: 0,
      bloom_radius: 4, overexposure: 0, phosphor_glow: 0, phosphor_blur: 3,
      scanlines: 0, scanline_spacing: 4, curvature: 0, vignette: 0,
      horizontal_jitter: 0,
      jpeg_quality: 65, tone_low: 16, tone_high: 230,
      sharpen_amount: 3, sharpen_size: 2,
      cutoff_y: 0.4, cutoff_i: 0.03, cutoff_q: 0.03,
      chroma_crosstalk: 0.4, chroma_shift_x: 3,
      heisei_noise_y: 0.02, heisei_noise_c: 0.01, color_banding: 0,
      jitter_freq: 0.05, jitter_amp: 0.5, jitter_roughness: 0.3,
      head_switch_rows: 15, head_switch_pull: 30, head_switch_noise: 0.4,
      cast_r: 0.95, cast_g: 1.05, cast_b: 1,
      dropout_count: 2, dropout_max_len: 80, dropout_strength: 0.8,
    },
  },
  heisei_extreme: {
    label: "平成过载",
    values: {
      chroma_smear: 0, tape_wave: 0, tape_crease: 0, crease_speed: 40,
      crease_discoloration: 0,
      chromatic_aberration: 0, highlight_threshold: 230, bloom_strength: 0,
      bloom_radius: 4, overexposure: 0, phosphor_glow: 0, phosphor_blur: 3,
      scanlines: 100, scanline_spacing: 2, curvature: 0, vignette: 0,
      horizontal_jitter: 0,
      jpeg_quality: 22, tone_low: 34, tone_high: 208,
      sharpen_amount: 8.5, sharpen_size: 3,
      cutoff_y: 0.12, cutoff_i: 0.004, cutoff_q: 0.006,
      chroma_crosstalk: 0.82, chroma_shift_x: 8,
      heisei_noise_y: 0.075, heisei_noise_c: 0.085, color_banding: 88,
      jitter_freq: 0.08, jitter_amp: 2.2, jitter_roughness: 3.2,
      head_switch_rows: 72, head_switch_pull: 46, head_switch_noise: 0.9,
      cast_r: 0.82, cast_g: 1.2, cast_b: 1.08,
      dropout_count: 12, dropout_max_len: 165, dropout_strength: 1,
    },
  },
  crt: {
    label: "干净 CRT",
    values: {
      chroma_smear: 12, tape_wave: 3, tape_crease: 0, crease_speed: 25,
      crease_discoloration: 0,
      chromatic_aberration: 25, highlight_threshold: 188, bloom_strength: 40,
      bloom_radius: 8.5, overexposure: 24, phosphor_glow: 24, phosphor_blur: 5.5,
      scanlines: 62, scanline_spacing: 3, curvature: 68, vignette: 72,
      horizontal_jitter: 2,
      ...neutralHeisei,
      heisei_noise_y: 0.01, heisei_noise_c: 0.005,
    },
  },
};

let settings = structuredClone(presets.balanced.values);
let activePreset = "balanced";
let bypass = false;
let saveTimer;

const controlsRoot = document.querySelector("#controls");
const video = document.querySelector("#sourceVideo");
const canvas = document.querySelector("#previewCanvas");
const previewMessage = document.querySelector("#previewMessage");
const playButton = document.querySelector("#playButton");
const timecode = document.querySelector("#timecode");
const timeline = document.querySelector("#timeline");
const timelineFill = document.querySelector("#timelineFill");
const timelineHead = document.querySelector("#timelineHead");
const compareButton = document.querySelector("#compareButton");
const soundButton = document.querySelector("#soundButton");
const renderButton = document.querySelector("#renderButton");
const saveButton = document.querySelector("#saveButton");
const renderStrip = document.querySelector("#renderStrip");
const renderStatus = document.querySelector("#renderStatus");
const renderDetail = document.querySelector("#renderDetail");
const progressBar = document.querySelector("#progressBar");
const outputLink = document.querySelector("#outputLink");
const sourceButton = document.querySelector("#sourceButton");
const sourceInput = document.querySelector("#sourceInput");
const sourceLabel = document.querySelector("#sourceLabel");
const durationLabel = document.querySelector("#durationLabel");
const uploadOverlay = document.querySelector("#uploadOverlay");
const uploadTitle = document.querySelector("#uploadTitle");
const uploadDetail = document.querySelector("#uploadDetail");
const uploadProgress = document.querySelector("#uploadProgress");
const parameterTooltip = document.querySelector("#parameterTooltip");
let tooltipTimer;

function hideParameterTooltip() {
  clearTimeout(tooltipTimer);
  parameterTooltip.classList.remove("visible");
  parameterTooltip.hidden = true;
}

function queueParameterTooltip(row, delay = 700) {
  clearTimeout(tooltipTimer);
  tooltipTimer = setTimeout(() => {
    parameterTooltip.textContent = row.dataset.help;
    parameterTooltip.hidden = false;
    const rect = row.getBoundingClientRect();
    const gap = 8;
    const width = parameterTooltip.offsetWidth;
    const height = parameterTooltip.offsetHeight;
    const left = Math.max(gap, Math.min(window.innerWidth - width - gap, rect.right - width));
    const below = rect.bottom + gap;
    const top = below + height <= window.innerHeight - gap
      ? below
      : Math.max(gap, rect.top - height - gap);
    parameterTooltip.style.left = `${left}px`;
    parameterTooltip.style.top = `${top}px`;
    requestAnimationFrame(() => parameterTooltip.classList.add("visible"));
  }, delay);
}

function makeControls() {
  controlsRoot.innerHTML = "";
  parameterGroups.forEach((group) => {
    const section = document.createElement("section");
    section.className = "control-group";
    const heading = document.createElement("h2");
    heading.className = "group-title";
    heading.textContent = group.title;
    section.appendChild(heading);

    group.controls.forEach(([key, label, min, max, step, unit]) => {
      const row = document.createElement("div");
      row.className = "parameter";
      row.dataset.help = parameterHelp[key];
      row.innerHTML = `
        <div class="parameter-head">
          <label for="control-${key}">${label}<i class="help-mark" aria-hidden="true">?</i></label>
          <output id="value-${key}"></output>
        </div>
        <div class="parameter-track">
          <input id="control-${key}" type="range" min="${min}" max="${max}" step="${step}" />
          <em>${unit || ""}</em>
        </div>`;
      const input = row.querySelector("input");
      input.dataset.key = key;
      input.dataset.unit = unit;
      input.setAttribute("aria-label", `${label}：${parameterHelp[key]}`);
      input.addEventListener("input", () => {
        settings[key] = Number(input.value);
        activePreset = null;
        updateControl(input);
        updatePresetUI();
        scheduleSave();
      });
      row.addEventListener("pointerenter", () => queueParameterTooltip(row));
      row.addEventListener("pointerleave", hideParameterTooltip);
      input.addEventListener("focus", () => queueParameterTooltip(row, 250));
      input.addEventListener("blur", hideParameterTooltip);
      section.appendChild(row);
    });
    controlsRoot.appendChild(section);
  });
}

function updateControl(input) {
  const key = input.dataset.key;
  const value = settings[key];
  input.value = value;
  const min = Number(input.min);
  const max = Number(input.max);
  const fill = ((value - min) / (max - min)) * 100;
  input.style.setProperty("--fill", `${fill}%`);
  const step = Number(input.step);
  const digits = step < 0.01 ? 3 : step < 0.1 ? 2 : step < 1 ? 1 : 0;
  document.querySelector(`#value-${key}`).value = Number(value).toFixed(digits);
}

function updateAllControls() {
  document.querySelectorAll('input[type="range"]').forEach(updateControl);
}

function updatePresetUI() {
  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.classList.toggle("active", button.dataset.preset === activePreset);
  });
  document.querySelector("#presetName").textContent = activePreset
    ? presets[activePreset].label
    : "自定义信号";
}

function applyPreset(name) {
  activePreset = name;
  settings = structuredClone(presets[name].values);
  updateAllControls();
  updatePresetUI();
  scheduleSave();
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveSettings, 500);
}

async function saveSettings() {
  const response = await fetch("/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (response.ok) {
    saveButton.textContent = "已保存";
    setTimeout(() => { saveButton.textContent = "保存参数"; }, 1000);
  }
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  const frames = Math.floor((seconds % 1) * 24).toString().padStart(2, "0");
  return `${minutes}:${secs}.${frames}`;
}

function updateSourceLabel(name, duration) {
  const cleanName = (name || "本地视频").replace(/\.[^.]+$/, "");
  const shortName = cleanName.length > 24 ? `${cleanName.slice(0, 22)}…` : cleanName;
  sourceLabel.textContent = `${shortName} · ${Number(duration || 0).toFixed(2)}s`;
  sourceLabel.title = name || "";
}

function uploadSource(file) {
  if (!file) return;
  const allowed = [".mp4", ".mov", ".m4v", ".webm", ".mkv"];
  const suffix = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!allowed.includes(suffix)) {
    renderStrip.classList.add("error");
    renderStatus.textContent = "无法导入";
    renderDetail.textContent = "请选择 MP4、MOV、M4V、WebM 或 MKV 视频";
    return;
  }

  video.pause();
  sourceButton.disabled = true;
  renderButton.disabled = true;
  uploadOverlay.hidden = false;
  uploadTitle.textContent = "正在导入视频";
  uploadDetail.textContent = "0%";
  uploadProgress.style.width = "0%";

  const request = new XMLHttpRequest();
  request.open("POST", `/api/source?filename=${encodeURIComponent(file.name)}`);
  request.setRequestHeader("Content-Type", file.type || "application/octet-stream");
  request.upload.addEventListener("progress", (event) => {
    if (!event.lengthComputable) return;
    const percent = Math.round(event.loaded / event.total * 100);
    uploadDetail.textContent = `${percent}%`;
    uploadProgress.style.width = `${percent}%`;
  });
  request.addEventListener("load", () => {
    let payload = {};
    try { payload = JSON.parse(request.responseText); } catch (_) {}
    if (request.status < 200 || request.status >= 300) {
      uploadTitle.textContent = "导入失败";
      uploadDetail.textContent = payload.message || "无法读取这个视频";
      renderStrip.classList.add("error");
      renderStatus.textContent = "导入失败";
      renderDetail.textContent = payload.message || "无法读取这个视频";
      setTimeout(() => { uploadOverlay.hidden = true; }, 2200);
      sourceButton.disabled = false;
      renderButton.disabled = false;
      return;
    }
    uploadTitle.textContent = "视频已替换";
    uploadDetail.textContent = "正在建立实时预览…";
    uploadProgress.style.width = "100%";
    outputLink.hidden = true;
    updateSourceLabel(payload.name || file.name, payload.duration);
    video.dataset.sourceName = payload.name || file.name;
    video.src = `/media/source?v=${Date.now()}`;
    video.load();
    renderStrip.classList.remove("error", "rendering");
    renderStatus.textContent = "视频已替换";
    renderDetail.textContent = "实时预览已更新，可以继续调节或渲染";
    setTimeout(() => { uploadOverlay.hidden = true; }, 450);
    sourceButton.disabled = false;
    renderButton.disabled = false;
    video.play().catch(() => {});
  });
  request.addEventListener("error", () => {
    uploadTitle.textContent = "导入失败";
    uploadDetail.textContent = "本地服务连接中断";
    sourceButton.disabled = false;
    renderButton.disabled = false;
    setTimeout(() => { uploadOverlay.hidden = true; }, 2200);
  });
  request.addEventListener("loadend", () => { sourceInput.value = ""; });
  request.send(file);
}

function updateTransport() {
  const ratio = video.duration ? video.currentTime / video.duration : 0;
  timecode.textContent = formatTime(video.currentTime || 0);
  timelineFill.style.width = `${ratio * 100}%`;
  timelineHead.style.left = `${ratio * 100}%`;
  playButton.innerHTML = video.paused
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zm6 0h4v14h-4z"/></svg>';
}

function togglePlay() {
  if (video.paused) video.play();
  else video.pause();
}

function setBypass(value) {
  bypass = value;
  compareButton.classList.toggle("active", value);
  compareButton.textContent = value ? "正在看原片" : "按住对比";
}

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

function initWebGL() {
  const gl = canvas.getContext("webgl", { alpha: false, antialias: false });
  if (!gl) throw new Error("浏览器不支持 WebGL 实时预览");

  const vertex = `
    attribute vec2 a_position;
    varying vec2 v_uv;
    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;

  const fragment = `
    precision highp float;
    varying vec2 v_uv;
    uniform sampler2D u_video;
    uniform vec2 u_resolution;
    uniform vec2 u_sourceSize;
    uniform float u_sourceAspect;
    uniform float u_viewAspect;
    uniform float u_time;
    uniform float u_bypass;
    uniform float u_chromaSmear;
    uniform float u_tapeWave;
    uniform float u_tapeCrease;
    uniform float u_creaseSpeed;
    uniform float u_creaseDiscoloration;
    uniform float u_ca;
    uniform float u_threshold;
    uniform float u_bloom;
    uniform float u_bloomRadius;
    uniform float u_exposure;
    uniform float u_glow;
    uniform float u_glowRadius;
    uniform float u_scanlines;
    uniform float u_spacing;
    uniform float u_curvature;
    uniform float u_vignette;
    uniform float u_jitter;
    uniform float u_jpeg;
    uniform float u_blackCrush;
    uniform float u_whiteClip;
    uniform float u_ringing;
    uniform float u_ringingWidth;
    uniform float u_lumaBand;
    uniform float u_chromaIBand;
    uniform float u_chromaQBand;
    uniform float u_verticalBleed;
    uniform vec3 u_cast;
    uniform float u_dropoutCount;
    uniform float u_dropoutLength;
    uniform float u_dropoutIntensity;
    uniform float u_chromaShift;
    uniform float u_heiseiNoiseY;
    uniform float u_heiseiNoiseC;
    uniform float u_colorBanding;
    uniform float u_lineJitterFreq;
    uniform float u_lineJitterAmp;
    uniform float u_lineJitterRoughness;
    uniform float u_headRows;
    uniform float u_headPull;
    uniform float u_headNoise;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 345.45));
      p += dot(p, p + 34.345);
      return fract(p.x * p.y);
    }
    vec3 rgb2yiq(vec3 c) {
      return vec3(
        dot(c, vec3(0.299, 0.587, 0.114)),
        dot(c, vec3(0.596, -0.274, -0.322)),
        dot(c, vec3(0.211, -0.523, 0.312))
      );
    }
    vec3 yiq2rgb(vec3 c) {
      return vec3(
        c.x + 0.956 * c.y + 0.621 * c.z,
        c.x - 0.272 * c.y - 0.647 * c.z,
        c.x - 1.106 * c.y + 1.703 * c.z
      );
    }
    vec2 sourceUV(vec2 uv) {
      vec2 fitted = uv;
      if (u_sourceAspect > u_viewAspect) {
        fitted.y = (uv.y - 0.5) * (u_sourceAspect / u_viewAspect) + 0.5;
      } else {
        fitted.x = (uv.x - 0.5) * (u_viewAspect / u_sourceAspect) + 0.5;
      }
      return fitted;
    }
    vec3 rawSourceAt(vec2 uv) {
      vec2 fitted = sourceUV(uv);
      if (fitted.x < 0.0 || fitted.x > 1.0 || fitted.y < 0.0 || fitted.y > 1.0) {
        return vec3(0.0);
      }
      return texture2D(u_video, clamp(fitted, vec2(0.001), vec2(0.999))).rgb;
    }
    vec3 sourceAt(vec2 uv) {
      vec2 fitted = sourceUV(uv);
      if (fitted.x < 0.0 || fitted.x > 1.0 || fitted.y < 0.0 || fitted.y > 1.0) {
        return vec3(0.0);
      }
      vec2 blockSize = vec2(1.0 + u_jpeg * 11.0) / u_sourceSize;
      vec2 blockUV = (floor(fitted / blockSize) + 0.5) * blockSize;
      vec3 clean = texture2D(u_video, clamp(fitted, vec2(0.001), vec2(0.999))).rgb;
      if (u_jpeg < 0.001) return clean;
      vec3 blocked = texture2D(u_video, clamp(blockUV, vec2(0.001), vec2(0.999))).rgb;
      float levels = mix(255.0, 18.0, u_jpeg);
      blocked = floor(blocked * levels + 0.5) / levels;
      return mix(clean, blocked, u_jpeg);
    }
    vec3 hardwareAt(vec2 uv) {
      vec3 col = sourceAt(uv);
      if (u_ringing > 0.001) {
        vec2 ringStep = vec2(u_ringingWidth / u_resolution.x, 0.0);
        vec3 ringBlur = 0.5 * (sourceAt(uv - ringStep) + sourceAt(uv + ringStep));
        col += (col - ringBlur) * u_ringing * 4.5;
      }
      col *= u_cast;
      return clamp((col - vec3(u_blackCrush)) /
                   max(vec3(0.01), vec3(u_whiteClip - u_blackCrush)), 0.0, 1.0);
    }
    vec3 signalSample(vec2 uv) {
      vec3 yiq = vec3(0.0);
      for (int i = 0; i < 6; i++) {
        float fi = float(i);
        vec3 s = rgb2yiq(hardwareAt(uv - vec2(fi * u_chromaSmear, 0.0)));
        yiq += s * vec3(5.0 - fi, fi, fi) / 15.0;
      }
      vec3 shifted = rgb2yiq(hardwareAt(uv - vec2(u_chromaShift / u_resolution.x, 0.0)));
      yiq.yz = shifted.yz;
      float lumaRadius = u_lumaBand * 2.5 / u_resolution.x;
      float blurredY = 0.5 * (rgb2yiq(hardwareAt(uv - vec2(lumaRadius, 0.0))).x +
                              rgb2yiq(hardwareAt(uv + vec2(lumaRadius, 0.0))).x);
      yiq.x = mix(yiq.x, blurredY, u_lumaBand);
      float iRadius = u_chromaIBand * 12.0 / u_resolution.x;
      float qRadius = u_chromaQBand * 16.0 / u_resolution.x;
      vec3 iBlur = rgb2yiq(0.5 * (hardwareAt(uv - vec2(iRadius, 0.0)) +
                                 hardwareAt(uv + vec2(iRadius, 0.0))));
      vec3 qBlur = rgb2yiq(0.5 * (hardwareAt(uv - vec2(qRadius, 0.0)) +
                                 hardwareAt(uv + vec2(qRadius, 0.0))));
      yiq.y = mix(yiq.y, iBlur.y, u_chromaIBand);
      yiq.z = mix(yiq.z, qBlur.z, u_chromaQBand);
      float verticalRadius = u_verticalBleed * 3.0 / u_resolution.y;
      vec3 vertical = rgb2yiq(0.5 * (hardwareAt(uv - vec2(0.0, verticalRadius)) +
                                    hardwareAt(uv + vec2(0.0, verticalRadius))));
      yiq.yz = mix(yiq.yz, vertical.yz, u_verticalBleed);
      float frame = floor(u_time * 24.0);
      yiq.x += (hash(gl_FragCoord.xy + frame * 1.17) - 0.5) * u_heiseiNoiseY;
      yiq.y += (hash(gl_FragCoord.yx + frame * 2.31) - 0.5) * u_heiseiNoiseC;
      yiq.z += (hash(gl_FragCoord.xy - frame * 3.07) - 0.5) * u_heiseiNoiseC;
      return yiq2rgb(yiq);
    }
    float luminance(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

    void main() {
      if (u_bypass > 0.5) {
        gl_FragColor = vec4(rawSourceAt(v_uv), 1.0);
        return;
      }

      vec2 uv = v_uv;
      vec2 centered = uv - 0.5;
      float r2 = dot(centered, centered);
      uv = centered * (1.0 + r2 * u_curvature) + 0.5;

      float row = floor(uv.y * u_resolution.y / max(0.3, u_lineJitterRoughness));
      float lineJitter = sin(row * u_lineJitterFreq * 6.2831853 + floor(u_time * 24.0) * 0.71);
      uv.x += lineJitter * u_lineJitterAmp / u_resolution.x;
      float head = u_headRows > 0.0
        ? smoothstep(1.0 - u_headRows / u_resolution.y, 1.0, 1.0 - uv.y)
        : 0.0;
      uv.x += head * u_headPull / u_resolution.x *
        (0.65 + 0.35 * sin(uv.y * 143.0 + floor(u_time * 24.0)));

      float lineA = sin(uv.y * 34.0 + u_time * 1.7);
      float lineB = sin(uv.y * 131.0 - u_time * 7.9);
      float keyed = hash(vec2(floor(uv.y * 120.0), floor(u_time * 12.0))) - 0.5;
      uv.x += (lineA * 0.65 + lineB * 0.2 + keyed * 0.15) * u_tapeWave;
      uv.x += sin(u_time * 9.0) * u_jitter;

      float creaseCenter = 0.5 + 0.43 * sin(u_time * u_creaseSpeed);
      float crease = exp(-pow((uv.y - creaseCenter) * 34.0, 2.0)) * u_tapeCrease;
      uv.x += crease * (0.012 + 0.012 * hash(vec2(uv.y * 44.0, u_time)));

      vec3 col = signalSample(uv);
      vec3 yiq = rgb2yiq(col);
      float angle = crease * u_creaseDiscoloration;
      float cs = cos(angle), sn = sin(angle);
      yiq.yz = mat2(cs, -sn, sn, cs) * yiq.yz;
      col = yiq2rgb(yiq);

      vec2 radial = (uv - 0.5) * u_ca;
      col.r = mix(col.r, hardwareAt(uv + radial).r, 0.82);
      col.b = mix(col.b, hardwareAt(uv - radial).b, 0.82);

      vec2 bx = vec2(u_bloomRadius, 0.0);
      vec2 by = vec2(0.0, u_bloomRadius);
      vec3 bloom = vec3(0.0);
      bloom += sourceAt(uv + bx);
      bloom += sourceAt(uv - bx);
      bloom += sourceAt(uv + by);
      bloom += sourceAt(uv - by);
      bloom += sourceAt(uv + (bx + by) * 0.7);
      bloom += sourceAt(uv - (bx + by) * 0.7);
      bloom *= 1.0 / 6.0;
      float hi = smoothstep(u_threshold, min(1.0, u_threshold + 0.18), luminance(bloom));
      col = 1.0 - (1.0 - col) * (1.0 - bloom * hi * u_bloom);

      vec3 glow = (sourceAt(uv + vec2(u_glowRadius, 0.0)) +
                   sourceAt(uv - vec2(u_glowRadius, 0.0)) +
                   sourceAt(uv + vec2(0.0, u_glowRadius)) +
                   sourceAt(uv - vec2(0.0, u_glowRadius))) * 0.25;
      col = mix(col, 1.0 - (1.0 - col) * (1.0 - glow * 0.45), u_glow);

      vec3 exposed = 1.0 - exp(-max(col, 0.0) * 1.45);
      col = mix(col, exposed * 1.12, u_exposure);

      float dropout = 0.0;
      float dropoutTone = 0.0;
      for (int i = 0; i < 50; i++) {
        float fi = float(i);
        float active = step(fi + 0.5, u_dropoutCount);
        float frame = floor(u_time * 11.0);
        float y = hash(vec2(fi * 17.3, frame * 0.73));
        float x = hash(vec2(fi * 5.1 + 9.0, frame * 1.17)) * (1.0 - u_dropoutLength);
        float width = (1.0 + floor(hash(vec2(fi, frame)) * 2.0)) / u_resolution.y;
        float row = 1.0 - smoothstep(width, width * 2.2, abs(uv.y - y));
        float segment = step(x, uv.x) * step(uv.x, x + u_dropoutLength);
        float mark = active * row * segment;
        dropout = max(dropout, mark);
        dropoutTone += mark * (hash(vec2(fi + 31.0, frame)) > 0.5 ? 0.92 : 0.04);
      }
      col = mix(col, vec3(clamp(dropoutTone, 0.0, 1.0)),
                clamp(dropout * u_dropoutIntensity, 0.0, 1.0));
      float headStatic = step(1.0 - u_headNoise,
        hash(vec2(gl_FragCoord.x * 0.37, gl_FragCoord.y + floor(u_time * 24.0) * 13.0)));
      col = mix(col, vec3(hash(gl_FragCoord.xy + u_time * 97.0)), head * headStatic * 0.82);
      float colorBand = sin(gl_FragCoord.y * 0.31 + floor(u_time * 24.0) * 0.73);
      col += vec3(0.58, -0.42, 0.68) * colorBand * u_colorBanding * 0.22;
      float scan = 0.5 + 0.5 * sin(gl_FragCoord.y * 6.2831853 / max(2.0, u_spacing));
      col *= 1.0 - u_scanlines * scan;

      float vignette = smoothstep(0.72, 0.22, length((v_uv - 0.5) * vec2(1.0, 0.82)));
      col *= mix(1.0, vignette, u_vignette);
      col += crease * vec3(0.16, 0.14, 0.18);
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }`;

  const program = gl.createProgram();
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program));
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "a_position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  const uniforms = {};
  ["time","bypass","chromaSmear","tapeWave","tapeCrease","creaseSpeed",
   "creaseDiscoloration","ca","threshold",
   "bloom","bloomRadius","exposure","glow","glowRadius","scanlines",
   "spacing","curvature","vignette","jitter","jpeg","blackCrush",
   "whiteClip","ringing","ringingWidth","lumaBand","chromaIBand",
   "chromaQBand","verticalBleed","dropoutCount","dropoutLength",
   "dropoutIntensity","chromaShift","heiseiNoiseY","heiseiNoiseC","colorBanding",
   "lineJitterFreq","lineJitterAmp","lineJitterRoughness","headRows",
   "headPull","headNoise"].forEach((name) => {
    uniforms[name] = gl.getUniformLocation(program, `u_${name}`);
  });
  uniforms.resolution = gl.getUniformLocation(program, "u_resolution");
  uniforms.sourceAspect = gl.getUniformLocation(program, "u_sourceAspect");
  uniforms.viewAspect = gl.getUniformLocation(program, "u_viewAspect");
  uniforms.sourceSize = gl.getUniformLocation(program, "u_sourceSize");
  uniforms.cast = gl.getUniformLocation(program, "u_cast");
  gl.uniform1i(gl.getUniformLocation(program, "u_video"), 0);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const width = Math.max(2, Math.round(rect.width * ratio));
    const height = Math.max(2, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  function render() {
    resize();
    if (video.readyState >= 2) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, video);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform2f(uniforms.sourceSize, video.videoWidth, video.videoHeight);
      gl.uniform1f(uniforms.sourceAspect, video.videoWidth / Math.max(1, video.videoHeight));
      gl.uniform1f(uniforms.viewAspect, canvas.width / Math.max(1, canvas.height));
      gl.uniform1f(uniforms.time, video.currentTime);
      gl.uniform1f(uniforms.bypass, bypass ? 1 : 0);
      gl.uniform1f(uniforms.chromaSmear, settings.chroma_smear * 0.08 / canvas.width);
      gl.uniform1f(uniforms.tapeWave, settings.tape_wave / 100 * 0.006);
      gl.uniform1f(uniforms.tapeCrease, settings.tape_crease / 100);
      gl.uniform1f(uniforms.creaseSpeed, 0.18 + settings.crease_speed / 100 * 1.2);
      gl.uniform1f(uniforms.creaseDiscoloration, settings.crease_discoloration / 100 * 0.85);
      gl.uniform1f(uniforms.ca, settings.chromatic_aberration / 100 * 0.018);
      gl.uniform1f(uniforms.threshold, settings.highlight_threshold / 255);
      gl.uniform1f(uniforms.bloom, settings.bloom_strength / 100);
      gl.uniform1f(uniforms.bloomRadius, settings.bloom_radius / canvas.width);
      gl.uniform1f(uniforms.exposure, settings.overexposure / 100);
      gl.uniform1f(uniforms.glow, settings.phosphor_glow / 100);
      gl.uniform1f(uniforms.glowRadius, settings.phosphor_blur / canvas.width);
      gl.uniform1f(uniforms.scanlines, settings.scanlines / 100 * 0.42);
      gl.uniform1f(uniforms.spacing, settings.scanline_spacing * (canvas.height / 576));
      gl.uniform1f(uniforms.curvature, settings.curvature / 100 * 0.34);
      gl.uniform1f(uniforms.vignette, settings.vignette / 100);
      gl.uniform1f(uniforms.jitter, settings.horizontal_jitter / 100 * 0.004);
      gl.uniform1f(uniforms.jpeg, (100 - settings.jpeg_quality) / 99);
      gl.uniform1f(uniforms.blackCrush, settings.tone_low / 255);
      gl.uniform1f(uniforms.whiteClip, settings.tone_high / 255);
      gl.uniform1f(uniforms.ringing, settings.sharpen_amount / 10);
      gl.uniform1f(uniforms.ringingWidth, settings.sharpen_size);
      gl.uniform1f(uniforms.lumaBand, 1 - settings.cutoff_y);
      gl.uniform1f(uniforms.chromaIBand, 1 - (settings.cutoff_i - 0.001) / 0.099);
      gl.uniform1f(uniforms.chromaQBand, 1 - (settings.cutoff_q - 0.001) / 0.099);
      gl.uniform1f(uniforms.verticalBleed, settings.chroma_crosstalk);
      gl.uniform3f(uniforms.cast, settings.cast_r, settings.cast_g, settings.cast_b);
      gl.uniform1f(uniforms.chromaShift, settings.chroma_shift_x);
      gl.uniform1f(uniforms.heiseiNoiseY, settings.heisei_noise_y);
      gl.uniform1f(uniforms.heiseiNoiseC, settings.heisei_noise_c);
      gl.uniform1f(uniforms.colorBanding, settings.color_banding / 100);
      gl.uniform1f(uniforms.lineJitterFreq, settings.jitter_freq);
      gl.uniform1f(uniforms.lineJitterAmp, settings.jitter_amp);
      gl.uniform1f(uniforms.lineJitterRoughness, settings.jitter_roughness);
      gl.uniform1f(uniforms.headRows, settings.head_switch_rows);
      gl.uniform1f(uniforms.headPull, settings.head_switch_pull);
      gl.uniform1f(uniforms.headNoise, settings.head_switch_noise);
      gl.uniform1f(uniforms.dropoutCount, settings.dropout_count);
      gl.uniform1f(uniforms.dropoutLength, settings.dropout_max_len / canvas.width);
      gl.uniform1f(uniforms.dropoutIntensity, settings.dropout_strength);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      previewMessage.classList.add("hidden");
    }
    updateTransport();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

async function startRender() {
  await saveSettings();
  const response = await fetch("/api/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    const payload = await response.json();
    renderDetail.textContent = payload.message || "无法开始渲染";
    return;
  }
  renderButton.disabled = true;
  pollRender();
}

async function pollRender() {
  try {
    const status = await fetch("/api/status", { cache: "no-store" }).then((r) => r.json());
    renderStrip.classList.toggle("rendering", status.status === "rendering");
    renderStrip.classList.toggle("error", status.status === "error");
    progressBar.style.width = `${status.progress || 0}%`;
    const labels = { idle: "准备就绪", rendering: "正在渲染", complete: "渲染完成", error: "渲染失败" };
    renderStatus.textContent = labels[status.status] || status.status;
    renderDetail.textContent = status.message || "";
    renderButton.disabled = status.status === "rendering";
    sourceButton.disabled = status.status === "rendering";
    if (status.status === "complete" && status.output) {
      outputLink.hidden = false;
      outputLink.href = `/media/output?v=${status.cache_bust || Date.now()}`;
    }
    if (status.status === "rendering") setTimeout(pollRender, 700);
  } catch (error) {
    renderStrip.classList.add("error");
    renderDetail.textContent = "本地渲染服务已断开";
    renderButton.disabled = false;
  }
}

async function boot() {
  makeControls();
  try {
    const saved = await fetch("/api/config", { cache: "no-store" }).then((r) => r.json());
    settings = normalizeSettings(saved);
  } catch (_) {}
  const requestedPreset = new URLSearchParams(location.search).get("preset");
  if (requestedPreset && presets[requestedPreset]) {
    activePreset = requestedPreset;
    settings = structuredClone(presets[requestedPreset].values);
  } else {
    activePreset = Object.keys(presets).find((name) =>
      Object.entries(presets[name].values).every(([key, value]) => settings[key] === value)
    ) || null;
  }
  updateAllControls();
  updatePresetUI();

  document.querySelectorAll("[data-preset]").forEach((button) => {
    button.addEventListener("click", () => applyPreset(button.dataset.preset));
  });
  document.querySelector("#resetButton").addEventListener("click", () => applyPreset(activePreset || "balanced"));
  controlsRoot.addEventListener("scroll", hideParameterTooltip, { passive: true });
  window.addEventListener("resize", hideParameterTooltip, { passive: true });
  saveButton.addEventListener("click", saveSettings);
  renderButton.addEventListener("click", startRender);
  sourceButton.addEventListener("click", () => sourceInput.click());
  sourceInput.addEventListener("change", () => uploadSource(sourceInput.files[0]));
  playButton.addEventListener("click", togglePlay);
  document.querySelector("#screenWrap").addEventListener("click", togglePlay);
  soundButton.addEventListener("click", () => {
    video.muted = !video.muted;
    soundButton.style.opacity = video.muted ? ".4" : "1";
  });

  timeline.addEventListener("pointerdown", (event) => {
    const rect = timeline.getBoundingClientRect();
    video.currentTime = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * video.duration;
  });
  compareButton.addEventListener("pointerdown", () => setBypass(true));
  ["pointerup", "pointerleave", "pointercancel"].forEach((name) =>
    compareButton.addEventListener(name, () => setBypass(false))
  );
  window.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLInputElement) return;
    if (event.code === "Space") { event.preventDefault(); togglePlay(); }
    if (event.code === "KeyB") setBypass(true);
  });
  window.addEventListener("keyup", (event) => {
    if (event.code === "KeyB") setBypass(false);
  });

  video.muted = false;
  video.addEventListener("loadedmetadata", () => {
    document.querySelector("#resolutionLabel").textContent = `${video.videoWidth} × ${video.videoHeight}`;
    durationLabel.textContent = formatTime(video.duration || 0);
    updateSourceLabel(video.dataset.sourceName, video.duration);
  });
  video.addEventListener("error", () => {
    previewMessage.textContent = "无法读取源视频，请确认本地服务仍在运行";
  });
  video.load();
  try {
    const source = await fetch("/api/source", { cache: "no-store" }).then((r) => r.json());
    video.dataset.sourceName = source.name;
    updateSourceLabel(source.name, source.duration);
  } catch (_) {}
  try {
    initWebGL();
  } catch (error) {
    previewMessage.textContent = error.message;
  }
  pollRender();
}

boot();
