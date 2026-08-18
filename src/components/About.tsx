import "./styles/About.css";
import { portfolio } from "../data/portfolio";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaCode,
  FaCalendarAlt,
} from "react-icons/fa";

const About = () => {
  const years = Math.max(1, new Date().getFullYear() - 2022);

  const facts = [
    {
      icon: <FaMapMarkerAlt />,
      label: "Based in",
      value: "El-Sheikh Zayed, Giza",
    },
    {
      icon: <FaCode />,
      label: "Focus",
      value: "Angular · TypeScript · Design Systems",
    },
    {
      icon: <FaCalendarAlt />,
      label: "Experience",
      value: `${years}+ years building web apps`,
    },
    {
      icon: <FaEnvelope />,
      label: "Email",
      value: portfolio.email,
    },
  ];

  const highlights = [
    "Government platforms",
    "ERP / HR SaaS",
    "Ecommerce",
    "RTL / Arabic-first UIs",
    "Design systems",
    "Offline-first Electron",
  ];

  return (
    <div className="about-section" id="about">
      <div className="about-me">
        <div className="about-main">
          <div className="about-head">
            <h3 className="title">About Me</h3>
            <span className="about-head-rule"></span>
          </div>
          <p className="para">{portfolio.about}</p>

          <div className="about-highlights">
            {highlights.map((item) => (
              <span className="about-highlight" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="about-facts">
          {facts.map((fact) => (
            <div className="about-fact" key={fact.label}>
              <span className="about-fact-icon">{fact.icon}</span>
              <div className="about-fact-body">
                <strong>{fact.label}</strong>
                <span>{fact.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
