(() => {
  const canvas = document.getElementById("neural");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let nodes = [];
    let raf = 0;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * DPR;
      canvas.height = h * DPR;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      seed();
    }

    function seed() {
      const count = Math.floor((w * h) / 18000);
      nodes = Array.from({ length: Math.max(28, Math.min(count, 70)) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 1.2 + Math.random() * 1.8,
      }));
    }

    function tick() {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.28;
            ctx.strokeStyle = `rgba(61, 107, 255, ${alpha * 0.85})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const n of nodes) {
        ctx.beginPath();
        ctx.fillStyle = "rgba(61, 107, 255, 0.45)";
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!reduceMotion.matches) {
      resize();
      tick();
      window.addEventListener("resize", resize);
    } else {
      resize();
      ctx.clearRect(0, 0, w, h);
    }
  }

  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  }

  const hubTabs = document.querySelector(".hub-tabs");
  if (hubTabs) {
    hubTabs.addEventListener("click", (e) => {
      const tab = e.target.closest(".hub-tab");
      if (!tab) return;
      const panelId = tab.dataset.panel;
      hubTabs.querySelectorAll(".hub-tab").forEach((t) => {
        const on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      document.querySelectorAll(".hub-panel").forEach((panel) => {
        const on = panel.id === panelId;
        panel.classList.toggle("active", on);
        panel.hidden = !on;
      });
    });
  }

  const copyBtn = document.getElementById("copyCmd");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const code = document.querySelector(".hub-code code");
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent.trim());
        copyBtn.textContent = "已复制";
        setTimeout(() => {
          copyBtn.textContent = "复制";
        }, 1600);
      } catch {
        copyBtn.textContent = "失败";
        setTimeout(() => {
          copyBtn.textContent = "复制";
        }, 1600);
      }
    });
  }

  const PRACTICE = {
    auto: {
      headline: "助力主流车企 AI 创新，Alaya Token 赋能智能座舱与驾驶云",
      theme: "auto",
      cases: [
        {
          title: "智能座舱",
          desc: "语音交互与内容推荐接入车机系统，文本模型承接多轮对话与场景理解。",
          featured: true,
        },
        {
          title: "智能驾驶云",
          desc: "云端推理加速标注与场景回放分析，统一吞吐与低延迟调度。",
        },
        {
          title: "智能营销",
          desc: "结合用户画像生成活动文案与短视频脚本，打通投放链路。",
        },
      ],
    },
    finance: {
      headline: "服务金融机构智能化升级，研报、风控与客服同一套 Token 体系",
      theme: "finance",
      cases: [
        {
          title: "智能研报",
          desc: "多文档摘要与指标抽取，缩短分析师研报生产周期。",
          featured: true,
        },
        {
          title: "合规风控",
          desc: "规则问答与敏感信息识别，辅助合规审查与工单分流。",
        },
        {
          title: "财富顾问",
          desc: "个性化产品解读与问答，提升理财顾问服务效率。",
        },
      ],
    },
    device: {
      headline: "端侧与云端协同，智能终端上的对话、视觉与创作体验",
      theme: "auto",
      cases: [
        {
          title: "端云助手",
          desc: "系统级助手接入兼容接口，统一调用多厂商文本模型。",
          featured: true,
        },
        {
          title: "影像理解",
          desc: "视觉模型解析相册与截图，生成标签与智能摘要。",
        },
        {
          title: "内容创作",
          desc: "一键生成文案与短视频草稿，服务终端创作工具。",
        },
      ],
    },
    consumer: {
      headline: "驱动消费品牌增长，客服、导购与内容生产智能化",
      theme: "auto",
      cases: [
        {
          title: "智能客服",
          desc: "多轮问答承接售后与物流咨询，降低人工坐席压力。",
          featured: true,
        },
        {
          title: "导购助手",
          desc: "基于商品知识库推荐搭配方案，提升转化率。",
        },
        {
          title: "内容种草",
          desc: "批量生成种草文案与短视频脚本，加速营销素材迭代。",
        },
      ],
    },
    edu: {
      headline: "个性化学习与教研提效，教育场景中的模型落地实践",
      theme: "finance",
      cases: [
        {
          title: "智能题解",
          desc: "按学科切换推理模型，生成分步讲解与变式练习。",
          featured: true,
        },
        {
          title: "教研助手",
          desc: "课件大纲与测验题自动生成，减轻教师备课负担。",
        },
        {
          title: "学习陪练",
          desc: "口语与写作陪练，实时反馈并追踪学习进度。",
        },
      ],
    },
    media: {
      headline: "影视广告内容工业化，从提示词到成片的生成工作流",
      theme: "media",
      cases: [
        {
          title: "脚本生成",
          desc: "文本模型快速产出分镜脚本与旁白，缩短前期策划。",
          featured: true,
        },
        {
          title: "视频生成",
          desc: "Alaya Video 工作台按风格与画幅批量产出镜头草案。",
        },
        {
          title: "素材改写",
          desc: "多版本广告文案与字幕适配，提升投放测试效率。",
        },
      ],
    },
    energy: {
      headline: "能源交通智能化运维，知识问答与调度决策提效",
      theme: "auto",
      cases: [
        {
          title: "运维知识库",
          desc: "设备手册与工单沉淀为可问答知识，现场快速检索。",
          featured: true,
        },
        {
          title: "调度辅助",
          desc: "结合业务规则生成调度建议，辅助值班人员决策。",
        },
        {
          title: "安全巡检",
          desc: "影像理解辅助巡检记录归纳，自动输出异常摘要。",
        },
      ],
    },
  };

  const industryBar = document.getElementById("industryBar");
  const practiceCases = document.getElementById("practiceCases");
  const practiceHeadline = document.getElementById("practiceHeadline");
  const practiceVisual = document.getElementById("practiceVisual");

  function renderPractice(key) {
    const data = PRACTICE[key];
    if (!data || !practiceCases) return;
    practiceHeadline.textContent = data.headline;
    practiceVisual.dataset.theme = data.theme;
    const tiles = data.cases
      .map(
        (c) => `
      <article class="case-tile${c.featured ? " featured" : ""}">
        <h3>${c.title}</h3>
        <p>${c.desc}</p>
        <a class="case-link" href="#meta">查看案例 →</a>
      </article>`
      )
      .join("");
    practiceCases.innerHTML =
      tiles +
      `
      <article class="case-tile cta-tile">
        <div>
          <h3>生成定制化场景方案</h3>
          <p>描述你的业务场景，AI 帮你梳理模型选型与落地路径。</p>
        </div>
        <button type="button" class="btn-outline" id="aiPlanBtn">AI 生成专属方案</button>
      </article>`;
    const planBtn = document.getElementById("aiPlanBtn");
    if (planBtn) {
      planBtn.addEventListener("click", () => {
        planBtn.textContent = "方案生成中…";
        setTimeout(() => {
          planBtn.textContent = "已生成示意方案 ✓";
          setTimeout(() => {
            planBtn.textContent = "AI 生成专属方案";
          }, 2000);
        }, 900);
      });
    }
  }

  if (industryBar) {
    industryBar.addEventListener("click", (e) => {
      const chip = e.target.closest(".industry-chip");
      if (!chip) return;
      industryBar.querySelectorAll(".industry-chip").forEach((c) => {
        const on = c === chip;
        c.classList.toggle("active", on);
        c.setAttribute("aria-selected", on ? "true" : "false");
      });
      renderPractice(chip.dataset.industry);
    });
    renderPractice("auto");
  }

  if (window.AlayaPlans) {
    const toast = document.getElementById("toast");
    window.AlayaPlans.init({
      showToast: (msg) => {
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add("show");
        clearTimeout(toast._timer);
        toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
      },
    });
  }
})();
