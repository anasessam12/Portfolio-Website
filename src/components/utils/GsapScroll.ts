import gsap from "gsap";

/**
 * Scroll-driven choreography for the landing hero.
 *
 * The 3D character was removed, so the hero is now purely typographic: the
 * copy lifts and fades as you leave the viewport while the glow backdrop
 * parallaxes at a slower rate for depth.
 */
export function setLandingTimeline() {
  const landing = document.querySelector(".landing-section");
  if (!landing) return;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: ".landing-section",
      start: "top top",
      end: "bottom top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });

  tl.to(".landing-container", { y: "22%", duration: 1, ease: "none" }, 0)
    .to(".landing-container", { opacity: 0, duration: 0.65 }, 0.15)
    .to(".landing-backdrop", { y: "12%", scale: 1.08, duration: 1 }, 0)
    .to(".landing-scroll", { opacity: 0, duration: 0.2 }, 0);

  const about = document.querySelector(".about-section");
  if (about) {
    gsap.fromTo(
      ".about-me",
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".about-section",
          start: "top 78%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      }
    );
  }

  if (document.querySelector(".whatIDO") && window.innerWidth > 1024) {
    gsap.fromTo(
      ".what-box-in",
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ".whatIDO",
          start: "top 70%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      }
    );
  }
}

export function setAllTimeline() {
  if (!document.querySelector(".career-section")) return;

  const careerTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: ".career-section",
      start: "top 30%",
      end: "100% center",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  careerTimeline
    .fromTo(
      ".career-timeline",
      { maxHeight: "10%" },
      { maxHeight: "100%", duration: 0.5 },
      0
    )

    .fromTo(".career-timeline", { opacity: 0 }, { opacity: 1, duration: 0.1 }, 0)
    .fromTo(
      ".career-info-box",
      { opacity: 0 },
      { opacity: 1, stagger: 0.1, duration: 0.5 },
      0
    )
    .fromTo(
      ".career-dot",
      { animationIterationCount: "infinite" },
      {
        animationIterationCount: "1",
        delay: 0.3,
        duration: 0.1,
      },
      0
    );

  if (window.innerWidth > 1024) {
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: "20%", duration: 0.5, delay: 0.2 },
      0
    );
  } else {
    careerTimeline.fromTo(
      ".career-section",
      { y: 0 },
      { y: 0, duration: 0.5, delay: 0.2 },
      0
    );
  }
}
