import {
  lazy,
  PropsWithChildren,
  Suspense,
  type MouseEvent,
} from "react";
import {
  MdArrowDownward,
  MdArrowOutward,
  MdOutlineLocationOn,
} from "react-icons/md";
import "./styles/Landing.css";
import { portfolio } from "../data/portfolio";
import { smoother } from "./Navbar";

// Code-split the 3D backdrop so three.js stays out of the eager bundle.
const HeroOrbits = lazy(() => import("./HeroOrbits"));

const Landing = ({ children }: PropsWithChildren) => {
  const goToWork = (e: MouseEvent<HTMLAnchorElement>) => {
    if (window.innerWidth > 1024 && smoother) {
      e.preventDefault();
      smoother.scrollTo("#work", true, "top top");
    }
  };

  return (
    <>
      <div className="landing-section" id="landingDiv">
        <Suspense fallback={null}>
          <HeroOrbits />
        </Suspense>
        <div className="landing-container">
          <div className="landing-intro">
            <div className="landing-badge">
              <span className="landing-badge-dot"></span>
              {portfolio.availability}
            </div>
            <h2>Hello! I'm</h2>
            <h1>
              {portfolio.name.first}
              <br />
              <span>{portfolio.name.last}</span>
            </h1>
            <div className="landing-cta-row">
              <a
                href="#work"
                className="landing-cta landing-cta-primary"
                data-cursor="disable"
                onClick={goToWork}
              >
                View My Work
                <MdArrowDownward />
              </a>
              <a
                href={portfolio.resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="landing-cta landing-cta-ghost"
                data-cursor="disable"
              >
                Download CV
                <MdArrowOutward />
              </a>
            </div>
            <div className="landing-meta">
              <MdOutlineLocationOn />
              <span>{portfolio.location}</span>
            </div>
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
        </div>
        <div className="landing-scroll-hint" aria-hidden="true">
          <span className="landing-scroll-line">
            <span className="landing-scroll-dot"></span>
          </span>
          SCROLL
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
