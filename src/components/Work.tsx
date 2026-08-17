import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { portfolio } from "../data/portfolio";
import { useProject } from "../context/ProjectContext";
import { MdArrowOutward } from "react-icons/md";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function getTranslateX() {
  const boxes = Array.from(
    document.getElementsByClassName("work-box")
  ) as HTMLElement[];
  const container = document.querySelector(".work-container");
  const flex = document.querySelector(".work-flex");

  if (!boxes.length || !container || !flex) return 0;

  const firstBox = boxes[0];
  const rectLeft = container.getBoundingClientRect().left;
  const parentWidth = flex.getBoundingClientRect().width;
  const padding =
    parseInt(window.getComputedStyle(firstBox).padding, 10) / 2 || 0;
  const totalBoxesWidth = boxes.reduce(
    (sum, box) => sum + box.getBoundingClientRect().width,
    0
  );

  return Math.max(totalBoxesWidth - (rectLeft + parentWidth) + padding, 0);
}

/** Kill triggers and fully unwrap nested pin-spacers (StrictMode/HMR leftovers). */
function resetWorkPin() {
  ScrollTrigger.getAll().forEach((st) => {
    const id = st.vars.id;
    const trigger = st.trigger as HTMLElement | null;
    if (id === "work" || trigger?.classList?.contains("work-section")) {
      st.kill(true);
    }
  });

  const work = document.querySelector(".work-section") as HTMLElement | null;
  if (!work) return;

  while (work.parentElement?.classList.contains("pin-spacer")) {
    const spacer = work.parentElement;
    spacer.parentElement?.insertBefore(work, spacer);
    spacer.remove();
  }

  document.querySelectorAll(".pin-spacer-work").forEach((spacer) => {
    if (!spacer.contains(work)) spacer.remove();
  });

  gsap.set(work, { clearProps: "transform,position,top,left,width,height,zIndex" });
  gsap.set(".work-flex", { clearProps: "transform" });
}

const Work = () => {
  const { openProject } = useProject();

  useGSAP(() => {
    let timeline: gsap.core.Timeline | null = null;

    const setup = () => {
      resetWorkPin();

      const translateX = getTranslateX();
      if (translateX <= 0) return null;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".work-section",
          start: "top top",
          end: `+=${translateX}`,
          scrub: true,
          pin: true,
          pinSpacing: true,
          id: "work",
        },
      });

      tl.to(".work-flex", {
        x: -translateX,
        ease: "none",
      });

      return tl;
    };

    // Single delayed setup — avoids nested pin-spacers from setup+rebuild / StrictMode
    const setupId = window.setTimeout(() => {
      timeline = setup();
      ScrollTrigger.refresh();
    }, 500);

    return () => {
      clearTimeout(setupId);
      timeline?.kill();
      resetWorkPin();
    };
  }, []);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {portfolio.projects.map((project, index) => (
            <div className="work-box" key={project.title}>
              <div className="work-info">
                <div className="work-title">
                  <h3>0{index + 1}</h3>

                  <div
                    style={{ cursor: "pointer" }}
                    onClick={() => openProject(project.slug)}
                  >
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>

                {/* Dedicated Case Study / Details Button */}
                <button
                  type="button"
                  className="work-explore-btn"
                  onClick={() => openProject(project.slug)}
                  data-cursor="disable"
                >
                  <span>View Project Details</span>
                  <MdArrowOutward />
                </button>
              </div>
              <WorkImage
                image={project.image}
                alt={project.title}
                link={project.link}
                onOpen={() => openProject(project.slug)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
