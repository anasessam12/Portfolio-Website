import { useEffect, useRef, useState, type MouseEvent } from "react";
import "./styles/WhatIDo.css";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { portfolio } from "../data/portfolio";

const WhatIDo = () => {
  const containerRef = useRef<(HTMLDivElement | null)[]>([]);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const setRef = (el: HTMLDivElement | null, index: number) => {
    containerRef.current[index] = el;
  };

  useEffect(() => {
    if (ScrollTrigger.isTouch) {
      containerRef.current.forEach((container) => {
        if (container) {
          container.classList.remove("what-noTouch");
          container.addEventListener("click", () => handleClick(container));
        }
      });
    }
    return () => {
      containerRef.current.forEach((container) => {
        if (container) {
          container.removeEventListener("click", () => handleClick(container));
        }
      });
    };
  }, []);

  const toggleSeeMore = (
    index: number,
    event: MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    setExpanded((prev) => {
      const nextOpen = !prev[index];
      const container = containerRef.current[index];
      if (container) {
        if (nextOpen) {
          container.classList.add("what-content-active");
          container.classList.remove("what-sibling");
          container.parentElement
            ?.querySelectorAll(".what-content")
            .forEach((sibling) => {
              if (sibling !== container) {
                sibling.classList.remove("what-content-active");
                sibling.classList.add("what-sibling");
              }
            });
        } else {
          container.classList.remove("what-content-active");
          container.parentElement
            ?.querySelectorAll(".what-content")
            .forEach((sibling) => sibling.classList.remove("what-sibling"));
        }
      }
      return { ...prev, [index]: nextOpen };
    });
  };

  return (
    <div className="whatIDO">
      <div className="what-box">
        <h2 className="title">
          W<span className="hat-h2">HAT</span>
          <div>
            I<span className="do-h2"> DO</span>
          </div>
        </h2>
      </div>
      <div className="what-box">
        <div className="what-box-in">
          <div className="what-border2">
            <svg width="100%">
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
              <line
                x1="100%"
                y1="0"
                x2="100%"
                y2="100%"
                stroke="white"
                strokeWidth="2"
                strokeDasharray="7,7"
              />
            </svg>
          </div>
          {portfolio.whatIDo.map((item, index) => (
            <div
              className="what-content what-noTouch"
              ref={(el) => setRef(el, index)}
              key={item.title}
            >
              <div className="what-border1">
                <svg height="100%">
                  {index === 0 ? (
                    <>
                      <line
                        x1="0"
                        y1="0"
                        x2="100%"
                        y2="0"
                        stroke="white"
                        strokeWidth="2"
                        strokeDasharray="6,6"
                      />
                      <line
                        x1="0"
                        y1="100%"
                        x2="100%"
                        y2="100%"
                        stroke="white"
                        strokeWidth="2"
                        strokeDasharray="6,6"
                      />
                    </>
                  ) : (
                    <line
                      x1="0"
                      y1="100%"
                      x2="100%"
                      y2="100%"
                      stroke="white"
                      strokeWidth="2"
                      strokeDasharray="6,6"
                    />
                  )}
                </svg>
              </div>
              <div className="what-corner"></div>
              <div
                className={`what-content-in ${
                  expanded[index] ? "what-content-in-expanded" : ""
                }`}
              >
                <h3>{item.title}</h3>
                <h4>{item.subtitle}</h4>
                <p>
                  {expanded[index] ? item.description : item.shortDescription}
                </p>
                <button
                  type="button"
                  className="what-see-more"
                  data-cursor="disable"
                  onClick={(event) => toggleSeeMore(index, event)}
                >
                  {expanded[index] ? "See less" : "See more"}
                </button>
                <h5>Skillset & tools</h5>
                <div className="what-content-flex">
                  {item.skills.map((skill) => (
                    <div className="what-tags" key={skill}>
                      {skill}
                    </div>
                  ))}
                </div>
                <div className="what-arrow"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WhatIDo;

function handleClick(container: HTMLDivElement) {
  container.classList.toggle("what-content-active");
  container.classList.remove("what-sibling");
  if (container.parentElement) {
    const siblings = Array.from(container.parentElement.children);

    siblings.forEach((sibling) => {
      if (sibling !== container) {
        sibling.classList.remove("what-content-active");
        sibling.classList.toggle("what-sibling");
      }
    });
  }
}
