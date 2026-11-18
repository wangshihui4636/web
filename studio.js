(() => {
  const GEN_RATE = {
    写实电影: 0.06,
    动漫: 0.055,
    三维渲染: 0.07,
    赛博朋克: 0.065,
    水墨意境: 0.05,
  };
  const ENHANCE_FEE = 0.12;
  const UPSCALE_RATE = 0.04;
  const RES_FACTOR = {
    "480p": 0.85,
    "720p": 1,
    "1080p": 1.35,
  };

  const VIDEO_MODELS = [
    {
      id: "alaya-t2v",
      name: "Alaya Video",
      version: "alaya-t2v-1",
      theme: "video",
      blurb: "通用文生视频",
      tagline: "一款为成片可控而生的通用视频生成产品",
      desc: "在画质、稳定性与参数可控之间取得平衡，覆盖广告、漫剧、播客到自媒体的主流成片需求。",
      genFactor: 1,
      billingNote: "通用均衡定价，适合多数成片场景",
      features: ["文生视频稳态输出", "风格 / 画幅 / 负向提示全可控", "一条链路覆盖多行业场景"],
      stats: [
        { label: "定位", value: "默认主力" },
        { label: "画幅", value: "全比例" },
        { label: "适用", value: "多场景" },
      ],
      hud: { label: "T2V Engine", res: "720p · Multi-ratio" },
      floats: { a: "稳态跟拍", b: "均衡光影" },
    },
    {
      id: "alaya-t2v-cine",
      name: "Alaya Cine",
      version: "alaya-cine-preview",
      theme: "cine",
      blurb: "电影感镜头",
      tagline: "把广告级运镜与光影，做成可调用的成片产品",
      desc: "面向品牌叙事与汽车广告场景，强化镜头语言、高光层次与电影感节奏，让生成结果更接近成片审美。",
      genFactor: 1.15,
      billingNote: "电影感增强档，生成单价上浮约 15%",
      features: ["电影级运镜调度", "高对比光影层次", "品牌广告叙事更完整"],
      stats: [
        { label: "调性", value: "Cinematic" },
        { label: "擅长", value: "广告叙事" },
        { label: "输出", value: "成片感" },
      ],
      hud: { label: "Cine Lens", res: "1080p Ready" },
      floats: { a: "低角度跟拍", b: "电影光影" },
    },
    {
      id: "alaya-motion",
      name: "Alaya Motion",
      version: "alaya-motion-1",
      theme: "motion",
      blurb: "流畅运镜",
      tagline: "为快节奏内容打造的动态视频引擎",
      desc: "专注运镜连贯与剪辑节奏，帮助漫剧、短内容在更短周期内产出有冲击力的动态画面。",
      genFactor: 0.95,
      billingNote: "运镜优化档，生成单价下浮约 5%",
      features: ["运镜轨迹更顺滑", "适合快剪与分镜节奏", "动态档更高性价比"],
      stats: [
        { label: "节奏", value: "Fast Cut" },
        { label: "擅长", value: "漫剧短片" },
        { label: "成本", value: "更优" },
      ],
      hud: { label: "Motion Path", res: "High Tempo" },
      floats: { a: "速度线", b: "连贯运镜" },
    },
    {
      id: "alaya-reel",
      name: "Alaya Reel",
      version: "alaya-reel-1",
      theme: "reel",
      blurb: "竖屏优化",
      tagline: "专为竖屏口播与种草打造的短视频产品",
      desc: "围绕 9:16 构图、主体居中与字幕安全区优化，让自媒体创作者更快得到可发布的竖屏成片。",
      genFactor: 1.05,
      billingNote: "竖屏优化档，生成单价上浮约 5%",
      features: ["竖屏构图与安全区", "口播主体更稳定", "种草短视频即用"],
      stats: [
        { label: "画幅", value: "9:16" },
        { label: "场景", value: "口播种草" },
        { label: "发布", value: "即用" },
      ],
      hud: { label: "Reel Vertical", res: "9:16 Native" },
      floats: { a: "主体居中", b: "字幕安全区" },
    },
  ];

  const STEP_META = {
    enhance: { name: "提示词增强", label: "增强" },
    generate: { name: "视频生成", label: "生成" },
    upscale: { name: "超分", label: "超分" },
  };

  const CASES = [
    {
      id: 1,
      scene: "汽车广告",
      label: "城市夜跑",
      seconds: 8,
      style: "写实电影",
      ratio: "16:9",
      thumb: "scene-auto-1",
      prompt:
        "黑色轿车沿雨夜城市高架疾驰，霓虹倒影划过车身，低角度跟拍再拉升为航拍，电影级汽车广告质感，镜头稳定流畅",
      negative: "车牌可识别, 品牌标志错误, 车身变形, 抖动, 模糊",
    },
    {
      id: 2,
      scene: "汽车广告",
      label: "沙漠巡航",
      seconds: 10,
      style: "写实电影",
      ratio: "16:9",
      thumb: "scene-auto-2",
      prompt:
        "越野车穿越金色沙漠，沙尘在轮胎后扬起，金色逆光与镜头光晕，缓慢环绕再切入前脸特写，高端汽车广告节奏",
      negative: "低清晰度, 过曝, 人物面部畸形, 文字水印",
    },
    {
      id: 3,
      scene: "漫剧",
      label: "青春校园",
      seconds: 12,
      style: "动漫",
      ratio: "16:9",
      thumb: "scene-comic-1",
      prompt:
        "日系漫剧风格，放学后的教学楼天台，少年与少女对视，樱花飘落，柔和色彩与动漫线稿感，镜头轻微推进",
      negative: "写实照片, 血腥, 低清晰度, 畸形五官",
    },
    {
      id: 4,
      scene: "漫剧",
      label: "都市异能",
      seconds: 10,
      style: "动漫",
      ratio: "9:16",
      thumb: "scene-comic-2",
      prompt:
        "竖屏漫剧分镜，夜色都市楼顶，主角释放蓝色能量特效，速度线与冲击波，热血漫剧节奏，高对比光影",
      negative: "写实, 静态海报感, 水印, 画面杂乱",
    },
    {
      id: 5,
      scene: "播客",
      label: "双人对谈",
      seconds: 15,
      style: "写实电影",
      ratio: "16:9",
      thumb: "scene-podcast-1",
      prompt:
        "温暖播客录音室，两位嘉宾面对面交谈，柔和台灯与吸音棉背景，浅景深，镜头在说话者之间缓慢切换，轻松专业氛围",
      negative: "嘈杂背景, 过曝, 面部畸形, 晃动过大",
    },
    {
      id: 6,
      scene: "播客",
      label: "波形封面",
      seconds: 6,
      style: "三维渲染",
      ratio: "1:1",
      thumb: "scene-podcast-2",
      prompt:
        "播客视觉包装，麦克风特写与动态声波频谱，极简深色背景，青色与白色光效，适合片头动效，干净高级",
      negative: "杂乱文字, 低分辨率, 噪点, 变形",
    },
    {
      id: 7,
      scene: "自媒体",
      label: "口播开场",
      seconds: 8,
      style: "写实电影",
      ratio: "9:16",
      thumb: "scene-media-1",
      prompt:
        "竖屏自媒体口播开场，创作者面对镜头微笑挥手，明亮桌面布景与柔光环，字幕预留安全区，节奏轻快亲和",
      negative: "面部畸形, 背景杂乱, 过暗, 抖动",
    },
    {
      id: 8,
      scene: "自媒体",
      label: "产品种草",
      seconds: 10,
      style: "写实电影",
      ratio: "9:16",
      thumb: "scene-media-2",
      prompt:
        "竖屏种草短视频，手持开箱展示护肤产品，自然窗光，特写质地与按压泵头，结尾放置桌面定格，清新种草风",
      negative: "品牌标志错误, 手指畸形, 强闪, 水印",
    },
  ];

  const promptEl = document.getElementById("prompt");
  const negativeEl = document.getElementById("negative");
  const styleChips = document.getElementById("styleChips");
  const ratioGrid = document.getElementById("ratioGrid");
  const durationChips = document.getElementById("durationChips");
  const resolutionChips = document.getElementById("resolutionChips");
  const generateBtn = document.getElementById("generateBtn");
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
  const casesGrid = document.getElementById("casesGrid");
  const toast = document.getElementById("toast");
  const costTotal = document.getElementById("costTotal");
  const costBreakdown = document.getElementById("costBreakdown");
  const costNote = document.getElementById("costNote");
  const costHeadLabel = document.getElementById("costHeadLabel");
  const previewCostChip = document.getElementById("previewCostChip");
  const priceEnhance = document.getElementById("priceEnhance");
  const priceUpscale = document.getElementById("priceUpscale");
  const chkEnhance = document.getElementById("chkEnhance");
  const chkUpscale = document.getElementById("chkUpscale");
  const pipelineList = document.getElementById("pipelineList");
  const pipeProgress = document.getElementById("pipeProgress");
  const costCard = document.getElementById("costCard");
  const modelPicker = document.getElementById("modelPicker");
  const modelPickerBtn = document.getElementById("modelPickerBtn");
  const modelPickerMenu = document.getElementById("modelPickerMenu");
  const currentModelName = document.getElementById("currentModelName");
  const currentModelVer = document.getElementById("currentModelVer");

  let selectedStyle = "写实电影";
  let selectedRatio = "16:9";
  let selectedSeconds = 8;
  let selectedResolution = "720p";
  let activeCaseId = null;
  let hasCompletedRun = false;
  let busy = false;
  let toastTimer = 0;
  let enhancedPrompt = "";
  let selectedModelId = "alaya-t2v";

  function currentModel() {
    return VIDEO_MODELS.find((m) => m.id === selectedModelId) || VIDEO_MODELS[0];
  }

  function formatMoney(n) {
    return `¥${n.toFixed(2)}`;
  }

  function round2(n) {
    return Math.round(n * 100) / 100;
  }

  function metaLine(extra = "") {
    const model = currentModel();
    const base = `${model.name} · ${selectedStyle} · ${selectedRatio} · ${selectedSeconds}s · ${selectedResolution}`;
    return extra ? `${base} · ${extra}` : base;
  }

  function stepPrices(
    style = selectedStyle,
    seconds = selectedSeconds,
    resolution = selectedResolution
  ) {
    const model = currentModel();
    const resFactor = RES_FACTOR[resolution] ?? 1;
    const genUnit = round2(
      (GEN_RATE[style] ?? 0.06) * (model.genFactor || 1) * resFactor
    );
    const upscaleUnit = round2(UPSCALE_RATE * resFactor);
    return {
      enhance: ENHANCE_FEE,
      generate: round2(genUnit * seconds),
      upscale: round2(upscaleUnit * seconds),
      genUnit,
      upscaleUnit,
    };
  }

  function setModelPickerOpen(open) {
    if (!modelPicker || !modelPickerBtn || !modelPickerMenu) return;
    modelPicker.classList.toggle("is-open", open);
    modelPickerBtn.setAttribute("aria-expanded", open ? "true" : "false");
    modelPickerMenu.hidden = !open;
  }

  function renderModelMenu() {
    if (!modelPickerMenu) return;
    modelPickerMenu.innerHTML = VIDEO_MODELS.map((m) => {
      const on = m.id === selectedModelId;
      return `
        <button
          type="button"
          class="model-picker-option"
          role="option"
          data-model="${m.id}"
          aria-selected="${on ? "true" : "false"}"
        >
          <strong>${m.name}</strong>
          ${on ? "<em>使用中</em>" : ""}
          <span>${m.version} · ${m.desc}</span>
        </button>
      `;
    }).join("");
  }

  function renderModelBilling() {
    const panel = document.getElementById("modelBillingPanel");
    const lead = document.getElementById("modelBillingLead");
    if (!panel) return;
    const model = currentModel();
    const styleRates = Object.entries(GEN_RATE)
      .map(([style, rate]) => {
        const unit = round2(rate * (model.genFactor || 1));
        return `<span class="rate-chip">${style} <b>${formatMoney(unit)}/秒</b></span>`;
      })
      .join("");
    const resRates = Object.entries(RES_FACTOR)
      .map(
        ([res, factor]) =>
          `<span class="rate-chip">${res} <b>×${factor.toFixed(2)}</b></span>`
      )
      .join("");

    if (lead) {
      lead.textContent = `${model.name}（${model.version}）· ${model.billingNote || model.desc}`;
    }

    panel.innerHTML = `
      <div class="billing-model-title">
        <strong>${model.name}</strong>
        <span>${model.version} · ${model.blurb}</span>
      </div>
      <div class="billing-stack">
        <div class="billing-block">
          <div class="billing-block-head">
            <h3>提示词增强</h3>
            <em>按 Token</em>
          </div>
          <div class="billing-table-wrap">
            <table class="billing-table">
              <thead>
                <tr>
                  <th>计费方式</th>
                  <th>计算公式</th>
                  <th>输入（元/百万 Token）</th>
                  <th>输出（元/百万 Token）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>按 Token</td>
                  <td>Token 单价 × Token 用量</td>
                  <td>8.12</td>
                  <td>32.20</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="billing-estimate-note">体验页参考：约 ¥${ENHANCE_FEE.toFixed(2)} / 次（按常见提示词长度估算）</p>
        </div>

        <div class="billing-block">
          <div class="billing-block-head">
            <h3>视频生成 · ${model.name}</h3>
            <em>按秒计费</em>
          </div>
          <div class="billing-table-wrap">
            <table class="billing-table">
              <thead>
                <tr>
                  <th>计费方式</th>
                  <th>计算公式</th>
                  <th>基准说明</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>按秒</td>
                  <td>风格单价 × 时长 × 分辨率系数</td>
                  <td>模型系数 ${model.genFactor.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="rate-chips">${styleRates}</div>
          <div class="rate-chips" style="margin-top:6px">${resRates}</div>
          <p class="billing-estimate-note">示例：写实电影 · 8s · 720p ≈ ${formatMoney(
            round2((GEN_RATE["写实电影"] * model.genFactor) * 8)
          )}</p>
        </div>

        <div class="billing-block">
          <div class="billing-block-head">
            <h3>超分</h3>
            <em>按秒计费</em>
          </div>
          <div class="billing-table-wrap">
            <table class="billing-table">
              <thead>
                <tr>
                  <th>计费方式</th>
                  <th>计算公式</th>
                  <th>单价（720p）</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>按秒</td>
                  <td>超分单价 × 时长 × 分辨率系数</td>
                  <td>${formatMoney(UPSCALE_RATE)} / 秒</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function renderModelBanner() {
    const model = currentModel();
    const banner = document.getElementById("modelBanner");
    if (!banner) return;

    const nameEl = document.getElementById("bannerModelName");
    const taglineEl = document.getElementById("bannerTagline");
    const descEl = document.getElementById("bannerModelDesc");
    const featuresEl = document.getElementById("bannerFeatures");
    const statsEl = document.getElementById("bannerStats");
    const blurbEl = document.getElementById("bannerBlurb");
    const versionEl = document.getElementById("bannerVersion");
    const hudLabel = document.getElementById("bannerHudLabel");
    const hudRes = document.getElementById("bannerHudRes");
    const floatA = document.getElementById("bannerFloatA");
    const floatB = document.getElementById("bannerFloatB");

    banner.dataset.model = model.id;
    banner.dataset.theme = model.theme || "video";
    if (nameEl) nameEl.textContent = model.name;
    if (taglineEl) taglineEl.textContent = model.tagline || model.blurb;
    if (descEl) descEl.textContent = model.desc;
    if (blurbEl) blurbEl.textContent = model.blurb;
    if (versionEl) versionEl.textContent = model.version;
    if (featuresEl) {
      featuresEl.innerHTML = (model.features || [])
        .map((f) => `<li><span></span>${f}</li>`)
        .join("");
    }
    if (statsEl) {
      statsEl.innerHTML = (model.stats || [])
        .map(
          (s) => `
        <div class="model-banner-stat">
          <em>${s.label}</em>
          <strong>${s.value}</strong>
        </div>`
        )
        .join("");
    }
    if (hudLabel) hudLabel.textContent = model.hud?.label || "T2V";
    if (hudRes) hudRes.textContent = model.hud?.res || "720p";
    if (floatA) floatA.textContent = model.floats?.a || "稳态输出";
    if (floatB) floatB.textContent = model.floats?.b || "参数可控";

    banner.classList.remove("is-animating");
    void banner.offsetWidth;
    banner.classList.add("is-animating");
  }

  function applyModel(id, { silent = false } = {}) {
    const next = VIDEO_MODELS.find((m) => m.id === id);
    if (!next) return;
    selectedModelId = next.id;
    if (currentModelName) currentModelName.textContent = next.name;
    if (currentModelVer) currentModelVer.textContent = `${next.version} · ${next.blurb}`;
    renderModelMenu();
    renderModelBanner();
    renderModelBilling();
    setModelPickerOpen(false);
    updateCostUI();
    if (!silent) showToast(`已切换至 ${next.name}`);
  }

  function selectedSteps() {
    return {
      enhance: chkEnhance?.checked ?? true,
      generate: true,
      upscale: chkUpscale?.checked ?? true,
    };
  }

  function calcPipelineTotal(style, seconds, steps = selectedSteps()) {
    const prices = stepPrices(style, seconds);
    let total = 0;
    const lines = [];
    if (steps.enhance) {
      total += prices.enhance;
      lines.push({ key: "enhance", name: "提示词增强", fee: prices.enhance });
    }
    if (steps.generate) {
      total += prices.generate;
      lines.push({
        key: "generate",
        name: "视频生成",
        fee: prices.generate,
        detail: `${formatMoney(prices.genUnit)}/秒 × ${seconds}s`,
      });
    }
    if (steps.upscale) {
      total += prices.upscale;
      lines.push({
        key: "upscale",
        name: "超分",
        fee: prices.upscale,
        detail: `${formatMoney(prices.upscaleUnit)}/秒 × ${seconds}s`,
      });
    }
    return { total: round2(total), lines, prices };
  }

  function applyDuration(seconds) {
    const n = Number(seconds);
    if (!Number.isFinite(n) || n <= 0) return;
    selectedSeconds = n;
    if (!durationChips) return;
    durationChips.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("active", Number(chip.dataset.seconds) === selectedSeconds);
    });
  }

  function applyResolution(resolution) {
    if (!RES_FACTOR[resolution]) return;
    selectedResolution = resolution;
    if (!resolutionChips) return;
    resolutionChips.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.resolution === selectedResolution);
    });
  }

  function canShowCost() {
    return Boolean(activeCaseId) || hasCompletedRun;
  }

  function syncCostVisibility() {
    const show = canShowCost();
    const costPlaceholder = document.getElementById("costPlaceholder");
    if (costCard) costCard.hidden = !show;
    if (costPlaceholder) costPlaceholder.hidden = show;
    if (previewCostChip) previewCostChip.hidden = !show;
    document.querySelectorAll(".pipe-price").forEach((el) => {
      el.hidden = !show;
    });
  }

  function updateCostUI(opts = {}) {
    const seconds = opts.seconds ?? selectedSeconds;
    const style = opts.style ?? selectedStyle;
    if (opts.resolution) selectedResolution = opts.resolution;
    const steps = selectedSteps();
    const { total, lines, prices } = calcPipelineTotal(style, seconds, steps);

    if (priceEnhance) priceEnhance.textContent = formatMoney(prices.enhance);
    if (priceUpscale) priceUpscale.textContent = formatMoney(prices.upscale);
    costHeadLabel.textContent = "预估合计";
    costTotal.textContent = formatMoney(total);
    previewCostChip.textContent = `预估 ${formatMoney(total)}`;

    costBreakdown.innerHTML = lines
      .map(
        (l) => `
      <div class="cost-line">
        <span>${l.name}${l.detail ? ` · ${l.detail}` : ""}</span>
        <em>${formatMoney(l.fee)}</em>
      </div>`
      )
      .join("");

    if (opts.note) costNote.textContent = opts.note;
    syncCostVisibility();
    return total;
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function setStatus(mode, text) {
    statusPill.className = `status-pill ${mode}`;
    statusText.textContent = text;
  }

  function applyRatio(ratio) {
    selectedRatio = ratio;
    const [a, b] = ratio.split(":").map(Number);
    previewFrame.style.aspectRatio = `${a} / ${b}`;
    ratioGrid.querySelectorAll(".ratio-btn").forEach((btn) => {
      const on = btn.dataset.ratio === ratio;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function applyStyle(style) {
    selectedStyle = style;
    styleChips.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.style === style);
    });
  }

  function ensurePreviewShell() {
    previewPlaceholder.style.display = "none";
    previewResult.classList.add("visible");
    const matched = CASES.find((c) => c.id === activeCaseId);
    previewVisual.className = `preview-visual ${matched?.thumb || "scene-auto-1"}`;
    previewVisual.innerHTML = '<span class="scene-motif"></span>';
  }

  function setPipeProgress(activeKey, doneKeys = []) {
    pipeProgress.hidden = false;
    pipeProgress.querySelectorAll("span").forEach((el) => {
      const key = el.dataset.p;
      el.classList.toggle("is-active", key === activeKey);
      el.classList.toggle("is-done", doneKeys.includes(key));
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

  function enhanceText(raw) {
    const base = raw.trim();
    return `${base}；补充镜头调度与光影层次，强调主体清晰、运动连贯，电影感构图，细节丰富`;
  }

  async function runStep(stepKey) {
    const prompt = promptEl.value.trim();
    if (!prompt && stepKey !== "upscale") {
      showToast("请先填写提示词，或点击下方场景实例");
      promptEl.focus();
      return null;
    }
    if (stepKey === "upscale" && !previewResult.classList.contains("visible")) {
      showToast("请先完成视频生成，再体验超分");
      return null;
    }

    const prices = stepPrices();
    const fee = prices[stepKey];
    ensurePreviewShell();
    setPipeProgress(stepKey, []);
    setStatus("running", `${STEP_META[stepKey].name}中`);

    await sleepProgress(stepKey === "generate" ? 2600 : 1400);

    if (stepKey === "enhance") {
      enhancedPrompt = enhanceText(prompt);
      promptEl.value = enhancedPrompt;
      resultScene.textContent = "提示词已增强";
      resultMeta.textContent = `${currentModel().name} · 可继续单独体验视频生成`;
      resultCost.textContent = `提示词增强消耗 ${formatMoney(fee)}`;
    } else if (stepKey === "generate") {
      const short =
        prompt.length > 42 ? `${prompt.slice(0, 42)}…` : prompt;
      resultScene.textContent = short;
      resultMeta.textContent = metaLine();
      resultCost.textContent = `视频生成消耗 ${formatMoney(fee)}`;
      previewVisual.classList.remove("is-upscaled");
    } else {
      previewVisual.classList.add("is-upscaled");
      resultScene.textContent = resultScene.textContent || "超分成片预览";
      resultMeta.textContent = metaLine("超分完成");
      resultCost.textContent = `超分消耗 ${formatMoney(fee)}`;
    }

    hasCompletedRun = true;
    updateCostUI({ note: "已根据本次体验更新预估费用" });
    setPipeProgress(null, [stepKey]);
    setStatus("done", `${STEP_META[stepKey].name}完成`);
    showToast(`${STEP_META[stepKey].name}完成 · ${formatMoney(fee)}`);
    return fee;
  }

  async function runPipeline() {
    const steps = selectedSteps();
    const order = ["enhance", "generate", "upscale"].filter((k) => steps[k]);
    if (!order.length) {
      showToast("请至少勾选一个计费环节");
      return;
    }
    if ((steps.enhance || steps.generate) && !promptEl.value.trim()) {
      showToast("请先填写提示词，或点击下方场景实例");
      promptEl.focus();
      return;
    }
    if (steps.upscale && !steps.generate && !previewResult.classList.contains("visible")) {
      showToast("全流程含超分时请同时勾选视频生成，或先单独生成");
      return;
    }

    const { total } = calcPipelineTotal(selectedStyle, selectedSeconds, steps);
    ensurePreviewShell();
    const done = [];
    for (const key of order) {
      setPipeProgress(key, done);
      setStatus("running", `${STEP_META[key].name}中`);
      await sleepProgress(key === "generate" ? 2400 : 1200);
      if (key === "enhance") {
        enhancedPrompt = enhanceText(promptEl.value);
        promptEl.value = enhancedPrompt;
      }
      if (key === "generate") {
        const p = promptEl.value.trim();
        resultScene.textContent = p.length > 42 ? `${p.slice(0, 42)}…` : p;
        resultMeta.textContent = metaLine();
        previewVisual.classList.remove("is-upscaled");
      }
      if (key === "upscale") {
        previewVisual.classList.add("is-upscaled");
        resultMeta.textContent = metaLine("超分完成");
      }
      done.push(key);
    }
    setPipeProgress(null, done);
    hasCompletedRun = true;
    resultCost.textContent = `全流程消耗 ${formatMoney(total)}（${order
      .map((k) => STEP_META[k].label)
      .join(" + ")}）`;
    updateCostUI({ note: "已根据本次全流程体验更新预估费用" });
    setStatus("done", "全流程完成");
    showToast(`全流程完成 · 合计 ${formatMoney(total)}`);
  }

  function showCasePreview(item, total) {
    ensurePreviewShell();
    pipeProgress.hidden = true;
    previewVisual.classList.remove("is-upscaled");
    resultScene.textContent = `${item.scene} · ${item.label}`;
    resultMeta.textContent = metaLine();
    resultCost.textContent = `参考全链路约 ${formatMoney(total)}（增强+生成+超分）`;
    setStatus("done", "实例预览");
  }

  function loadCase(item) {
    activeCaseId = item.id;
    enhancedPrompt = "";
    promptEl.value = item.prompt;
    negativeEl.value = item.negative;
    applyStyle(item.style);
    applyRatio(item.ratio);
    applyDuration(item.seconds);

    const total = updateCostUI({
      seconds: item.seconds,
      style: item.style,
      note: `已载入「${item.scene} · ${item.label}」，可单独体验或一键全流程`,
    });

    showCasePreview(item, total);
    renderCases();
    showToast(`已填写参数 · 参考合计 ${formatMoney(total)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderCases() {
    casesGrid.innerHTML = CASES.map((c) => {
      const { total } = calcPipelineTotal(c.style, c.seconds, {
        enhance: true,
        generate: true,
        upscale: true,
      });
      const active = activeCaseId === c.id ? " is-active" : "";
      return `
      <article class="case-card scene-card${active}" tabindex="0" data-id="${c.id}" role="button" aria-label="使用案例：${c.scene} ${c.label}">
        <span class="case-label">${c.scene}</span>
        <span class="case-duration">${c.seconds}s</span>
        <div class="case-thumb ${c.thumb}" aria-hidden="true">
          <span class="scene-motif"></span>
        </div>
        <span class="play-hint" aria-hidden="true"></span>
        <div class="case-foot">
          <strong>${c.label}</strong>
          <span class="case-cost">${formatMoney(total)}</span>
        </div>
        <div class="case-overlay">
          <p class="case-title">${c.label}</p>
          <p class="case-prompt">${c.prompt}</p>
          <div class="case-overlay-meta">
            <span>${c.style} · ${c.ratio}</span>
            <span>全链路 ${formatMoney(total)}</span>
          </div>
          <span class="case-use">一键填入并预览 →</span>
        </div>
      </article>`;
    }).join("");

    casesGrid.querySelectorAll(".case-card").forEach((card) => {
      const id = Number(card.dataset.id);
      const item = CASES.find((c) => c.id === id);
      const activate = () => loadCase(item);
      card.addEventListener("click", activate);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate();
        }
      });
    });
    requestAnimationFrame(updateRailNav);
  }

  pipelineList.addEventListener("click", async (e) => {
    const runBtn = e.target.closest(".pipe-run");
    if (!runBtn || busy) return;

    if (runBtn.dataset.run === "enhance" || runBtn.dataset.run === "upscale") {
      const q = new URLSearchParams();
      if (promptEl.value.trim()) q.set("prompt", promptEl.value.trim());
      if (negativeEl.value.trim()) q.set("negative", negativeEl.value.trim());
      const matched = CASES.find((c) => c.id === activeCaseId);
      if (matched?.scene) q.set("scene", matched.scene);
      q.set("style", selectedStyle);
      q.set("ratio", selectedRatio);
      q.set("seconds", String(selectedSeconds));
      q.set("resolution", selectedResolution);
      q.set("model", selectedModelId);
      const page = runBtn.dataset.run === "enhance" ? "enhance.html" : "upscale.html";
      location.href = `${page}?${q.toString()}`;
      return;
    }

    busy = true;
    document.querySelectorAll(".pipe-run, #generateBtn").forEach((b) => {
      b.disabled = true;
    });
    try {
      await runStep(runBtn.dataset.run);
    } finally {
      busy = false;
      document.querySelectorAll(".pipe-run, #generateBtn").forEach((b) => {
        b.disabled = false;
      });
    }
  });

  [chkEnhance, chkUpscale].forEach((chk) => {
    if (!chk) return;
    chk.addEventListener("change", () => {
      updateCostUI({ note: "已按勾选环节更新全流程合计" });
    });
  });

  styleChips.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    applyStyle(chip.dataset.style);
    updateCostUI({ note: "成本已随风格更新" });
  });

  ratioGrid.addEventListener("click", (e) => {
    const btn = e.target.closest(".ratio-btn");
    if (!btn) return;
    applyRatio(btn.dataset.ratio);
    updateCostUI();
  });

  if (durationChips) {
    durationChips.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      applyDuration(chip.dataset.seconds);
      updateCostUI({ note: "成本已随时长更新" });
    });
  }

  if (resolutionChips) {
    resolutionChips.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      applyResolution(chip.dataset.resolution);
      updateCostUI({ note: "成本已随分辨率更新" });
    });
  }

  generateBtn.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    generateBtn.disabled = true;
    document.querySelectorAll(".pipe-run").forEach((b) => {
      b.disabled = true;
    });
    try {
      await runPipeline();
    } finally {
      busy = false;
      generateBtn.disabled = false;
      document.querySelectorAll(".pipe-run").forEach((b) => {
        b.disabled = false;
      });
    }
  });

  const railPrev = document.getElementById("railPrev");
  const railNext = document.getElementById("railNext");

  function updateRailNav() {
    if (!casesGrid || !railPrev || !railNext) return;
    const max = casesGrid.scrollWidth - casesGrid.clientWidth - 2;
    railPrev.disabled = casesGrid.scrollLeft <= 2;
    railNext.disabled = casesGrid.scrollLeft >= max;
  }

  function scrollRail(dir) {
    const card = casesGrid.querySelector(".case-card");
    const step = card ? card.getBoundingClientRect().width + 14 : 294;
    casesGrid.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  if (railPrev && railNext) {
    railPrev.addEventListener("click", () => scrollRail(-1));
    railNext.addEventListener("click", () => scrollRail(1));
    casesGrid.addEventListener("scroll", updateRailNav, { passive: true });
    window.addEventListener("resize", updateRailNav);
  }

  if (modelPickerBtn && modelPickerMenu) {
    modelPickerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setModelPickerOpen(modelPickerMenu.hidden);
    });
    modelPickerMenu.addEventListener("click", (e) => {
      const opt = e.target.closest(".model-picker-option");
      if (!opt) return;
      applyModel(opt.dataset.model);
    });
    document.addEventListener("click", (e) => {
      if (!modelPicker.contains(e.target)) setModelPickerOpen(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setModelPickerOpen(false);
    });
  }

  const bootParams = new URLSearchParams(location.search);
  const bootModel = bootParams.get("model");
  applyModel(VIDEO_MODELS.some((m) => m.id === bootModel) ? bootModel : selectedModelId, {
    silent: true,
  });

  if (bootParams.get("prompt") || bootParams.get("from") === "upscale") {
    if (bootParams.get("prompt")) promptEl.value = bootParams.get("prompt");
    if (bootParams.get("negative")) negativeEl.value = bootParams.get("negative");
    const scene = bootParams.get("scene");
    const matched = CASES.find((c) => c.scene === scene);
    if (matched) activeCaseId = matched.id;
    if (bootParams.get("style")) applyStyle(bootParams.get("style"));
    else if (matched) applyStyle(matched.style);
    if (bootParams.get("ratio")) applyRatio(bootParams.get("ratio"));
    else if (matched) applyRatio(matched.ratio);
    if (bootParams.get("seconds")) {
      applyDuration(bootParams.get("seconds"));
    } else if (matched) {
      applyDuration(matched.seconds);
    }
    if (bootParams.get("resolution")) {
      applyResolution(bootParams.get("resolution"));
    }
    if (!bootParams.get("negative") && matched && bootParams.get("prompt")) {
      negativeEl.value = matched.negative;
    }
    if (
      bootParams.get("from") === "enhance" ||
      bootParams.get("from") === "generate" ||
      bootParams.get("from") === "upscale"
    ) {
      hasCompletedRun = true;
      const fromMsg = {
        enhance: "已从提示词增强页带回结果",
        generate: "已从视频生成体验页带回参数",
        upscale: "已从超分体验页带回参数",
      };
      showToast(fromMsg[bootParams.get("from")] || "已带回体验参数");
    }
  } else if (bootModel && VIDEO_MODELS.some((m) => m.id === bootModel)) {
    showToast(`已加载模型 ${currentModel().name}`);
  }

  if (pipelineList) {
    pipelineList.classList.add("is-pipeline");
    pipelineList.classList.remove("is-separate");
  }

  if (window.AlayaPlans) {
    window.AlayaPlans.init({ showToast, videoOnly: true });
  }

  renderCases();
  applyRatio(selectedRatio || "16:9");
  applyDuration(selectedSeconds);
  applyResolution(selectedResolution);
  updateCostUI({
    note: "选择下方场景实例或完成一次体验后展示预估费用",
  });
  requestAnimationFrame(updateRailNav);
})();
