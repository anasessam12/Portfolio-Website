import { useState } from "react";
import {
  MdShield,
  MdCheckCircle,
  MdWifiOff,
  MdComputer,
  MdFolder,
  MdSearch,
  MdShoppingCart,
  MdTerminal,
  MdCode,
} from "react-icons/md";
import { ProjectDetailData } from "../../data/projectsData";

interface Props {
  project: ProjectDetailData;
}

export const ProjectMockup = ({ project }: Props) => {
  const [activeTab, setActiveTab] = useState<"ui" | "architecture" | "code">("ui");

  return (
    <div className="project-mockup-wrapper">
      {/* Device Frame Bar */}
      <div className="mockup-window-header">
        <div className="mockup-dots">
          <span className="dot red"></span>
          <span className="dot yellow"></span>
          <span className="dot green"></span>
        </div>

        <div className="mockup-url-bar">
          <span className="mockup-protocol">https://</span>
          <span className="mockup-domain">
            {project.slug}.cloud4rain.gov.eg
          </span>
          <span className="mockup-badge">{project.badge}</span>
        </div>

        <div className="mockup-tabs">
          <button
            className={`mockup-tab-btn ${activeTab === "ui" ? "active" : ""}`}
            onClick={() => setActiveTab("ui")}
          >
            <MdComputer /> Preview
          </button>
          <button
            className={`mockup-tab-btn ${activeTab === "code" ? "active" : ""}`}
            onClick={() => setActiveTab("code")}
          >
            <MdCode /> Architecture Code
          </button>
        </div>
      </div>

      {/* Mockup Canvas Screen */}
      <div className="mockup-screen-container">
        {activeTab === "ui" && (
          <div className="mockup-ui-view">
            {project.mockupType === "electron" && <ElectronKioskMockup />}
            {project.mockupType === "portal" && <GovernmentPortalMockup />}
            {project.mockupType === "library" && <LibraryPublishMockup />}
            {project.mockupType === "storybook" && <StorybookMockup />}
            {project.mockupType === "saas" && <SaasAttendanceMockup />}
            {project.mockupType === "ecommerce" && <EcommerceMockup />}
          </div>
        )}

        {activeTab === "code" && project.codeSnippet && (
          <div className="mockup-code-view">
            <div className="code-view-header">
              <span className="code-file-name">
                <MdTerminal /> {project.codeSnippet.filename}
              </span>
              <span className="code-badge">Angular 21 • TypeScript</span>
            </div>
            <pre className="code-block">
              <code>{project.codeSnippet.code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

/* --- 1. Electron Kiosk Mockup --- */
const ElectronKioskMockup = () => {
  return (
    <div className="kiosk-mockup">
      <div className="kiosk-top-banner">
        <div className="kiosk-brand">
          <MdShield className="brand-icon" />
          <div>
            <span className="kiosk-title">Administrative Prosecution Authority</span>
            <span className="kiosk-sub">Official Election Kiosk Engine • v21.4</span>
          </div>
        </div>
        <div className="kiosk-status">
          <span className="status-pill offline">
            <MdWifiOff /> Offline-First Active
          </span>
          <span className="status-pill secure">
            <MdCheckCircle /> AES-256 Ledger Locked
          </span>
        </div>
      </div>

      <div className="kiosk-grid">
        <div className="kiosk-card active-station">
          <div className="station-header">
            <h4>Polling Station #042</h4>
            <span className="live-dot"></span>
          </div>
          <div className="ballot-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: "78%" }}></div>
            </div>
            <div className="progress-labels">
              <span>Verified Ballots: 1,482</span>
              <span>Queued for Sync: 0</span>
            </div>
          </div>
          <div className="kiosk-action-row">
            <button className="kiosk-btn primary">Cast Ballot (Touch)</button>
            <button className="kiosk-btn secondary">Hardware Diagnostic</button>
          </div>
        </div>

        <div className="kiosk-side-panel">
          <h5>Hardware Status</h5>
          <ul className="hw-list">
            <li>
              <span>Thermal Receipt Printer:</span> <strong className="green">ONLINE (USB #1)</strong>
            </li>
            <li>
              <span>Smartcard / NFC Scanner:</span> <strong className="green">READY (COM3)</strong>
            </li>
            <li>
              <span>Local SQLite Database:</span> <strong className="purple">ENCRYPTED & SYNCED</strong>
            </li>
            <li>
              <span>Response Latency:</span> <strong className="blue">12ms</strong>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

/* --- 2. Government Platform Mockup --- */
const GovernmentPortalMockup = () => {
  return (
    <div className="portal-mockup">
      <div className="portal-navbar">
        <div className="portal-logo">
          <span className="logo-badge">APA</span>
          <span>Judicial Electronic Portal</span>
        </div>
        <div className="portal-nav-links">
          <span className="active">Citizen Inquiries</span>
          <span>Case Files</span>
          <span>Judicial Hearings</span>
          <span>SSO Admin</span>
        </div>
      </div>

      <div className="portal-content">
        <div className="portal-stat-grid">
          <div className="p-stat-card">
            <span>Daily Applications</span>
            <h3>1,240</h3>
            <small className="green">+14% vs yesterday</small>
          </div>
          <div className="p-stat-card">
            <span>Active Judicial Sessions</span>
            <h3>18</h3>
            <small className="blue">SignalR Live Stream</small>
          </div>
          <div className="p-stat-card">
            <span>Average Processing</span>
            <h3>1.2 Days</h3>
            <small className="purple">-40% faster</small>
          </div>
        </div>

        <div className="portal-table-preview">
          <div className="table-header">
            <span>Recent Legal Requests</span>
            <span className="filter-pill">Filter: All Departments</span>
          </div>
          <div className="table-rows">
            <div className="t-row">
              <span className="row-id">#CASE-2025-9812</span>
              <span>Administrative Dispute</span>
              <span className="badge-status in-progress">Under Review</span>
              <span className="row-time">Just now</span>
            </div>
            <div className="t-row">
              <span className="row-id">#CASE-2025-9809</span>
              <span>Citizen Grievance</span>
              <span className="badge-status resolved">Approved</span>
              <span className="row-time">12 mins ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- 3. Library Publish Mockup --- */
const LibraryPublishMockup = () => {
  return (
    <div className="library-mockup">
      <div className="lib-header">
        <div className="lib-npm-badge">
          <span className="npm-tag">npm</span>
          <code>@cloud4rain/staff-affairs@2.1.0</code>
        </div>
        <span className="lib-downloads">4 Enterprise Consumers • 100% Tree Shakeable</span>
      </div>

      <div className="lib-tree-view">
        <div className="tree-col">
          <h5><MdFolder /> Exported Secondary Entry Points</h5>
          <ul className="entry-points">
            <li><code>import &#123; PayrollModule &#125; from '@cloud4rain/staff/payroll'</code></li>
            <li><code>import &#123; HierarchyTree &#125; from '@cloud4rain/staff/org'</code></li>
            <li><code>import &#123; ElectionState &#125; from '@cloud4rain/staff/elections'</code></li>
            <li><code>import &#123; HasRoleDirective &#125; from '@cloud4rain/staff/auth'</code></li>
          </ul>
        </div>
        <div className="tree-col">
          <h5><MdTerminal /> Automated CI/CD Pipeline</h5>
          <div className="ci-steps">
            <div className="ci-step done"><span>✔</span> ng-packagr build (FESM2022 + d.ts)</div>
            <div className="ci-step done"><span>✔</span> Jest Unit Tests (142 passed)</div>
            <div className="ci-step done"><span>✔</span> Semver Auto-Bump (v2.1.0)</div>
            <div className="ci-step done"><span>✔</span> Published to Private Registry</div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- 4. Storybook Mockup --- */
const StorybookMockup = () => {
  return (
    <div className="storybook-mockup">
      <div className="sb-sidebar">
        <div className="sb-brand">
          <span className="sb-logo">◈</span>
          <strong>C4R Design System</strong>
        </div>
        <div className="sb-nav-section">
          <span className="sb-section-title">COMPONENTS</span>
          <ul>
            <li className="active">Button (Signal-driven)</li>
            <li>Data Table (Virtual Scroll)</li>
            <li>Date Picker (Hijri/Gregorian)</li>
            <li>Modal & Dialog</li>
            <li>Toast & Alerts</li>
          </ul>
        </div>
      </div>

      <div className="sb-canvas">
        <div className="sb-toolbar">
          <span>Canvas</span>
          <div className="sb-tools">
            <span className="sb-tool active">Dark Cyber</span>
            <span className="sb-tool">Light Enterprise</span>
            <span className="sb-tool">RTL Mirror</span>
            <span className="sb-tool a11y">a11y: 0 Violations (WCAG AAA)</span>
          </div>
        </div>
        <div className="sb-preview-area">
          <div className="sb-component-demo">
            <button className="demo-btn primary">Primary Action</button>
            <button className="demo-btn secondary">Secondary Outline</button>
            <button className="demo-btn cyber">Glowing Accent</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- 5. SaaS Attendance Mockup --- */
const SaasAttendanceMockup = () => {
  return (
    <div className="saas-mockup">
      <div className="saas-header">
        <div className="saas-title">
          <h4>Cloud4Rain Workforce & Time Attendance</h4>
          <span>Realtime Biometric Ingestion • 15,280 Daily Punches</span>
        </div>
        <div className="saas-export">
          <button className="saas-btn">Export PDF / Excel (Web Worker)</button>
        </div>
      </div>

      <div className="saas-heatmap-row">
        <div className="heatmap-box">
          <span className="hm-label">On-Time Attendance</span>
          <span className="hm-val green">94.2%</span>
        </div>
        <div className="heatmap-box">
          <span className="hm-label">Late Check-ins</span>
          <span className="hm-val yellow">4.1%</span>
        </div>
        <div className="heatmap-box">
          <span className="hm-label">Absences / Leaves</span>
          <span className="hm-val purple">1.7%</span>
        </div>
        <div className="heatmap-box">
          <span className="hm-label">Overtime Hours</span>
          <span className="hm-val blue">342 hrs</span>
        </div>
      </div>

      <div className="saas-roster">
        <div className="roster-head">
          <span>Employee</span>
          <span>Department</span>
          <span>First In</span>
          <span>Status</span>
        </div>
        <div className="roster-row">
          <span>Eng. Tarek Mansour</span>
          <span>Frontend Engineering</span>
          <span>08:45 AM</span>
          <span className="status-pill ontime">On Time</span>
        </div>
        <div className="roster-row">
          <span>Sarah Ibrahim</span>
          <span>Quality Assurance</span>
          <span>08:52 AM</span>
          <span className="status-pill ontime">On Time</span>
        </div>
      </div>
    </div>
  );
};

/* --- 6. Ecommerce Mockup --- */
const EcommerceMockup = () => {
  return (
    <div className="ecom-mockup">
      <div className="ecom-search-bar">
        <div className="search-input">
          <MdSearch />
          <span>Search 20,000+ verified vehicle listings & spare parts...</span>
        </div>
        <div className="cart-badge">
          <MdShoppingCart />
          <span>Cart (3)</span>
        </div>
      </div>

      <div className="ecom-layout">
        <div className="ecom-filters">
          <h6>Faceted Filters</h6>
          <div className="filter-group">
            <label>Make & Model</label>
            <span className="filter-val">Mercedes-Benz C200 (Selected)</span>
          </div>
          <div className="filter-group">
            <label>Price Range</label>
            <span className="filter-val">EGP 1.2M - 2.5M</span>
          </div>
        </div>

        <div className="ecom-cards">
          <div className="ecom-card">
            <div className="ecom-img-placeholder">
              <span>HD Vehicle Gallery</span>
            </div>
            <div className="ecom-card-info">
              <h5>Mercedes-Benz C200 AMG 2024</h5>
              <p className="price">EGP 2,450,000</p>
              <button className="ecom-btn">View Details & Financing</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
