/* IMAGINARY — shared interactions: menu, nav bar, reveals, parallax, page transitions */
(() => {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Menu ---------- */
  const menu = document.querySelector(".menu");
  const nav = document.querySelector(".nav");
  let lastFocus = null;

  function openMenu(e) {
    if (!menu || menu.classList.contains("is-open")) return;
    const viaKeyboard = e?.detail === 0;
    lastFocus = document.activeElement;
    menu.classList.add("is-open");
    menu.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    document.querySelectorAll("[data-menu-open]").forEach((b) => b.setAttribute("aria-expanded", "true"));
    // Move focus into the menu for keyboard users only (no focus ring after a tap)
    if (viaKeyboard) setTimeout(() => menu.querySelector(".menu__close")?.focus({ preventScroll: true }), 50);
  }

  function closeMenu() {
    if (!menu || !menu.classList.contains("is-open")) return;
    menu.classList.remove("is-open");
    menu.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    document.querySelectorAll("[data-menu-open]").forEach((b) => b.setAttribute("aria-expanded", "false"));
    lastFocus?.focus?.({ preventScroll: true });
  }

  document.querySelectorAll("[data-menu-open]").forEach((b) => b.addEventListener("click", openMenu));
  menu?.querySelector(".menu__close")?.addEventListener("click", closeMenu);
  menu?.querySelector(".menu__scrim")?.addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* ---------- Links: same-page anchors scroll, other pages fade out ---------- */
  function samePage(url) {
    return url.origin === location.origin && url.pathname.replace(/index\.html$/, "") === location.pathname.replace(/index\.html$/, "");
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const href = a.getAttribute("href");
    if (href.startsWith("mailto:") || href.startsWith("http")) return;
    const url = new URL(a.href, location.href);
    const inMenu = !!a.closest(".menu");

    if (samePage(url)) {
      e.preventDefault();
      const target = url.hash ? document.querySelector(url.hash) : null;
      const go = () => {
        if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        else window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      };
      if (inMenu) { closeMenu(); setTimeout(go, 450); } else go();
      return;
    }

    e.preventDefault();
    if (inMenu) closeMenu();
    root.classList.add("is-leaving");
    setTimeout(() => { location.href = url.href; }, inMenu ? 520 : 340);
  });

  window.addEventListener("pageshow", (e) => { if (e.persisted) root.classList.remove("is-leaving"); });

  // Arriving with a hash (e.g. index.html#about from another page)
  if (location.hash) {
    const t = document.querySelector(location.hash);
    if (t) requestAnimationFrame(() => setTimeout(() => t.scrollIntoView({ block: "center" }), 60));
  }

  /* ---------- Nav bar: appears on scroll-up once past the first screen ---------- */
  let lastY = window.scrollY;
  let navTicking = false;
  function updateNav() {
    navTicking = false;
    if (!nav) return;
    const y = window.scrollY;
    const delta = y - lastY;
    if (y < window.innerHeight * 0.6) nav.classList.remove("is-shown");
    else if (delta < -6) nav.classList.add("is-shown");
    else if (delta > 6) nav.classList.remove("is-shown");
    if (Math.abs(delta) > 6) lastY = y;
  }

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll("[data-reveal], [data-inview]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.01 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Subtle parallax ---------- */
  const parallaxEls = reduceMotion ? [] : [...document.querySelectorAll("[data-parallax]")];
  function updateParallax() {
    const vh = window.innerHeight;
    for (const el of parallaxEls) {
      const host = el.parentElement.getBoundingClientRect();
      if (host.bottom < -200 || host.top > vh + 200) continue;
      const factor = parseFloat(el.dataset.parallax) || 0.1;
      // Offset is zero at the Figma "rest" position: section top at viewport top
      // (anchor "top") or section bottom at viewport bottom (anchor "bottom").
      const rest = el.dataset.anchor === "bottom" ? vh - host.height : 0;
      const offset = (rest - host.top) * factor;
      el.style.translate = `0 ${offset.toFixed(2)}px`;
    }
  }

  let ticking = false;
  function onScroll() {
    if (!navTicking) { navTicking = true; requestAnimationFrame(updateNav); }
    if (!ticking && parallaxEls.length) {
      ticking = true;
      requestAnimationFrame(() => { ticking = false; updateParallax(); });
    }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateParallax);
  updateParallax();

  window.Imaginary = { openMenu, closeMenu, reduceMotion };
})();
