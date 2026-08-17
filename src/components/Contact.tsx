import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";
import { portfolio } from "../data/portfolio";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Contact</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href={`mailto:${portfolio.email}`} data-cursor="disable">
                {portfolio.email}
              </a>
            </p>
            <h4>Phone</h4>
            <p>
              <a href={`tel:${portfolio.phoneHref}`} data-cursor="disable">
                {portfolio.phone}
              </a>
            </p>
          </div>
          <div className="contact-box">
            <h4>Social</h4>
            <a
              href={portfolio.social.github}
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Github <MdArrowOutward />
            </a>
            <a
              href={portfolio.social.linkedin}
              target="_blank"
              rel="noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Linkedin <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Designed and Developed <br /> by{" "}
              <span>{portfolio.name.full}</span>
            </h2>
            <h5>
              <MdCopyright /> {portfolio.copyrightYear}
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
