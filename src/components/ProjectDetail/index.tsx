import { useEffect, useState } from "react";
import {
  MdArrowBack,
  MdArrowForward,
  MdCheckCircle,
  MdShare,
  MdEmail,
  MdPhone,
  MdLayers,
  MdSecurity,
  MdCode,
  MdTrendingUp,
} from "react-icons/md";
import { projectsData, ProjectDetailData } from "../../data/projectsData";
import { ProjectMockup } from "./ProjectMockup";
import "./ProjectDetail.css";

interface Props {
  projectSlug: string;
  onClose: () => void;
  onSelectProject: (slug: string) => void;
}

export const ProjectDetail = ({ projectSlug, onClose, onSelectProject }: Props) => {
  const [copied, setCopied] = useState(false);

  const currentIndex = projectsData.findIndex((p) => p.slug === projectSlug);
  const project: ProjectDetailData = projectsData[currentIndex] || projectsData[0];

  const prevProject =
    currentIndex > 0
      ? projectsData[currentIndex - 1]
      : projectsData[projectsData.length - 1];

  const nextProject =
    currentIndex < projectsData.length - 1
      ? projectsData[currentIndex + 1]
      : projectsData[0];

  useEffect(() => {
    // Scroll to top of detail page when opening or switching projects
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Keyboard listener for Escape key to go back
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        onSelectProject(prevProject.slug);
      } else if (e.key === "ArrowRight") {
        onSelectProject(nextProject.slug);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [projectSlug, prevProject.slug, nextProject.slug, onClose, onSelectProject]);

  const handleShare = () => {
    const url = window.location.origin + "/#project-" + project.slug;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="project-detail-overlay">
      {/* Top Fixed Floating Navigation Bar */}
      <nav className="detail-top-nav">
        <button
          className="detail-back-btn"
          onClick={onClose}
          data-cursor="disable"
          title="Back to Portfolio (Esc)"
        >
          <MdArrowBack /> <span>Back to Projects</span>
        </button>

        <div className="detail-breadcrumbs">
          <span>PORTFOLIO</span>
          <span className="crumb-sep">/</span>
          <span>WORK</span>
          <span className="crumb-sep">/</span>
          <strong className="crumb-current">{project.title}</strong>
        </div>

        <div className="detail-nav-actions">
          <button
            className="detail-action-btn share-btn"
            onClick={handleShare}
            data-cursor="disable"
            title="Copy Shareable Link"
          >
            <MdShare /> {copied ? "Copied Link!" : "Share"}
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="detail-container">
        {/* Project Hero Header */}
        <section className="detail-hero">
          <div className="detail-badge-row">
            <span className="detail-num-tag">{project.number}</span>
            <span className="detail-category-pill">{project.category}</span>
            <span className="detail-status-pill">{project.status}</span>
          </div>

          <h1 className="detail-title">{project.title}</h1>
          <p className="detail-subtitle">{project.subtitle}</p>

          {/* Quick Info Grid */}
          <div className="detail-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Client / Organization</span>
              <strong className="meta-value">{project.client}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">My Role</span>
              <strong className="meta-value">{project.role}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">Timeline</span>
              <strong className="meta-value">{project.period}</strong>
            </div>
            <div className="meta-item">
              <span className="meta-label">Domain</span>
              <strong className="meta-value">{project.badge}</strong>
            </div>
          </div>
        </section>

        {/* Visual Mockup & Interactive Showcase */}
        <section className="detail-showcase-section">
          <div className="section-eyebrow">
            <MdCode /> SYSTEM SHOWCASE & ARCHITECTURE
          </div>
          <ProjectMockup project={project} />
        </section>

        {/* Key Measurable Outcomes / Metrics */}
        <section className="detail-metrics-section">
          <div className="section-eyebrow">
            <MdTrendingUp /> KEY OUTCOMES & BENCHMARKS
          </div>
          <div className="metrics-grid">
            {project.metrics.map((metric) => (
              <div className="metric-card" key={metric.label}>
                <span className="metric-value">{metric.value}</span>
                <strong className="metric-label">{metric.label}</strong>
                <p className="metric-desc">{metric.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Overview & Challenge vs Solution */}
        <section className="detail-narrative-section">
          <div className="section-eyebrow">
            <MdLayers /> PROJECT OVERVIEW & ARCHITECTURE STRATEGY
          </div>

          <div className="detail-overview-box">
            <h3>Executive Summary</h3>
            <p>{project.summary}</p>
          </div>

          <div className="challenge-solution-grid">
            <div className="challenge-card">
              <div className="card-header">
                <span className="status-indicator red"></span>
                <h4>The Engineering Challenge</h4>
              </div>
              <p>{project.challenge}</p>
            </div>

            <div className="solution-card">
              <div className="card-header">
                <span className="status-indicator green"></span>
                <h4>The Architectural Solution</h4>
              </div>
              <p>{project.solution}</p>
            </div>
          </div>
        </section>

        {/* System Design & Architecture Pillars */}
        <section className="detail-architecture-section">
          <div className="section-eyebrow">
            <MdSecurity /> SYSTEM DESIGN & TECHNICAL HIGHLIGHTS
          </div>
          <div className="architecture-grid">
            {project.architecture.map((arch, i) => (
              <div className="architecture-card" key={arch.title}>
                <div className="arch-num">0{i + 1}</div>
                <h4>{arch.title}</h4>
                <p>{arch.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Features Breakdown */}
        <section className="detail-features-section">
          <div className="section-eyebrow">
            <MdCheckCircle /> CORE PRODUCTION FEATURES
          </div>
          <div className="features-grid">
            {project.keyFeatures.map((feat) => (
              <div className="feature-item" key={feat.title}>
                <div className="feature-check">
                  <MdCheckCircle />
                </div>
                <div>
                  <h4>{feat.title}</h4>
                  <p>{feat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Matrix */}
        <section className="detail-tech-section">
          <div className="section-eyebrow">
            <MdCode /> TECHNOLOGIES & TOOLING
          </div>
          <div className="tech-pills-wrap">
            {project.techStack.map((tech) => (
              <div
                className="tech-pill-badge"
                key={tech.name}
                style={{
                  borderColor: tech.color,
                  backgroundColor: tech.bg,
                }}
              >
                <span
                  className="tech-dot"
                  style={{ backgroundColor: tech.color }}
                ></span>
                <span className="tech-name">{tech.name}</span>
                <span className="tech-cat">{tech.category}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Key Engineering Highlights */}
        <section className="detail-highlights-section">
          <div className="section-eyebrow">
            <MdLayers /> KEY CONTRIBUTIONS & IMPACT
          </div>
          <ul className="highlights-list">
            {project.highlights.map((h, i) => (
              <li key={i}>
                <span className="highlight-bullet">▸</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Previous & Next Project Navigation */}
        <section className="detail-pagination-section">
          <button
            className="project-nav-card prev-nav"
            onClick={() => onSelectProject(prevProject.slug)}
            data-cursor="disable"
          >
            <div className="nav-dir">
              <MdArrowBack /> Previous Project
            </div>
            <div className="nav-proj-title">{prevProject.title}</div>
            <div className="nav-proj-cat">{prevProject.category}</div>
          </button>

          <button
            className="project-nav-card next-nav"
            onClick={() => onSelectProject(nextProject.slug)}
            data-cursor="disable"
          >
            <div className="nav-dir">
              Next Project <MdArrowForward />
            </div>
            <div className="nav-proj-title">{nextProject.title}</div>
            <div className="nav-proj-cat">{nextProject.category}</div>
          </button>
        </section>

        {/* Contact CTA */}
        <section className="detail-cta-card">
          <div className="cta-content">
            <h3>Interested in discussing this project or building something similar?</h3>
            <p>
              Let's connect to discuss enterprise Angular architecture, Electron
              desktop systems, or reusable design systems.
            </p>
          </div>
          <div className="cta-actions">
            <a
              href="mailto:anasessam211@gmail.com"
              className="cta-btn email-btn"
              data-cursor="disable"
            >
              <MdEmail /> Send Email
            </a>
            <a
              href="tel:+201094201827"
              className="cta-btn phone-btn"
              data-cursor="disable"
            >
              <MdPhone /> Call / WhatsApp
            </a>
            <button
              onClick={onClose}
              className="cta-btn return-btn"
              data-cursor="disable"
            >
              Return to Portfolio
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
