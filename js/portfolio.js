/* IMAGINARY — Portfolio: category filters, sticky image window, active company */
(() => {
  const CATEGORIES = [
    "Apparel & Accessories",
    "Beauty & Personal Care",
    "Consumer Internet",
    "Health & Wellness",
    "Food & Beverage",
    "Home",
    "Luxury",
    "Pet",
    "4-Wall",
    "Software and Enablement",
    "Exited",
  ];

  // Names follow the Figma list (3186:2132). Images come from the
  // "Portolio company images" board (3186:2676); `crop` reproduces that board's
  // per-image framing (left/top/width/height in % of the thumbnail window).
  // Categories are a best-guess mapping: Figma doesn't define one.
  const C = (name, img, cats, extra = {}) => ({ name, img, cats, ...extra });
  const COMPANIES = [
    C("10beauty", "t0.jpg", ["Beauty & Personal Care"]),
    C("Alec’s Ice cream", "t1.jpg", ["Food & Beverage"], { crop: [0, -4.7, 100, 125] }),
    C("Ayoh", "t2.jpg", ["Food & Beverage"]),
    C("Bath House", "t3.jpg", ["Health & Wellness", "4-Wall"], { crop: [-64.02, -53.09, 228.05, 190.2] }),
    C("Black Crow AI", "t4.jpg", ["Software and Enablement"], { crop: [0, -5.23, 100, 187.5] }),
    C("Builder", "t5.jpg", ["Software and Enablement"]),
    C("Cafeteria", "t6.jpg", ["Consumer Internet"]),
    C("Cann", "t7.jpg", ["Food & Beverage"]),
    C("Cerebelly", "t8.png", ["Food & Beverage", "Health & Wellness"]),
    C("Daily Harvest", "t9.jpg", ["Food & Beverage"]),
    C("Duos", "t10.png", ["Health & Wellness"]),
    C("Eon", null, ["Software and Enablement"]),
    C("Farfetch", "t11.jpg", ["Luxury", "Apparel & Accessories"]),
    C("Glossier", "t12.png", ["Beauty & Personal Care"], { exited: true, crop: [0, -27.53, 100, 166.67] }),
    C("Good American", "t13.jpg", ["Apparel & Accessories"]),
    C("Goose holdings", "t14.jpg", ["4-Wall"]),
    C("half magic", "t15.png", ["Beauty & Personal Care"]),
    C("hook media", "t16.png", ["Consumer Internet"]),
    C("hum nutrition", "t17.png", ["Health & Wellness"]),
    C("khy", "t18.jpg", ["Apparel & Accessories"], { crop: [-3.94, -6.64, 107.87, 168.55] }),
    C("korean bros", "t19.png", ["Food & Beverage"], { crop: [-16.19, -10.29, 132.38, 120.57] }),
    C("lore", "t20.jpg", ["Beauty & Personal Care"], { crop: [0, -34.52, 100, 156.25] }),
    C("lucky beverage", "t21.jpg", ["Food & Beverage"]),
    C("mejuri", "t22.jpg", ["Apparel & Accessories", "Luxury"]),
    C("mila", "t23.jpg", ["Food & Beverage"]),
    C("nanos", "t24.jpg", ["Pet"]),
    C("necessaire", "t25.jpg", ["Beauty & Personal Care"]),
    C("nuorder", "t26.png", ["Software and Enablement"], { crop: [-24.79, -16.44, 149.25, 118.03] }),
    C("pepper (pomogranate tech)", null, ["Software and Enablement"]),
    C("point of view", "t27.jpg", ["Health & Wellness"]),
    C("Reale Actives", "t28.jpg", ["Beauty & Personal Care"], { crop: [-18.21, -14.73, 132.7, 124.6] }),
    C("Reformation", "t29.png", ["Apparel & Accessories"], { exited: true }),
    C("retro (Lone Palm Labs)", "t30.png", ["Consumer Internet"]),
    C("Santo Taco", "t31.jpg", ["Food & Beverage", "4-Wall"]),
    C("shiftsmart", "t32.jpg", ["Software and Enablement"], { crop: [0, -0.64, 100, 109.52] }),
    C("smalls", "t33.png", ["Pet"]),
    C("sworl", "t34.jpg", ["Food & Beverage"]),
    C("TheFeed.", "t35.png", ["Health & Wellness"]),
    C("Thirty Madison", "t36.jpg", ["Health & Wellness"]),
    C("universal standard", "t37.jpg", ["Apparel & Accessories"]),
  ];

  const chipsEl = document.querySelector(".chips");
  const rowsEl = document.querySelector(".p-rows");
  const head = document.querySelector(".p-list__head");
  const section = document.querySelector(".p-list");
  const thumb = document.querySelector(".p-thumb");
  const reduce = window.Imaginary?.reduceMotion;

  /* ---------- Chips ---------- */
  const chipX = '<img class="chip__x" src="assets/icons/chip-x.svg" alt="" width="9.975" height="9.975">';
  chipsEl.innerHTML = CATEGORIES.map((c) =>
    `<button class="chip" type="button" aria-pressed="false" data-cat="${c}"><span>${c}</span>${chipX}</button>`
  ).join("");

  /* ---------- Rows ---------- */
  rowsEl.innerHTML = COMPANIES.map((co, i) =>
    `<button class="p-row" type="button" data-i="${i}"><span class="p-row__name">${co.name}</span>${co.exited ? '<span class="p-row__tag">Exited</span>' : ""}</button>`
  ).join("") + '<p class="p-empty" hidden>No companies in this category yet</p>';
  const rows = [...rowsEl.querySelectorAll(".p-row")];
  rows.forEach((r) => r.addEventListener("animationend", () => r.classList.remove("is-entering")));
  const empty = rowsEl.querySelector(".p-empty");

  /* ---------- Image window (two layers for a cross-fade) ---------- */
  const layers = [0, 1].map(() => {
    const d = document.createElement("div");
    d.className = "p-thumb__layer";
    thumb.appendChild(d);
    return d;
  });
  let front = 0;
  let shownIndex = -1;

  function paint(layer, co) {
    layer.innerHTML = "";
    if (!co.img) return; // Figma shows the empty grey (#9f9f9f) window
    const img = new Image();
    img.alt = co.name;
    img.decoding = "async";
    img.src = `assets/thumbs/${co.img}`;
    if (co.crop) {
      const [l, t, w, h] = co.crop;
      Object.assign(img.style, { left: `${l}%`, top: `${t}%`, width: `${w}%`, height: `${h}%` });
    } else {
      img.className = "cover";
    }
    layer.appendChild(img);
  }

  function showImage(i) {
    if (i === shownIndex) return;
    shownIndex = i;
    const next = layers[1 - front];
    paint(next, COMPANIES[i]);
    next.classList.add("is-current");
    layers[front].classList.remove("is-current");
    front = 1 - front;
  }

  /* ---------- Active company follows scroll ---------- */
  let activeRow = null;
  function setActive(row) {
    if (!row || row === activeRow) return;
    activeRow?.classList.remove("is-active");
    row.classList.add("is-active");
    activeRow = row;
    // everything above the active company disappears
    let past = true;
    for (const r of rows) {
      if (r === row) past = false;
      r.classList.toggle("is-past", past && !r.hidden);
    }
    showImage(+row.dataset.i);
  }

  const visibleRows = () => rows.filter((r) => !r.hidden);

  function updateActive() {
    const vis = visibleRows();
    if (!vis.length) return;
    const line = head.getBoundingClientRect().bottom - 2;
    let pick = vis[vis.length - 1];
    for (const r of vis) {
      if (r.getBoundingClientRect().top >= line) { pick = r; break; }
    }
    setActive(pick);
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { ticking = false; updateActive(); });
  }, { passive: true });
  window.addEventListener("resize", updateActive);

  /* Tap a company → bring it to the active line */
  function scrollToRow(row) {
    const y = window.scrollY + row.getBoundingClientRect().top - head.offsetHeight + 1;
    window.scrollTo({ top: Math.max(y, sectionTop()), behavior: reduce ? "auto" : "smooth" });
  }
  rows.forEach((r) => r.addEventListener("click", () => { setActive(r); scrollToRow(r); }));

  /* ---------- Filters ---------- */
  const sectionTop = () => window.scrollY + section.getBoundingClientRect().top;

  function applyFilter(cat) {
    const listTop = sectionTop();
    const wasPast = window.scrollY > listTop;
    chipsEl.querySelectorAll(".chip").forEach((c) => {
      const on = c.dataset.cat === cat;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", String(on));
    });

    let n = 0;
    rows.forEach((r) => {
      const co = COMPANIES[+r.dataset.i];
      const match = !cat || (cat === "Exited" ? co.exited : co.cats.includes(cat));
      r.hidden = !match;
      r.classList.remove("is-entering");
      if (match) {
        void r.offsetWidth; // restart the entrance animation
        r.style.setProperty("--d", `${Math.min(n, 14) * 0.035}s`);
        r.classList.add("is-entering");
        n++;
      }
    });
    empty.hidden = n > 0;

    // Keep the list anchored at its start so the first match is active
    if (wasPast) window.scrollTo({ top: listTop, behavior: "auto" });
    activeRow?.classList.remove("is-active");
    activeRow = null;
    const first = visibleRows()[0];
    if (first) setActive(first);
    else { shownIndex = -1; layers.forEach((l) => { l.classList.remove("is-current"); }); }
    requestAnimationFrame(updateActive);
  }

  let current = null;
  chipsEl.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    current = current === chip.dataset.cat ? null : chip.dataset.cat;
    applyFilter(current);
    if (current) {
      const box = chipsEl.getBoundingClientRect(), c = chip.getBoundingClientRect();
      chipsEl.scrollBy({ left: c.left - box.left - (box.width - c.width) / 2, behavior: reduce ? "auto" : "smooth" });
    }
  });

  /* ---------- Featured row: native horizontal scroll, plus mouse drag ---------- */
  const strip = document.querySelector(".p-featured");
  if (strip) {
    const cardW = () => strip.querySelector(".feature").offsetWidth;
    let down = false, startX = 0, startLeft = 0;
    strip.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true; startX = e.clientX; startLeft = strip.scrollLeft;
      strip.classList.add("is-dragging");
    });
    window.addEventListener("pointermove", (e) => { if (down) strip.scrollLeft = startLeft - (e.clientX - startX); });
    window.addEventListener("pointerup", () => {
      if (!down) return;
      down = false;
      strip.classList.remove("is-dragging");
      strip.scrollTo({ left: Math.round(strip.scrollLeft / cardW()) * cardW(), behavior: reduce ? "auto" : "smooth" });
    });
    strip.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") strip.scrollBy({ left: cardW(), behavior: "smooth" });
      if (e.key === "ArrowLeft") strip.scrollBy({ left: -cardW(), behavior: "smooth" });
    });
  }

  /* ---------- Init ---------- */
  setActive(rows[0]);
  updateActive();

  // Warm the cache so image swaps are instant while scrolling
  const warm = () => COMPANIES.forEach((co) => { if (co.img) { const i = new Image(); i.src = `assets/thumbs/${co.img}`; } });
  if ("requestIdleCallback" in window) requestIdleCallback(warm, { timeout: 2500 });
  else setTimeout(warm, 1500);
})();
