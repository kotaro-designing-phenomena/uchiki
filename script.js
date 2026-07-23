const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const progressBar = document.querySelector(".page-progress span");
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll(".reveal, .image-reveal");
const parallaxItems = document.querySelectorAll("[data-parallax]");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updateScroll = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${clamp(progress, 0, 1)})`;

  if (!reducedMotion) {
    parallaxItems.forEach((item) => {
      const rect = item.getBoundingClientRect();
      const speed = Number(item.dataset.parallax || 0);
      const offset = (window.innerHeight / 2 - (rect.top + rect.height / 2)) * speed;
      item.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
  }
};

let ticking = false;
let lastScrollY = window.scrollY;

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateScroll();
        const current = window.scrollY;
        if (current > 180 && current > lastScrollY + 8) {
          header.classList.add("is-hidden");
        } else if (current < lastScrollY - 8 || current < 100) {
          header.classList.remove("is-hidden");
        }
        lastScrollY = current;
        ticking = false;
      });
      ticking = true;
    }
  },
  { passive: true }
);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
);

revealItems.forEach((item) => {
  if (reducedMotion) {
    item.classList.add("is-visible");
  } else {
    observer.observe(item);
  }
});

menuButton?.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("is-open", !open);
  document.body.classList.toggle("menu-open", !open);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menuButton?.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  });
});

updateScroll();
