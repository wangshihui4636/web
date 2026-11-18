(() => {
  const SCENE_LABEL = {
    coding: "编程开发",
    office: "办公创作",
    reasoning: "复杂推理",
    agent: "Agent 编排",
    "auto-ad": "视频制作",
    comic: "漫剧",
    podcast: "播客",
    media: "自媒体",
    "vision-doc": "图表文档",
  };

  const MODELS = [
    {
      id: "kimi-k3",
      name: "Kimi K3",
      version: "kimi-k3-full",
      vendor: "Moonshot",
      type: "text",
      tags: ["New", "满血"],
      caps: ["text", "code", "reasoning"],
      scenes: ["coding", "reasoning", "agent", "office"],
      desc: "长上下文旗舰文本模型，擅长复杂推理、编程与超长文档理解。",
      inputPrice: "8",
      outputPrice: "32",
      date: "2026-03",
      href: "models.html?q=Kimi",
    },
    {
      id: "glm-5.3",
      name: "GLM-5.3",
      version: "glm-5.3",
      vendor: "智谱",
      type: "text",
      tags: ["New"],
      caps: ["text", "code"],
      scenes: ["office", "coding", "agent"],
      desc: "通用对话与办公创作主力，稳定吞吐，适合业务系统接入。",
      inputPrice: "5",
      outputPrice: "20",
      date: "2026-03",
      href: "models.html?type=text&scene=office",
    },
    {
      id: "glm-5.3-flash",
      name: "GLM-5.3 Flash",
      version: "glm-5.3-flash",
      vendor: "智谱",
      type: "text",
      tags: ["快"],
      caps: ["text", "code"],
      scenes: ["office", "coding"],
      desc: "高性价比 Flash 档，适合高频对话、轻量办公与快速迭代。",
      inputPrice: "1.3",
      outputPrice: "2.8",
      date: "2026-03",
      href: "models.html?type=text&scene=office",
    },
    {
      id: "deepseek-v4.1-flash",
      name: "DeepSeek V4.1 Flash",
      version: "deepseek-v4.1-flash",
      vendor: "DeepSeek",
      type: "text",
      tags: ["热门", "快"],
      caps: ["text", "code", "reasoning"],
      scenes: ["coding", "reasoning", "agent"],
      desc: "高性价比推理与代码模型，OpenAI 兼容接口即开即用。",
      inputPrice: "2",
      outputPrice: "8",
      date: "2026-03",
      href: "models.html?type=text&scene=coding",
    },
    {
      id: "alaya-t2v",
      name: "Alaya Video",
      version: "alaya-t2v-1",
      vendor: "Alaya",
      type: "video",
      tags: ["体验"],
      caps: ["video", "text"],
      scenes: ["auto-ad", "comic", "podcast", "media"],
      desc: "文本生成视频工作台模型，支持风格、画幅与负向提示控制。",
      inputPrice: "—",
      outputPrice: "按次计费",
      date: "2026-03",
      href: "video.html?model=alaya-t2v",
      cta: "去体验",
    },
    {
      id: "alaya-t2v-cine",
      name: "Alaya Cine",
      version: "alaya-cine-preview",
      vendor: "Alaya",
      type: "video",
      tags: ["New"],
      caps: ["video"],
      scenes: ["auto-ad", "comic"],
      desc: "电影感镜头运动与光影增强，适合广告与叙事短片生成。",
      inputPrice: "—",
      outputPrice: "按次计费",
      date: "2026-03",
      href: "video.html?model=alaya-t2v-cine",
      cta: "去体验",
    },
    {
      id: "alaya-motion",
      name: "Alaya Motion",
      version: "alaya-motion-1",
      vendor: "Alaya",
      type: "video",
      tags: ["快"],
      caps: ["video"],
      scenes: ["comic", "media"],
      desc: "侧重运镜流畅与短内容节奏，适合自媒体与漫剧快剪。",
      inputPrice: "—",
      outputPrice: "按次计费",
      date: "2026-03",
      href: "video.html?model=alaya-motion",
      cta: "去体验",
    },
    {
      id: "alaya-reel",
      name: "Alaya Reel",
      version: "alaya-reel-1",
      vendor: "Alaya",
      type: "video",
      tags: [],
      caps: ["video"],
      scenes: ["media", "podcast"],
      desc: "竖屏优化视频模型，适合口播种草与短视频封面动效。",
      inputPrice: "—",
      outputPrice: "按次计费",
      date: "2026-02",
      href: "video.html?model=alaya-reel",
      cta: "去体验",
    },
    {
      id: "vision-pro",
      name: "Alaya Vision",
      version: "alaya-vision-2",
      vendor: "Alaya",
      type: "vision",
      tags: [],
      caps: ["vision", "text"],
      scenes: ["vision-doc", "office"],
      desc: "图像理解与视觉问答，支持图表、截图与文档版面解析。",
      inputPrice: "6",
      outputPrice: "18",
      date: "2026-01",
      href: "models.html?type=vision&scene=vision-doc",
    },
    {
      id: "mm-fusion",
      name: "Alaya Fusion",
      version: "alaya-fusion-1",
      vendor: "Alaya",
      type: "multimodal",
      tags: ["New"],
      caps: ["text", "vision", "video"],
      scenes: ["vision-doc", "agent", "media"],
      desc: "文本、图像与视频统一理解的多模态模型，适合复杂内容分析。",
      inputPrice: "12",
      outputPrice: "36",
      date: "2026-02",
      href: "models.html?type=multimodal&scene=agent",
    },
    {
      id: "claude-compat",
      name: "Anthropic 兼容通道",
      version: "anthropic-compatible",
      vendor: "Alaya",
      type: "text",
      tags: [],
      caps: ["text", "code"],
      scenes: ["coding", "agent"],
      desc: "Anthropic Messages 风格接口兼容层，现有工具链几乎零改造。",
      inputPrice: "视上游",
      outputPrice: "视上游",
      date: "2025-10",
      href: "models.html?type=text&scene=coding",
    },
  ];

  const CAP_LABEL = {
    text: "文本",
    code: "代码",
    reasoning: "推理",
    video: "视频",
    vision: "视觉",
  };

  const grid = document.getElementById("modelGrid");
  const empty = document.getElementById("squareEmpty");
  const countEl = document.getElementById("modelCount");
  const searchEl = document.getElementById("modelSearch");
  const tabs = document.getElementById("modalityTabs");
  const sceneFilter = document.getElementById("sceneFilter");
  const clearHint = document.getElementById("searchClear");

  const params = new URLSearchParams(location.search);
  let activeType = params.get("type") || "all";
  let activeScene = params.get("scene") || "all";
  let query = params.get("q") || "";

  if (query) searchEl.value = query;
  if (!SCENE_LABEL[activeScene] && activeScene !== "all") activeScene = "all";
  setActiveTab(activeType);
  setActiveScene(activeScene);

  function setActiveTab(type) {
    activeType = type;
    tabs.querySelectorAll(".modality-tab").forEach((btn) => {
      const on = btn.dataset.type === type;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function setActiveScene(scene) {
    activeScene = scene;
    sceneFilter.querySelectorAll(".scene-filter-chip").forEach((btn) => {
      const on = btn.dataset.scene === scene;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function matches(model) {
    const typeOk = activeType === "all" || model.type === activeType;
    if (!typeOk) return false;
    const sceneOk =
      activeScene === "all" || (model.scenes || []).includes(activeScene);
    if (!sceneOk) return false;
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const hay = [
      model.name,
      model.version,
      model.vendor,
      model.desc,
      model.type,
      ...(model.tags || []),
      ...(model.caps || []).map((c) => CAP_LABEL[c] || c),
      ...(model.scenes || []).map((s) => SCENE_LABEL[s] || s),
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  }

  function cardHtml(m) {
    const tags = (m.tags || [])
      .map((t) => `<span class="model-tag">${t}</span>`)
      .join("");
    const caps = (m.caps || [])
      .map((c) => `<span class="cap-pill">${CAP_LABEL[c] || c}</span>`)
      .join("");
    const scenes = (m.scenes || [])
      .slice(0, 3)
      .map((s) => `<span class="scene-pill">${SCENE_LABEL[s] || s}</span>`)
      .join("");
    const priceIn =
      m.inputPrice === "—" || m.inputPrice === "视上游"
        ? m.inputPrice
        : `${m.inputPrice} 元 / 百万 tokens`;
    const priceOut =
      m.outputPrice === "按次计费" || m.outputPrice === "视上游"
        ? m.outputPrice
        : `${m.outputPrice} 元 / 百万 tokens`;
    const cta = m.cta || "查看详情";
    const typeClass = `type-${m.type}`;

    return `
      <article class="model-card ${typeClass}">
        <div class="model-card-top">
          <div class="model-icon" aria-hidden="true"></div>
          <div class="model-tags">${tags}</div>
        </div>
        <h3 class="model-name">${m.name}</h3>
        <p class="model-version">${m.vendor} · ${m.version}</p>
        <p class="model-desc">${m.desc}</p>
        <div class="model-caps">${caps}</div>
        <div class="model-scenes">${scenes}</div>
        <div class="model-price">
          <div><span>输入</span>${priceIn}</div>
          <div><span>输出</span>${priceOut}</div>
        </div>
        <div class="model-card-foot">
          <time datetime="${m.date}">${m.date}</time>
          <a class="model-cta" href="${m.href}">${cta}
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M17 7H9M17 7v8"/></svg>
          </a>
        </div>
      </article>
    `;
  }

  function render() {
    const list = MODELS.filter(matches);
    countEl.textContent = String(list.length);
    clearHint.hidden = !query.trim();
    if (!list.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    grid.innerHTML = list.map(cardHtml).join("");
  }

  function syncUrl() {
    const p = new URLSearchParams();
    if (activeType !== "all") p.set("type", activeType);
    if (activeScene !== "all") p.set("scene", activeScene);
    if (query.trim()) p.set("q", query.trim());
    const qs = p.toString();
    history.replaceState(null, "", qs ? `?${qs}` : location.pathname);
  }

  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".modality-tab");
    if (!btn) return;
    setActiveTab(btn.dataset.type);
    syncUrl();
    render();
  });

  sceneFilter.addEventListener("click", (e) => {
    const btn = e.target.closest(".scene-filter-chip");
    if (!btn) return;
    setActiveScene(btn.dataset.scene);
    syncUrl();
    render();
  });

  let timer = 0;
  searchEl.addEventListener("input", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      query = searchEl.value;
      syncUrl();
      render();
    }, 120);
  });

  searchEl.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchEl.value = "";
      query = "";
      syncUrl();
      render();
      searchEl.blur();
    }
  });

  clearHint.addEventListener("click", () => {
    searchEl.value = "";
    query = "";
    syncUrl();
    render();
    searchEl.focus();
  });

  render();
})();
