import "./styles/About.css";
import { portfolio } from "../data/portfolio";

const About = () => {
  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <h3 className="title">About Me</h3>
        <p className="para">{portfolio.about}</p>
      </div>
    </div>
  );
};

export default About;
