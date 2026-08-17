import "./styles/Landing.css";
import { portfolio } from "../data/portfolio";
import { scrollToSection } from "./utils/smoother";

const Landing = () => {
  const jumpTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollToSection(id);
  };

  return (
    <div className="landing-section" id="landingDiv">
      <div className="landing-backdrop" aria-hidden="true">
        <div className="landing-grid"></div>
        <div className="landing-glow landing-glow-a"></div>
        <div className="landing-glow landing-glow-b"></div>
        <div className="landing-noise"></div>
      </div>

      <div className="landing-container">
        <div className="landing-intro">
          <h2>Hello! I'm</h2>
          <h1>
            {portfolio.name.first}
            <br />
            <span>{portfolio.name.last}</span>
          </h1>
        </div>

        <div className="landing-info">
          <h2 className="landing-info-h2">
            <div className="landing-h2-1">{portfolio.roles[0]}</div>
            <div className="landing-h2-2">{portfolio.roles[1]}</div>
          </h2>
          <h2>
            <div className="landing-h2-info">{portfolio.roles[0]}</div>
            <div className="landing-h2-info-1">{portfolio.roles[1]}</div>
          </h2>
        </div>

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
                strokeWidth="1.8"
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

        <div className="landing-meta">
          <div className="landing-meta-item">
            <span className="landing-meta-dot"></span>
            Available for work
          </div>
          <div className="landing-meta-sep"></div>
          <div className="landing-meta-item">{portfolio.location}</div>
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
    </div>
  );
};

export default Landing;
