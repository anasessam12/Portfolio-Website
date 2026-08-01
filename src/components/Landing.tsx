import { PropsWithChildren } from "react";
import "./styles/Landing.css";
import { portfolio } from "../data/portfolio";

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
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
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
