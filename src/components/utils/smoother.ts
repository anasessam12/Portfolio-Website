import type { ScrollSmoother } from "gsap-trial/ScrollSmoother";

/**
 * Tiny registry for the single ScrollSmoother instance so any component can
 * trigger a smooth scroll without importing the Navbar (and creating a
 * circular module dependency).
 */
let instance: ScrollSmoother | null = null;

export const setSmoother = (value: ScrollSmoother) => {
  instance = value;
};

export const getSmoother = () => instance;

export const scrollToSection = (id: string) => {
  const target = document.getElementById(id);
  if (!target) return;
  if (instance && window.innerWidth > 1024) {
    instance.scrollTo(target, true, "top top");
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export const scrollToTop = () => {
  if (instance && window.innerWidth > 1024) {
    instance.scrollTo(0, true);
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};
