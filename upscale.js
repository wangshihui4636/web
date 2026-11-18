(() => {
  const UPSCALE_RATE = 0.04;
  const RES_FACTOR = {
    "480p": 0.85,
    "720p": 1,
    "1080p": 1.35,
  };

  const videoInput = document.getElementById("videoInput");
  const uploadDrop = document.getElementById("uploadDrop");
  const uploadIdle = document.getElementById("uploadIdle");
  const uploadMeta = document.getElementById("uploadMeta");
  const fileName = document.getElementById("fileName");
  const fileInfo = document.getElementById("fileInfo");
  const pickVideo = document.getElementById("pickVideo");
  const replaceVideo = document.getElementById("replaceVideo");
  const resolutionChips = document.getElementById("resolutionChips");
  const durationRange = document.getElementById("durationRange");
  const durationLabel = document.getElementById("durationLabel");
  const runUpscale = document.getElementById("runUpscale");
  const applyToStudio = document.getElementById("applyToStudio");
  const upscaleStatus = document.getElementById("upscaleStatus");
  const feePillWrap = document.getElementById("feePillWrap");
  const feePill = document.getElementById("feePill");
  const upscaleCostCard = document.getElementById("upscaleCostCard");
  const upscaleCostTotal = document.getElementById("upscaleCostTotal");
  const upscaleUnit = document.getElementById("upscaleUnit");
  const upscaleSeconds = document.getElementById("upscaleSeconds");
  const upscaleResFactor = document.getElementById("upscaleResFactor");
  const metaFile = document.getElementById("metaFile");
  const metaRes = document.getElementById("metaRes");
  const metaFeeWrap = document.getElementById("metaFeeWrap");
  const metaFee = document.getElementById("metaFee");
  const statusPill = document.getElementById("statusPill");
  const statusText = document.getElementById("statusText");
  const resultPlaceholder = document.getElementById("resultPlaceholder");
  const resultVideo = document.getElementById("resultVideo");
  const beforePlaceholder = document.getElementById("beforePlaceholder");
  const beforeVideo = document.getElementById("beforeVideo");
  const afterPlaceholder = document.getElementById("afterPlaceholder");
  const afterVideo = document.getElementById("afterVideo");
  const genProgress = document.getElementById("genProgress");
  const genBar = document.getElementById("genBar");
  const toast = document.getElementById("toast");
  const billingEstimate = document.getElementById("billingEstimate");
  const billingEstimateIdle = document.getElementById("billingEstimateIdle");
  const estimateTotal = document.getElementById("estimateTotal");
  const estSeconds = document.getElementById("estSeconds");
  const estRes = document.getElementById("estRes");
  const estUnit = document.getElementById("estUnit");
  const estFactor = document.getElementById("estFactor");

  let selectedResolution = "720p";
  let selectedSeconds = 8;
  let objectUrl = "";
  let fileLabel = "";
  let done = false;
  let busy = false;
  let toastTimer = 0;
  let lastFee = 0;

  const params = new URLSearchParams(location.search);
  if (params.get("resolution") && RES_FACTOR[params.get("resolution")]) {
    selectedResolution = params.get("resolution");
  }
  if (params.get("seconds")) {
    selectedSeconds = Math.min(60, Math.max(4, Number(params.get("seconds")) || 8));
  }

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

  function setStatus(mode, text) {
    statusPill.className = `status-pill ${mode}`;
    statusText.textContent = text;
  }

  function calcFee() {
    const factor = RES_FACTOR[selectedResolution] ?? 1;
    const unit = round2(UPSCALE_RATE * factor);
    const total = round2(unit * selectedSeconds);
    return { factor, unit, total };
  }

  function syncFeeVisibility() {
    const show = Boolean(objectUrl);
    if (feePillWrap) feePillWrap.hidden = !show;
    if (upscaleCostCard) upscaleCostCard.hidden = !show;
    if (metaFeeWrap) metaFeeWrap.hidden = !show;
    if (billingEstimate) billingEstimate.hidden = !show;
    if (billingEstimateIdle) billingEstimateIdle.hidden = show;
  }

  function updateCostUI() {
    const { factor, unit, total } = calcFee();
    durationLabel.textContent = `${selectedSeconds}s`;
    durationRange.value = String(selectedSeconds);
    feePill.textContent = formatMoney(total);
    upscaleCostTotal.textContent = formatMoney(total);
    upscaleUnit.textContent = `${formatMoney(unit)} / 秒`;
    upscaleSeconds.textContent = `${selectedSeconds}s`;
    upscaleResFactor.textContent = `${selectedResolution} · ×${factor.toFixed(2)}`;
    metaRes.textContent = selectedResolution;
    metaFee.textContent = formatMoney(total);
    estimateTotal.textContent = formatMoney(total);
    estSeconds.textContent = `${selectedSeconds}s`;
    estRes.textContent = selectedResolution;
    estUnit.textContent = `${formatMoney(unit)} / 秒`;
    estFactor.textContent = `×${factor.toFixed(2)}`;
    resolutionChips.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.resolution === selectedResolution);
    });
    syncFeeVisibility();
  }

  function revokeUrl() {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = "";
  }

  function bindVideo(el, url) {
    el.src = url;
    el.hidden = false;
    el.load();
  }

  function clearResult() {
    done = false;
    resultVideo.hidden = true;
    resultVideo.removeAttribute("src");
    resultPlaceholder.hidden = false;
    afterVideo.hidden = true;
    afterVideo.removeAttribute("src");
    afterPlaceholder.hidden = false;
    setStatus("ready", "待命");
    upscaleStatus.textContent = objectUrl ? "已上传 · 可开始超分" : "待命 · 请先上传视频";
  }

  function applyFile(file) {
    if (!file || !file.type.startsWith("video/")) {
      showToast("请上传视频文件");
      return;
    }
    revokeUrl();
    objectUrl = URL.createObjectURL(file);
    fileLabel = file.name;
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    fileName.textContent = file.name;
    fileInfo.textContent = `${file.type || "video"} · ${sizeMb} MB`;
    uploadIdle.hidden = true;
    uploadMeta.hidden = false;
    metaFile.textContent = file.name.length > 18 ? `${file.name.slice(0, 16)}…` : file.name;

    bindVideo(beforeVideo, objectUrl);
    beforePlaceholder.hidden = true;

    clearResult();
    updateCostUI();
    showToast("视频已上传");

    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.src = objectUrl;
    probe.addEventListener("loadedmetadata", () => {
      if (Number.isFinite(probe.duration) && probe.duration > 0) {
        selectedSeconds = Math.min(60, Math.max(4, Math.round(probe.duration)));
        updateCostUI();
      }
    });
  }

  function sleepProgress(ms) {
    genProgress.classList.add("visible");
    genBar.style.width = "0%";
    const start = performance.now();
    return new Promise((resolve) => {
      function step(now) {
        const t = Math.min(1, (now - start) / ms);
        genBar.style.width = `${Math.round(t * 100)}%`;
        if (t < 1) requestAnimationFrame(step);
        else {
          genProgress.classList.remove("visible");
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  pickVideo.addEventListener("click", () => videoInput.click());
  replaceVideo.addEventListener("click", () => videoInput.click());
  videoInput.addEventListener("change", () => {
    const file = videoInput.files?.[0];
    if (file) applyFile(file);
  });

  ["dragenter", "dragover"].forEach((evt) => {
    uploadDrop.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadDrop.classList.add("is-drag");
    });
  });
  ["dragleave", "drop"].forEach((evt) => {
    uploadDrop.addEventListener(evt, (e) => {
      e.preventDefault();
      uploadDrop.classList.remove("is-drag");
    });
  });
  uploadDrop.addEventListener("drop", (e) => {
    const file = e.dataTransfer?.files?.[0];
    if (file) applyFile(file);
  });

  resolutionChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    selectedResolution = chip.dataset.resolution;
    if (done) clearResult();
    updateCostUI();
  });

  durationRange.addEventListener("input", () => {
    selectedSeconds = Number(durationRange.value);
    if (done) clearResult();
    updateCostUI();
  });

  runUpscale.addEventListener("click", async () => {
    if (!objectUrl) {
      showToast("请先上传视频");
      return;
    }
    if (busy) return;
    busy = true;
    runUpscale.disabled = true;
    setStatus("running", "超分中");
    upscaleStatus.textContent = "超分处理中…";
    resultPlaceholder.hidden = false;
    resultPlaceholder.querySelector("p").textContent = "正在提升清晰度与细节…";
    resultVideo.hidden = true;

    await sleepProgress(2200);

    const fee = calcFee().total;
    lastFee = fee;
    bindVideo(resultVideo, objectUrl);
    resultPlaceholder.hidden = true;
    bindVideo(afterVideo, objectUrl);
    afterPlaceholder.hidden = true;
    done = true;
    setStatus("done", "超分完成");
    upscaleStatus.textContent = `超分完成 · 已计费 ${formatMoney(fee)}`;
    showToast(`超分完成 · ${formatMoney(fee)}`);
    busy = false;
    runUpscale.disabled = false;
  });

  applyToStudio.addEventListener("click", () => {
    const q = new URLSearchParams({
      from: "upscale",
      resolution: selectedResolution,
      seconds: String(selectedSeconds),
    });
    if (params.get("prompt")) q.set("prompt", params.get("prompt"));
    if (params.get("negative")) q.set("negative", params.get("negative"));
    if (params.get("scene")) q.set("scene", params.get("scene"));
    if (params.get("style")) q.set("style", params.get("style"));
    if (params.get("ratio")) q.set("ratio", params.get("ratio"));
    if (params.get("model")) q.set("model", params.get("model"));
    location.href = `video.html?${q.toString()}`;
  });

  window.addEventListener("beforeunload", revokeUrl);

  if (window.AlayaPlans) {
    window.AlayaPlans.init({ showToast, videoOnly: true });
  }

  updateCostUI();
  setStatus("ready", "待命");
})();
