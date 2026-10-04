(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Header glass intensifies on scroll
  const header = document.querySelector("header");
  const onScroll = () => header.classList.toggle("scrolled", scrollY > 20);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Scroll reveal with stagger
  const targets = document.querySelectorAll(
    ".hero .tag, .hero h1, .hero p, .hero .btns, .hero-meta, .hero-visual, .section-title, .grid > *, .stats, .cta, .contact > *"
  );
  const targetSet = new Set(targets);
  targets.forEach(el => {
    el.classList.add("reveal");
    const i = [...el.parentElement.children].filter(c => targetSet.has(c)).indexOf(el);
    el.style.transitionDelay = `${Math.min(i, 6) * 90}ms`;
  });
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(el => io.observe(el));
  } else {
    targets.forEach(el => el.classList.add("in"));
  }

  // Mouse spotlight on glass cards
  document.querySelectorAll(".card").forEach(card => {
    card.addEventListener("pointermove", e => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    });
  });

  // 3D tilt for the hero phone
  const visual = document.querySelector(".hero-visual");
  const phone = document.querySelector(".phone");
  if (visual && phone && !reduce) {
    visual.addEventListener("pointermove", e => {
      const r = visual.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      phone.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 18}deg)`;
    });
    visual.addEventListener("pointerleave", () => { phone.style.transform = ""; });
  }

  // Neural-network particle background
  const canvas = document.getElementById("net");
  if (!canvas || reduce) return;
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const mouse = { x: -9999, y: -9999 };
  let w, h, pts = [];

  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, (w * h) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6
    }));
  };
  addEventListener("resize", resize);
  addEventListener("pointermove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  addEventListener("pointerleave", () => { mouse.x = mouse.y = -9999; });
  resize();

  const LINK = 130, LINK2 = LINK * LINK;
  const tick = () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
      const dx = mouse.x - p.x, dy = mouse.y - p.y, d2 = dx * dx + dy * dy;
      if (d2 < 32000) { p.x += dx * 0.004; p.y += dy * 0.004; }
    }
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      for (let j = i + 1; j < pts.length; j++) {
        const b = pts[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
        if (d2 < LINK2) {
          const o = 1 - d2 / LINK2;
          ctx.strokeStyle = `rgba(110,140,255,${o * 0.35})`;
          ctx.lineWidth = o;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = (mouse.x - a.x) ** 2 + (mouse.y - a.y) ** 2;
      if (md < 40000) {
        ctx.strokeStyle = `rgba(34,211,238,${(1 - md / 40000) * 0.6})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      ctx.fillStyle = "rgba(180,200,255,.85)";
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
    }
    requestAnimationFrame(tick);
  };
  tick();
})();
