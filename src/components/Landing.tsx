import "./styles/Landing.css";
import { portfolio } from "../data/portfolio";
import { scrollToSection } from "./utils/smoother";

const Landing = () => {
  const jumpTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToSection(id);
  };

  const years = Math.max(1, new Date().getFullYear() - 2022);
  const projectCount = portfolio.projects.length;
  const toolCount = portfolio.techStack.length;

  return (
    <div className="landing-section" id="landingDiv">
      <div className="landing-backdrop" aria-hidden="true">
        <div className="landing-grid"></div>
        <div className="landing-glow landing-glow-a"></div>
        <div className="landing-glow landing-glow-b"></div>
        <div className="landing-noise"></div>
      </div>

      <div className="landing-container">
        <div className="landing-copy">
          <div className="landing-eyebrow">
            <span className="landing-eyebrow-dot"></span>
            <span className="landing-eyebrow-text">
              Available for work · Cairo, Egypt
            </span>
          </div>

          <div className="landing-intro">
            <h2>Hello, I&apos;m</h2>
            <h1>
              {portfolio.name.first}
              <br />
              <span>{portfolio.name.last}</span>
            </h1>
          </div>

          <div className="landing-info">
            <span className="landing-info-rule" aria-hidden="true"></span>
            {/* Both headings share one grid cell: the masked copy sits behind
                the crisp one so the role text reads as a soft reflection. */}
            <div className="landing-info-stack">
              <h2 className="landing-info-h2">
                <div className="landing-h2-1">{portfolio.roles[0]}</div>
                <div className="landing-h2-2">{portfolio.roles[1]}</div>
              </h2>
              <h2>
                <div className="landing-h2-info">{portfolio.roles[0]}</div>
                <div className="landing-h2-info-1">{portfolio.roles[1]}</div>
              </h2>
            </div>
          </div>

          <p className="landing-tagline">
            I design and ship production Angular applications — bilingual RTL
            portals, design systems and offline-first desktop apps — end to end.
          </p>

          <div className="landing-actions">
            <a
              className="landing-btn landing-btn-primary"
              href="#work"
              onClick={(e) => jumpTo(e, "work")}
            >
              <span>View my work</span>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M5 12h13m0 0-5.5-5.5M18 12l-5.5 5.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
            <a
              className="landing-btn landing-btn-ghost"
              href={portfolio.resumeUrl}
              target="_blank"
              rel="noreferrer"
            >
              <span>Download CV</span>
            </a>
          </div>

          <div className="landing-stats">
            <div className="landing-stat">
              <strong>{years}+</strong>
              <span>Years with Angular</span>
            </div>
            <div className="landing-stat-sep"></div>
            <div className="landing-stat">
              <strong>{projectCount}</strong>
              <span>Featured projects</span>
            </div>
            <div className="landing-stat-sep"></div>
            <div className="landing-stat">
              <strong>{toolCount}+</strong>
              <span>Tools in the stack</span>
            </div>
          </div>
        </div>

        {/* Reserves the right column — the 3D laptop lives in the fixed
            <ScrollLaptop /> layer so it can travel between sections. */}
        <div className="landing-visual" aria-hidden="true">
          <div className="landing-visual-chip landing-visual-chip-a">
            Angular 17–21
          </div>
          <div className="landing-visual-chip landing-visual-chip-b">
            TypeScript · RxJS
          </div>
        </div>
      </div>

      <a
        className="landing-scroll"
        href="#about"
        data-cursor="disable"
        onClick={(e) => jumpTo(e, "about")}
      >
        <span>Scroll</span>
        <i></i>
      </a>
    </div>
  );
};

export default Landing;
