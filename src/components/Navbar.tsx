import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap-trial/ScrollSmoother";
import "./styles/Navbar.css";
import { portfolio } from "../data/portfolio";
import { scrollToSection, scrollToTop, setSmoother } from "./utils/smoother";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);
export let smoother: ScrollSmoother;

type NavLink = {
  id: string;
  label: string;
};

const NAV_LINKS: NavLink[] = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "career", label: "Career" },
  { id: "work", label: "Work" },
  { id: "contact", label: "Contact" },
];

const Navbar = () => {
  const [activeId, setActiveId] = useState<string>("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, show: false });

  const listRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});

  /* ---------------------------------------------------------------- smoother */
  useEffect(() => {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });
    setSmoother(smoother);

    smoother.scrollTop(0);
    // Keep the page locked until the intro animation releases it — unless the
    // intro already ran (e.g. a hot reload), in which case stay unlocked.
    const introDone = document
      .querySelector("main")
      ?.classList.contains("main-active");
    smoother.paused(!introDone);

    const onResize = () => ScrollSmoother.refresh(true);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* -------------------------------------------- scroll state + active section */
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      setIsScrolled(window.scrollY > 40);

      // The last section whose top has crossed ~40% of the viewport wins.
      const line = window.innerHeight * 0.4;
      let current = "";
      for (const link of NAV_LINKS) {
        const el = document.getElementById(link.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= line) current = link.id;
      }

      // At the very bottom of the page always light up the last section.
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 8;
      if (atBottom) current = NAV_LINKS[NAV_LINKS.length - 1].id;

      setActiveId(current);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* ------------------------------------------------------- sliding indicator */
  useEffect(() => {
    const move = () => {
      const list = listRef.current;
      const item = activeId ? itemRefs.current[activeId] : null;
      if (!list || !item) {
        setIndicator((prev) => ({ ...prev, show: false }));
        return;
      }
      setIndicator({
        left: item.offsetLeft,
        width: item.offsetWidth,
        show: true,
      });
    };

    move();
    window.addEventListener("resize", move);
    return () => window.removeEventListener("resize", move);
  }, [activeId]);

  /* ------------------------------------------------------------- menu locking */
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMenuOpen]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    setIsMenuOpen(false);
    // Let the overlay finish closing before the smooth scroll kicks in.
    window.setTimeout(() => scrollToSection(id), isMenuOpen ? 320 : 0);
  };

  const handleBrandClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsMenuOpen(false);
    scrollToTop();
  };

  return (
    <>
      <header
        className={`header ${isScrolled ? "header-scrolled" : ""} ${
          isMenuOpen ? "header-menu-open" : ""
        }`}
      >
        <nav className="nav-pill" aria-label="Primary">
          <a
            href="/#"
            className="navbar-title"
            data-cursor="disable"
            onClick={handleBrandClick}
          >
            <span className="navbar-title-mark">{portfolio.brand}</span>
            <span className="navbar-title-dot"></span>
          </a>

          <ul className="nav-links" ref={listRef}>
            <li
              className="nav-indicator"
              aria-hidden="true"
              style={{
                transform: `translateX(${indicator.left}px)`,
                width: `${indicator.width}px`,
                opacity: indicator.show ? 1 : 0,
              }}
            />
            {NAV_LINKS.map((link) => (
              <li
                key={link.id}
                ref={(el) => {
                  itemRefs.current[link.id] = el;
                }}
                className={activeId === link.id ? "nav-item-active" : ""}
              >
                <a
                  href={`#${link.id}`}
                  data-href={`#${link.id}`}
                  onClick={(e) => handleNavClick(e, link.id)}
                >
                  <HoverLinks text={link.label.toUpperCase()} />
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            <a
              href={`mailto:${portfolio.email}`}
              className="navbar-connect"
              data-cursor="disable"
            >
              <span className="navbar-connect-dot"></span>
              Let&apos;s talk
            </a>

            <button
              type="button"
              className={`nav-burger ${isMenuOpen ? "nav-burger-open" : ""}`}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span></span>
              <span></span>
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`nav-overlay ${isMenuOpen ? "nav-overlay-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isMenuOpen}
      >
        <ul className="nav-overlay-links">
          {NAV_LINKS.map((link, index) => (
            <li key={link.id} style={{ transitionDelay: `${0.06 * index}s` }}>
              <a
                href={`#${link.id}`}
                onClick={(e) => handleNavClick(e, link.id)}
                className={activeId === link.id ? "nav-overlay-active" : ""}
              >
                <em>{String(index + 1).padStart(2, "0")}</em>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="nav-overlay-footer">
          <a href={`mailto:${portfolio.email}`}>{portfolio.email}</a>
          <div className="nav-overlay-social">
            <a href={portfolio.social.github} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a
              href={portfolio.social.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a href={portfolio.resumeUrl} target="_blank" rel="noreferrer">
              Resume
            </a>
          </div>
        </div>
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
