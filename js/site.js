const toggle = document.querySelector(".nav-toggle");
const menu = document.getElementById("menu");
const header = document.querySelector(".nav");
const hero = document.querySelector(".sky");

function closeMenu() {
  document.body.classList.remove("nav-open");
  toggle?.setAttribute("aria-expanded", "false");
}

toggle?.addEventListener("click", () => {
  const open = document.body.classList.toggle("nav-open");
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

function onScroll() {
  const limit = hero ? Math.max(hero.offsetHeight - 72, 24) : 12;
  header?.classList.toggle("is-scrolled", window.scrollY > limit);
}

onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const items = document.querySelectorAll(".reveal");

if (!reduce && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );
  items.forEach((item) => observer.observe(item));
} else {
  items.forEach((item) => item.classList.add("is-in"));
}

const root = document.documentElement;

function setScrollProgress() {
  const max = root.scrollHeight - window.innerHeight;
  const progress = max > 0 ? window.scrollY / max : 0;
  root.style.setProperty("--scroll", progress.toFixed(4));
}

setScrollProgress();
window.addEventListener("scroll", setScrollProgress, { passive: true });

const spectrum = document.getElementById("spectrum");
const thumb = document.getElementById("spectrum-thumb");
const readout = document.getElementById("spectrum-read");

function phraseFor(nm) {
  if (nm > 640) return "still close to the source";
  if (nm > 580) return "the light is leaving";
  if (nm > 520) return "crossing the sun's middle";
  if (nm > 470) return "shifted off red";
  return "as blue as this bar goes";
}

function applyShift(amount) {
  const clamped = Math.min(1, Math.max(0, amount));
  const nm = Math.round(680 - clamped * 250);
  root.style.setProperty("--shift", clamped.toFixed(3));
  root.style.setProperty("--word-weight", String(Math.round(460 + clamped * 240)));
  if (thumb) thumb.style.setProperty("--thumb", `${clamped * 100}%`);
  if (spectrum) spectrum.setAttribute("aria-valuenow", String(nm));
  if (readout) readout.textContent = `${nm} nm · ${phraseFor(nm)}`;
}

function shiftFromPointer(event) {
  const rect = spectrum.getBoundingClientRect();
  if (!rect.width) return;
  applyShift((event.clientX - rect.left) / rect.width);
}

if (spectrum) {
  applyShift(0.24);
  spectrum.addEventListener("pointerdown", (event) => {
    spectrum.setPointerCapture?.(event.pointerId);
    shiftFromPointer(event);
  });
  spectrum.addEventListener("pointermove", shiftFromPointer);
  spectrum.addEventListener("keydown", (event) => {
    const current = Number(spectrum.getAttribute("aria-valuenow") || 620);
    const next = event.key === "ArrowRight" ? current - 12 : event.key === "ArrowLeft" ? current + 12 : current;
    if (next === current) return;
    event.preventDefault();
    applyShift((680 - next) / 250);
  });
}

const photo = document.querySelector(".hero-photo");
const photoImg = photo?.querySelector(":scope > img");

if (photo && photoImg && !reduce) {
  photo.addEventListener("pointermove", (event) => {
    const rect = photo.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    photoImg.style.transform = `scale(1.08) translate(${(-x * 18).toFixed(1)}px, ${(-y * 14).toFixed(1)}px)`;
  });
  photo.addEventListener("pointerleave", () => {
    photoImg.style.transform = "scale(1.08)";
  });
}

async function lightDome(figure) {
  const image = figure.querySelector("img[src$='dome.svg']");
  if (!image) return;
  try {
    const markup = await fetch(image.getAttribute("src")).then((response) => response.text());
    const holder = document.createElement("div");
    holder.innerHTML = markup;
    const svg = holder.querySelector("svg");
    if (!svg) return;
    svg.setAttribute("aria-hidden", "true");
    image.replaceWith(svg);
    const panels = [...svg.querySelectorAll("polygon")];
    const paint = (clientX, clientY) => {
      panels.forEach((panel) => {
        const box = panel.getBoundingClientRect();
        const distance = Math.hypot(clientX - (box.left + box.width / 2), clientY - (box.top + box.height / 2));
        const glow = Math.max(0, 1 - distance / 130);
        panel.style.fill = `rgba(255, ${Math.round(214 - glow * 50)}, ${Math.round(170 - glow * 70)}, ${(0.14 + glow * 0.7).toFixed(3)})`;
      });
    };
    const stage = figure.closest(".hero-photo") || figure;
    stage.addEventListener("pointermove", (event) => paint(event.clientX, event.clientY));
  } catch {
    /* the still diagram remains */
  }
}

document.querySelectorAll(".glass-dome").forEach((figure) => {
  lightDome(figure);
});

function countUp(node) {
  const raw = node.textContent.trim();
  const match = raw.match(/^(\d+)/);
  if (!match || reduce) return;
  const target = Number(match[1]);
  const suffix = raw.slice(match[1].length);
  const started = performance.now();
  const tick = (now) => {
    const progress = Math.min(1, (now - started) / 800);
    const eased = 1 - (1 - progress) ** 3;
    node.textContent = `${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const figures = document.querySelectorAll(".stat b");
if (figures.length && "IntersectionObserver" in window) {
  const counter = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      countUp(entry.target);
      counter.unobserve(entry.target);
    });
  }, { threshold: 0.6 });
  figures.forEach((figure) => counter.observe(figure));
}
