(() => {
  const SCENE_BOOST = {
    汽车广告: {
      suffix:
        "电影级汽车广告质感，低角度跟拍转航拍，车身反射与光影划过清晰，镜头稳定流畅，主体突出",
      thumb: "scene-auto-1",
      beforeTips: ["车身细节偏糊", "镜头运动单一", "广告氛围不足"],
      afterTips: ["车身高光与反射更清晰", "跟拍/航拍调度完整", "广告级光影节奏更强"],
    },
    漫剧: {
      suffix:
        "日系漫剧分镜感，角色表情与动作明确，柔和色彩与线稿层次，镜头轻微推进，情绪张力突出",
      thumb: "scene-comic-1",
      beforeTips: ["角色关系不清晰", "分镜感偏弱", "情绪表达不足"],
      afterTips: ["角色互动更明确", "分镜与景别更清楚", "情绪与氛围更饱满"],
    },
    播客: {
      suffix:
        "温暖播客录音室氛围，浅景深，柔和台灯，说话者切换自然，画面干净专业，适合对谈内容",
      thumb: "scene-podcast-1",
      beforeTips: ["场景识别模糊", "人物关系不清", "专业感不足"],
      afterTips: ["录音室布景更明确", "对谈镜头切换自然", "专业轻量氛围到位"],
    },
    自媒体: {
      suffix:
        "竖屏自媒体构图，主体居中，柔光环照明，字幕安全区预留，节奏轻快亲和，适合口播种草",
      thumb: "scene-media-1",
      beforeTips: ["竖屏构图不稳定", "主体不够突出", "种草感偏弱"],
      afterTips: ["竖屏构图更稳", "主体与布光更清晰", "口播种草节奏更自然"],
    },
  };

  const INPUT_PRICE = 8.12; // 元 / 百万 Token
  const OUTPUT_PRICE = 32.20;
  const OUT_RATIO = 3; // 增强输出按输入约 3 倍估算

  const rawPrompt = document.getElementById("rawPrompt");
  const scenePick = document.getElementById("scenePick");
  const enhanceBtn = document.getElementById("enhanceBtn");
  const applyToStudio = document.getElementById("applyToStudio");
  const enhancedPlaceholder = document.getElementById("enhancedPlaceholder");
  const enhancedText = document.getElementById("enhancedText");
  const enhanceTags = document.getElementById("enhanceTags");
  const enhanceStatus = document.getElementById("enhanceStatus");
  const beforeVisual = document.getElementById("beforeVisual");
  const afterVisual = document.getElementById("afterVisual");
  const beforePromptPreview = document.getElementById("beforePromptPreview");
  const afterPromptPreview = document.getElementById("afterPromptPreview");
  const beforePoints = document.getElementById("beforePoints");
  const afterPoints = document.getElementById("afterPoints");
  const toast = document.getElementById("toast");
  const rawCount = document.getElementById("rawCount");
  const outCount = document.getElementById("outCount");
  const liveTotal = document.getElementById("liveTotal");
  const liveDetail = document.getElementById("liveDetail");

  let selectedScene = "汽车广告";
  let enhanced = "";
  let done = false;
  let busy = false;
  let toastTimer = 0;
  let lastFee = 0;

  function estimateTokens(chars) {
    return Math.max(0, chars);
  }

  function calcFee(inTokens, outTokens) {
    const inputFee = (INPUT_PRICE * inTokens) / 1_000_000;
    const outputFee = (OUTPUT_PRICE * outTokens) / 1_000_000;
    return {
      inputFee,
      outputFee,
      total: inputFee + outputFee,
      inTokens,
      outTokens,
    };
  }

  function formatFee(n) {
    if (n < 0.01) return `¥${n.toFixed(4)}`;
    return `¥${n.toFixed(4)}`;
  }

  function updateLiveEstimate() {
    const chars = rawPrompt.value.trim().length;
    rawCount.textContent = `${chars} 字`;
    const outEst = done && enhanced ? enhanced.length : chars * OUT_RATIO;
    outCount.textContent = done && enhanced ? `${enhanced.length} 字` : `预估 ${Math.round(outEst)} 字`;
    const fee = calcFee(estimateTokens(chars), estimateTokens(Math.round(outEst)));
    liveTotal.textContent = chars ? formatFee(fee.total) : "¥0.0000";
    liveDetail.textContent = chars
      ? `输入 ≈ ${fee.inTokens} Token（¥${fee.inputFee.toFixed(4)}）· 输出 ≈ ${fee.outTokens} Token（¥${fee.outputFee.toFixed(4)}）`
      : "输入提示词后实时估算费用";
  }

  const params = new URLSearchParams(location.search);
  if (params.get("prompt")) rawPrompt.value = params.get("prompt");
  if (params.get("scene") && SCENE_BOOST[params.get("scene")]) {
    selectedScene = params.get("scene");
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  }

  function setScene(scene) {
    selectedScene = scene;
    scenePick.querySelectorAll(".scene-pick-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.scene === scene);
    });
    const cfg = SCENE_BOOST[scene];
    beforeVisual.className = `compare-visual ${cfg.thumb}`;
    beforeVisual.innerHTML = '<span class="scene-motif"></span>';
    afterVisual.className = `compare-visual is-enhanced ${cfg.thumb}`;
    afterVisual.innerHTML = '<span class="scene-motif"></span>';
    beforePoints.innerHTML = cfg.beforeTips.map((t) => `<li>${t}</li>`).join("");
    afterPoints.innerHTML = cfg.afterTips.map((t) => `<li>${t}</li>`).join("");
    refreshPreviews();
  }

  function buildEnhanced(raw, scene) {
    const clean = raw.trim().replace(/；补充.+$/, "");
    const cfg = SCENE_BOOST[scene];
    return `${clean}；场景定位：${scene}；${cfg.suffix}；补充负向约束：模糊、抖动、水印、主体畸形`;
  }

  function clip(text, n = 56) {
    const t = text.trim();
    if (!t) return "等待输入提示词…";
    return t.length > n ? `${t.slice(0, n)}…` : t;
  }

  function refreshPreviews() {
    const raw = rawPrompt.value.trim();
    beforePromptPreview.textContent = raw ? clip(raw) : "等待输入提示词…";
    if (done && enhanced) {
      afterPromptPreview.textContent = clip(enhanced, 72);
      afterVisual.classList.add("is-ready");
    } else {
      afterPromptPreview.textContent = "完成增强后展示对比效果";
      afterVisual.classList.remove("is-ready");
    }
  }

  function renderEnhanced(text) {
    enhanced = text;
    done = true;
    enhancedPlaceholder.hidden = true;
    enhancedText.hidden = false;
    enhancedText.textContent = text;
    enhanceTags.hidden = false;
    const inTokens = estimateTokens(rawPrompt.value.trim().length);
    const outTokens = estimateTokens(text.length);
    const fee = calcFee(inTokens, outTokens);
    lastFee = fee.total;
    enhanceStatus.textContent = `增强完成 · 已计费 ${formatFee(fee.total)}（输入 ${inTokens} / 输出 ${outTokens} Token）`;
    refreshPreviews();
    updateLiveEstimate();
  }

  scenePick.addEventListener("click", (e) => {
    const btn = e.target.closest(".scene-pick-btn");
    if (!btn) return;
    setScene(btn.dataset.scene);
  });

  rawPrompt.addEventListener("input", () => {
    if (done) {
      done = false;
      enhanced = "";
      enhancedPlaceholder.hidden = false;
      enhancedText.hidden = true;
      enhanceTags.hidden = true;
      enhanceStatus.textContent = "提示词已修改 · 请重新增强";
    }
    refreshPreviews();
    updateLiveEstimate();
  });

  enhanceBtn.addEventListener("click", async () => {
    const raw = rawPrompt.value.trim();
    if (!raw) {
      showToast("请先输入原始提示词");
      rawPrompt.focus();
      return;
    }
    if (busy) return;
    busy = true;
    enhanceBtn.disabled = true;
    enhanceStatus.textContent = "增强中…";
    enhancedPlaceholder.hidden = false;
    enhancedPlaceholder.textContent = "正在根据场景优化镜头、光影与约束…";
    enhancedText.hidden = true;

    await new Promise((r) => setTimeout(r, 900));
    renderEnhanced(buildEnhanced(raw, selectedScene));
    showToast(`提示词增强完成 · ${formatFee(lastFee)}`);
    busy = false;
    enhanceBtn.disabled = false;
  });

  applyToStudio.addEventListener("click", () => {
    const text = (enhanced || rawPrompt.value).trim();
    if (!text) {
      showToast("请先输入或完成增强");
      return;
    }
    const q = new URLSearchParams({
      prompt: text,
      scene: selectedScene,
      from: "enhance",
    });
    location.href = `video.html?${q.toString()}`;
  });

  setScene(selectedScene);
  refreshPreviews();
  updateLiveEstimate();
})();
