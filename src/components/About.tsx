import { lazy, Suspense, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles/About.css";
import { portfolio } from "../data/portfolio";

// Code-split the 3D visual so three.js stays out of the eager bundle.
const AboutVisual = lazy(() => import("./AboutVisual"));

gsap.registerPlugin(ScrollTrigger);

const current = portfolio.experience[0];

const About = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(rootRef);

      gsap.fromTo(
        q(".about-tag"),
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: rootRef.current,
            start: "top 62%",
            toggleActions: "play pause resume reverse",
          },
        }
      );

      gsap.fromTo(
        q(".about-chip"),
        { autoAlpha: 0, y: 22, scale: 0.92 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: {
            trigger: q(".about-chips")[0],
            start: "top 78%",
            toggleActions: "play pause resume reverse",
          },
        }
      );

      gsap.fromTo(
        q(".about-visual-card"),
        { autoAlpha: 0, y: 46, rotate: -2 },
        {
          autoAlpha: 1,
          y: 0,
          rotate: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: q(".about-row")[0],
            start: "top 80%",
            toggleActions: "play pause resume reverse",
          },
        }
      );

      gsap.fromTo(
        q(".about-stat"),
        { autoAlpha: 0, y: 30 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.09,
          scrollTrigger: {
            trigger: q(".about-row")[0],
            start: "top 80%",
            toggleActions: "play pause resume reverse",
          },
        }
      );

      // Animated counters.
      q(".about-stat-num").forEach((el) => {
        const target = Number((el as HTMLElement).dataset.value ?? 0);
        const suffix = (el as HTMLElement).dataset.suffix ?? "";
        const state = { value: 0 };
        gsap.to(state, {
          value: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: q(".about-row")[0],
            start: "top 80%",
            toggleActions: "play pause resume reverse",
          },
          onUpdate: () => {
            el.textContent = `${Math.round(state.value)}${suffix}`;
          },
        });
      });

      gsap.fromTo(
        q(".about-current"),
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: q(".about-current")[0],
            start: "top 88%",
            toggleActions: "play pause resume reverse",
          },
        }
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="about-section" id="about" ref={rootRef}>
      <div className="about-me">
        <span className="about-tag">{"// 01 — WHO I AM"}</span>
        <h3 className="title">About Me</h3>
        <p className="para">{portfolio.about}</p>

        <div className="about-chips">
          {portfolio.highlights.map((item) => (
            <span className="about-chip" key={item}>
              {item}
            </span>
          ))}
        </div>

        <div className="about-row">
          <div className="about-visual-card" data-cursor="disable">
            <span className="about-visual-tag">{"// LIVE.CORE"}</span>
            <Suspense fallback={<div className="about-visual-canvas" />}>
              <AboutVisual />
            </Suspense>
            <span className="about-visual-caption">
              FIG. 01 — SIGNAL CORE · MOVE CURSOR
            </span>
          </div>
          <div className="about-stats">
            {portfolio.stats.map((stat) => (
              <div className="about-stat" key={stat.label}>
                <span
                  className="about-stat-num"
                  data-value={stat.value}
                  data-suffix={stat.suffix}
                >
                  0{stat.suffix}
                </span>
                <span className="about-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="about-current">
          <span className="about-current-dot"></span>
          Currently — {current.role} @ {current.company}
        </p>
      </div>
    </div>
  );
};

export default About;
