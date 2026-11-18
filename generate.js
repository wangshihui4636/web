(() => {
  const GEN_RATE = {
    写实电影: 0.06,
    动漫: 0.055,
    三维渲染: 0.07,
    赛博朋克: 0.065,
    水墨意境: 0.05,
  };

  const SCENE_THUMB = {
    汽车广告: "scene-auto-1",
    漫剧: "scene-comic-1",
    播客: "scene-podcast-1",
    自媒体: "scene-media-1",
  };

  const SCENE_DEFAULT = {
    汽车广告: {
      prompt: "黑色轿车沿雨夜城市高架疾驰，霓虹倒影划过车身",
      negative: "车牌可识别, 品牌标志错误, 车身变形, 抖动, 模糊",
      style: "写实电影",
      ratio: "16:9",
      seconds: 8,
    },
    漫剧: {
      prompt: "日系漫剧风格，放学后的教学楼天台，少年与少女对视，樱花飘落",
      negative: "写实照片, 血腥, 低清晰度, 畸形五官",
      style: "动漫",
      ratio: "16:9",
      seconds: 10,
    },
    播客: {
      prompt: "温暖播客录音室，两位嘉宾面对面交谈，柔和台灯与吸音棉背景",
      negative: "嘈杂背景, 过曝, 面部畸形, 晃动过大",
      style: "写实电影",
      ratio: "16:9",
      seconds: 12,
    },
    自媒体: {
      prompt: "竖屏自媒体口播开场，创作者面对镜头微笑挥手，明亮桌面布景",
      negative: "面部畸形, 背景杂乱, 过暗, 抖动",
      style: "写实电影",
      ratio: "9:16",
      seconds: 8,
    },
  };

  const promptEl = document.getElementById("genPrompt");
  const negativeEl = document.getElementById("genNegative");
  const scenePick = document.getElementById("scenePick");
  const styleChips = document.getElementById("styleChips");
  const ratioGrid = document.getElementById("ratioGrid");
  const durationRange = document.getElementById("durationRange");
  const durationLabel = document.getElementById("durationLabel");
  const runGenerate = document.getElementById("runGenerate");
  const applyToStudio = document.getElementById("applyToStudio");
  const toEnhance = document.getElementById("toEnhance");
  const previewFrame = document.getElementById("previewFrame");
  const previewPlaceholder = document.getElementById("previewPlaceholder");
  const previewResult = document.getElementById("previewResult");
  const previewVisual = document.getElementById("previewVisual");
  const resultScene = document.getElementById("resultScene");
  const resultMeta = document.getElementById("resultMeta");
  const resultCost = document.getElementById("resultCost");
  const statusPill = document.getElementById("statusPill");
  const statusText = document.getElementById("statusText");
  const genProgress = document.getElementById("genProgress");
  const genBar = document.getElementById("genBar");
  const toast = document.getElementById("toast");
  const feePill = document.getElementById("feePill");
  const genCostTotal = document.getElementById("genCostTotal");
  const genUnit = document.getElementById("genUnit");
  const genSeconds = document.getElementById("genSeconds");
  const genRatioLabel = document.getElementById("genRatioLabel");
  const metaScene = document.getElementById("metaScene");
  const metaStyleRatio = document.getElementById("metaStyleRatio");
  const metaFee = document.getElementById("metaFee");

  let selectedScene = "汽车广告";
  let selectedStyle = "写实电影";
  let selectedRatio = "16:9";
  let selectedSeconds = 8;
  let busy = false;
  let toastTimer = 0;

  const params = new URLSearchParams(location.search);
  if (params.get("prompt")) promptEl.value = params.get("prompt");
  if (params.get("negative")) negativeEl.value = params.get("negative");
  if (params.get("scene") && SCENE_THUMB[params.get("scene")]) {
    selectedScene = params.get("scene");
  }
  if (params.get("style") && GEN_RATE[params.get("style")] != null) {
    selectedStyle = params.get("style");
  }
  if (params.get("ratio")) selectedRatio = params.get("ratio");
  if (params.get("seconds")) selectedSeconds = Number(params.get("seconds")) || 8;

  function formatMoney(n) {
    return `¥${n.toFixed(2)}`;
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function calcFee() {
    const unit = GEN_RATE[selectedStyle] ?? 0.06;
    return { unit, total: round2(unit * selectedSeconds) };
  }

  function updateCost() {
    const { unit, total } = calcFee();
    feePill.textContent = formatMoney(total);
    genCostTotal.textContent = formatMoney(total);
    genUnit.textContent = `${formatMoney(unit)} / 秒`;
    genSeconds.textContent = `${selectedSeconds}s`;
    genRatioLabel.textContent = selectedRatio;
    metaScene.textContent = selectedScene;
    metaStyleRatio.textContent = `${selectedStyle} · ${selectedRatio}`;
    metaFee.textContent = formatMoney(total);
    durationLabel.textContent = `${selectedSeconds}s`;
  }

  function applyStyle(style) {
    selectedStyle = style;
    styleChips.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.style === style);
    });
  }

  function applyRatio(ratio) {
    selectedRatio = ratio;
    const [a, b] = ratio.split(":").map(Number);
    previewFrame.style.aspectRatio = `${a} / ${b}`;
    ratioGrid.querySelectorAll(".ratio-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.ratio === ratio);
    });
  }

  function setScene(scene, fillDefaults = false) {
    selectedScene = scene;
    scenePick.querySelectorAll(".scene-pick-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.scene === scene);
    });
    if (fillDefaults) {
      const d = SCENE_DEFAULT[scene];
      if (!promptEl.value.trim()) promptEl.value = d.prompt;
      if (!negativeEl.value.trim()) negativeEl.value = d.negative;
      applyStyle(d.style);
      applyRatio(d.ratio);
      selectedSeconds = d.seconds;
      durationRange.value = String(d.seconds);
    }
    updateCost();
  }

  function setStatus(mode, text) {
    statusPill.className = `status-pill ${mode}`;
    statusText.textContent = text;
  }

  scenePick.addEventListener("click", (e) => {
    const btn = e.target.closest(".scene-pick-btn");
    if (!btn) return;
    setScene(btn.dataset.scene, !promptEl.value.trim());
  });

  styleChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    applyStyle(chip.dataset.style);
    updateCost();
  });

  ratioGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".ratio-btn");
    if (!btn) return;
    applyRatio(btn.dataset.ratio);
    updateCost();
  });

  durationRange.addEventListener("input", () => {
    selectedSeconds = Number(durationRange.value);
    updateCost();
  });

  runGenerate.addEventListener("click", async () => {
    const prompt = promptEl.value.trim();
    if (!prompt) {
      showToast("请先填写正向提示词");
      promptEl.focus();
      return;
    }
    if (busy) return;
    busy = true;
    runGenerate.disabled = true;
    setStatus("running", "生成中");
    previewPlaceholder.style.display = "none";
    previewResult.classList.add("visible");
    previewVisual.className = `preview-visual ${SCENE_THUMB[selectedScene]}`;
    previewVisual.innerHTML = '<span class="scene-motif"></span>';
    genProgress.classList.add("visible");
    genBar.style.width = "0%";

    const start = performance.now();
    await new Promise((resolve) => {
      function step(now) {
        const t = Math.min(1, (now - start) / 2600);
        genBar.style.width = `${Math.round(t * 100)}%`;
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      }
      requestAnimationFrame(step);
    });

    const { total } = calcFee();
    const short = prompt.length > 48 ? `${prompt.slice(0, 48)}…` : prompt;
    resultScene.textContent = `${selectedScene} · ${short}`;
    resultMeta.textContent = `${selectedStyle} · ${selectedRatio} · ${selectedSeconds}s`;
    resultCost.textContent = `视频生成消耗 ${formatMoney(total)}`;
    genProgress.classList.remove("visible");
    setStatus("done", "已完成");
    showToast(`生成完成 · ${formatMoney(total)}`);
    busy = false;
    runGenerate.disabled = false;
  });

  applyToStudio.addEventListener("click", () => {
    const q = new URLSearchParams({
      prompt: promptEl.value.trim() || "",
      negative: negativeEl.value.trim() || "",
      scene: selectedScene,
      style: selectedStyle,
      ratio: selectedRatio,
      seconds: String(selectedSeconds),
      from: "generate",
    });
    location.href = `video.html?${q.toString()}`;
  });

  toEnhance.addEventListener("click", (e) => {
    e.preventDefault();
    const q = new URLSearchParams({
      prompt: promptEl.value.trim() || "",
      scene: selectedScene,
    });
    location.href = `enhance.html?${q.toString()}`;
  });

  applyStyle(selectedStyle);
  applyRatio(selectedRatio);
  durationRange.value = String(selectedSeconds);
  setScene(selectedScene, !params.get("prompt"));
  updateCost();
})();
