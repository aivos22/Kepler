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
