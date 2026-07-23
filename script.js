const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const progressBar = document.querySelector(".page-progress span");
const header = document.querySelector("[data-header]");
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".site-nav");
const revealItems = document.querySelectorAll(".reveal, .image-reveal");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const heroSection = document.querySelector("[data-hero-section]");
const heroStage = document.querySelector("[data-hero]");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updateScroll = () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
  progressBar.style.transform = `scaleX(${clamp(progress, 0, 1)})`;

  if (!reducedMotion) {
    if (heroSection && heroStage) {
      const heroTravel = Math.max(heroSection.offsetHeight - window.innerHeight, 1);
      const heroProgress = clamp((window.scrollY - heroSection.offsetTop) / heroTravel, 0, 1);
      heroStage.style.setProperty("--hero-opacity", clamp(1 - heroProgress * 1.18, 0, 1).toFixed(4));
      heroStage.style.setProperty("--hero-meta-opacity", clamp(1 - heroProgress * 1.8, 0, 1).toFixed(4));
      heroStage.style.setProperty("--hero-grid-opacity", clamp(1 - heroProgress * 1.5, 0, 1).toFixed(4));
      heroStage.style.setProperty("--hero-left-x", `${(-heroProgress * 28).toFixed(3)}vw`);
      heroStage.style.setProperty("--hero-left-y", `${(-heroProgress * 8).toFixed(3)}vh`);
      heroStage.style.setProperty("--hero-right-x", `${(heroProgress * 28).toFixed(3)}vw`);
      heroStage.style.setProperty("--hero-right-y", `${(heroProgress * 8).toFixed(3)}vh`);
      heroStage.style.setProperty("--hero-blur", `${(heroProgress * 5).toFixed(2)}px`);
      heroStage.style.setProperty("--hero-kicker-y", `${(-heroProgress * 24).toFixed(2)}px`);
      heroStage.style.setProperty("--hero-intro-y", `${(heroProgress * 24).toFixed(2)}px`);
      heroStage.style.setProperty("--hero-trigger-scale", (1 + heroProgress * 0.8).toFixed(4));
    }

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

heroStage?.addEventListener("pointermove", (event) => {
  if (reducedMotion) return;
  const rect = heroStage.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
  heroStage.style.setProperty("--hero-left-pointer-x", `${(-x * 7).toFixed(2)}px`);
  heroStage.style.setProperty("--hero-left-pointer-y", `${(-y * 4).toFixed(2)}px`);
  heroStage.style.setProperty("--hero-right-pointer-x", `${(x * 7).toFixed(2)}px`);
  heroStage.style.setProperty("--hero-right-pointer-y", `${(y * 4).toFixed(2)}px`);
  heroStage.style.setProperty("--hero-trigger-x", `${(x * 14).toFixed(2)}px`);
  heroStage.style.setProperty("--hero-trigger-y", `${(y * 14).toFixed(2)}px`);
});

heroStage?.addEventListener("pointerleave", () => {
  [
    "--hero-left-pointer-x",
    "--hero-left-pointer-y",
    "--hero-right-pointer-x",
    "--hero-right-pointer-y",
    "--hero-trigger-x",
    "--hero-trigger-y",
  ].forEach((property) => heroStage.style.setProperty(property, "0px"));
});

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
