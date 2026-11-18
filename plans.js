(() => {
  const TEAM_PLANS = [
    {
      id: "team-light",
      name: "Light",
      price: "¥150",
      unit: "/席/月",
      video: "不含视频模型",
      hasVideo: false,
      benefits: ["25,000 Credits", "TPM 不保障（或 ≤2,000）", "不含视频模型"],
      pos: "个人→团队试用、流程验证；非生产主力",
    },
    {
      id: "team-small",
      name: "Small",
      price: "¥300",
      unit: "/席/月",
      video: "不含视频模型",
      hasVideo: false,
      benefits: ["50,000 Credits", "TPM 5,000", "不含视频模型", "建议起购 3 席"],
      pos: "小团队轻量协作",
    },
    {
      id: "team-standard",
      name: "Standard",
      price: "¥550",
      unit: "/席/月",
      video: "含视频额度 ¥200",
      hasVideo: true,
      featured: true,
      badge: "主推",
      benefits: ["100,000 Credits", "TPM 20,000 · 含文本/视频/图片", "含视频额度 ¥200（增强+生成+超分）"],
      pos: "研发/数据默认主力席位",
    },
    {
      id: "team-pro",
      name: "Pro",
      price: "¥1,298",
      unit: "/席/月",
      video: "含视频额度 ¥500",
      hasVideo: true,
      benefits: ["250,000 Credits", "共享吞吐上限 TPM 50,000", "含文本/视频/图片", "含视频额度 ¥500（增强+生成+超分）"],
      pos: "重度核心 / 内容生产席位",
    },
  ];

  function initPlans(options = {}) {
    const root = document.querySelector(".plans-section");
    if (!root) return;

    const planList = (options.plans || TEAM_PLANS).filter((p) =>
      options.videoOnly ? p.hasVideo : true
    );

    const notify =
      options.showToast ||
      ((msg) => {
        const toast = document.getElementById("toast");
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
      });

    let selectedPlanId =
      planList.find((p) => p.featured)?.id || planList[0]?.id || "team-standard";
    let selectedTopup = "10";
    const plansGrid = document.getElementById("plansGrid");
    const topupAmounts = document.getElementById("topupAmounts");
    const topupCustom = document.getElementById("topupCustom");
    const topupCustomInput = document.getElementById("topupCustomInput");
    const topupSummary = document.getElementById("topupSummary");
    const buyPersonal = document.getElementById("buyPersonal");
    const buyTeam = document.getElementById("buyTeam");

    function currentTopupAmount() {
      if (selectedTopup === "custom") {
        const n = Number(topupCustomInput?.value);
        return Number.isFinite(n) && n > 0 ? n : null;
      }
      return Number(selectedTopup);
    }

    function syncTopupSummary() {
      if (!topupSummary) return;
      const amount = currentTopupAmount();
      topupSummary.textContent = amount
        ? `已选充值 ¥${amount} · 基于消耗直接扣费，充多少扣多少 · 适配所有模型`
        : "请选择或输入自定义充值金额";
    }

    function syncBuyLinks() {
      const amount = currentTopupAmount();
      const teamPlan =
        planList.find((p) => p.id === selectedPlanId) ||
        planList.find((p) => p.featured) ||
        planList[0];
      if (buyPersonal) {
        const q = new URLSearchParams({ edition: "personal", mode: "topup" });
        if (amount) q.set("amount", String(amount));
        buyPersonal.href = `index.html#login?${q.toString()}`;
      }
      if (buyTeam && teamPlan) {
        buyTeam.href = `index.html#login?edition=team&plan=${encodeURIComponent(teamPlan.id)}`;
      }
    }

    function renderPlans() {
      if (plansGrid) {
        if (!planList.some((p) => p.id === selectedPlanId)) {
          selectedPlanId = planList.find((p) => p.featured)?.id || planList[0]?.id;
        }
        plansGrid.innerHTML = planList
          .map((p) => {
            const active = p.id === selectedPlanId ? " is-active" : "";
            const featured = p.featured ? " is-featured" : "";
            const badge = p.badge ? `<span class="plan-badge">${p.badge}</span>` : "";
            const benefits = p.benefits.map((b) => `<li>${b}</li>`).join("");
            return `
            <button type="button" class="plan-card${active}${featured}" data-plan="${p.id}" aria-pressed="${
              p.id === selectedPlanId ? "true" : "false"
            }">
              ${badge}
              <h3>${p.name}</h3>
              <div class="plan-price">${p.price}<span>${p.unit}</span></div>
              <span class="plan-video-tag">${p.video}</span>
              <ul class="plan-benefits">${benefits}</ul>
              <p class="plan-pos">${p.pos}</p>
            </button>
          `;
          })
          .join("");
      }

      if (topupCustom) topupCustom.hidden = selectedTopup !== "custom";
      syncTopupSummary();
      syncBuyLinks();
    }

    if (topupAmounts) {
      topupAmounts.addEventListener("click", (e) => {
        const btn = e.target.closest(".topup-amount");
        if (!btn) return;
        selectedTopup = btn.dataset.amount;
        topupAmounts.querySelectorAll(".topup-amount").forEach((el) => {
          el.classList.toggle("active", el === btn);
        });
        if (topupCustom) topupCustom.hidden = selectedTopup !== "custom";
        if (selectedTopup === "custom" && topupCustomInput) topupCustomInput.focus();
        syncTopupSummary();
        syncBuyLinks();
      });
    }

    if (topupCustomInput) {
      topupCustomInput.addEventListener("input", () => {
        syncTopupSummary();
        syncBuyLinks();
      });
    }

    if (plansGrid) {
      plansGrid.addEventListener("click", (e) => {
        const card = e.target.closest(".plan-card");
        if (!card) return;
        selectedPlanId = card.dataset.plan;
        renderPlans();
        const plan = planList.find((p) => p.id === selectedPlanId);
        if (plan) notify(`已选择团队版 · ${plan.name}`);
      });
    }

    if (buyPersonal) {
      buyPersonal.addEventListener("click", () => {
        const amount = currentTopupAmount();
        notify(amount ? `前往个人版充值 · ¥${amount}` : "请先选择充值金额");
      });
    }

    if (buyTeam) {
      buyTeam.addEventListener("click", () => {
        const plan =
          planList.find((p) => p.id === selectedPlanId) ||
          planList.find((p) => p.featured) ||
          planList[0];
        if (plan) notify(`前往购买团队版 · ${plan.name}`);
      });
    }

    renderPlans();
  }

  window.AlayaPlans = { init: initPlans, TEAM_PLANS };
})();
