export interface ProjectArchitecture {
  title: string;
  description: string;
  icon: string;
}

export interface ProjectFeature {
  title: string;
  description: string;
}

export interface ProjectMetric {
  label: string;
  value: string;
  desc: string;
}

export interface ProjectTech {
  name: string;
  category: string;
  color: string;
  bg: string;
}

export interface ProjectDetailData {
  id: string;
  slug: string;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  period: string;
  client: string;
  role: string;
  status: string;
  liveUrl?: string;
  githubUrl?: string;
  toolsSummary: string;
  summary: string;
  challenge: string;
  solution: string;
  mockupType: "electron" | "portal" | "library" | "storybook" | "saas" | "ecommerce";
  techStack: ProjectTech[];
  architecture: ProjectArchitecture[];
  keyFeatures: ProjectFeature[];
  metrics: ProjectMetric[];
  highlights: string[];
  codeSnippet?: {
    filename: string;
    language: string;
    code: string;
  };
}

export const projectsData: ProjectDetailData[] = [
  {
    id: "apa-voting-desktop",
    slug: "apa-voting-desktop",
    number: "01",
    title: "APA Voting Desktop",
    subtitle: "Offline-First Government Election Kiosk",
    category: "Electron · Government · Security",
    badge: "Government Enterprise",
    period: "Dec 2024 – 2025",
    client: "Administrative Prosecution Authority (APA) / Cloud4Rain",
    role: "Lead Frontend Engineer & Desktop Architect",
    status: "In Production",
    toolsSummary: "Angular 21, Nx, Electron 41, Vitest, Playwright, SQLite, AES-256",
    summary:
      "A high-security, offline-first desktop voting system designed for nationwide elections within Egyptian government administrative authorities. Built to guarantee zero ballot loss in isolated environments with cryptographic audit logs and automatic queued sync upon network restoration.",
    challenge:
      "Government election centers frequently operate in venues with unpredictable or prohibited internet connectivity. Cloud-dependent solutions were unacceptable due to legal compliance. The system required guaranteed data persistence, hardware device integration (biometrics and thermal receipt printers), and sub-50ms touchscreen responsiveness with zero latency.",
    solution:
      "Architected an Angular 21 standalone application enclosed in Electron 41 within an Nx monorepo. Leveraged modern Angular Signals for blazing UI performance, sandboxed IPC channels with context isolation for hardware communication, and an encrypted local SQLite database ledger with idempotent batch sync protocols.",
    mockupType: "electron",
    techStack: [
      { name: "Angular 21", category: "Core Framework", color: "#dd0031", bg: "rgba(221,0,49,0.15)" },
      { name: "Electron 41", category: "Desktop Shell", color: "#9feaf9", bg: "rgba(159,234,249,0.15)" },
      { name: "Nx Monorepo", category: "Build & Tooling", color: "#38bdf8", bg: "rgba(56,189,248,0.15)" },
      { name: "TypeScript", category: "Language", color: "#3178c6", bg: "rgba(49,120,198,0.15)" },
      { name: "SQLite (AES-256)", category: "Local Database", color: "#00f0ff", bg: "rgba(0,240,255,0.15)" },
      { name: "Vitest & Playwright", category: "Testing", color: "#4ade80", bg: "rgba(74,222,128,0.15)" },
      { name: "Tailwind CSS", category: "Styling", color: "#38bdf8", bg: "rgba(56,189,248,0.15)" },
      { name: "RxJS", category: "Reactive Streams", color: "#b7178c", bg: "rgba(183,23,140,0.15)" },
    ],
    architecture: [
      {
        title: "Secure IPC & Sandboxed Context",
        description:
          "Strict isolation between Electron's Node.js main process and the Angular renderer via typed IPC bridges, preventing any unauthorized shell access.",
        icon: "ShieldCheck",
      },
      {
        title: "Offline Transaction Ledger",
        description:
          "Ballots are hashed with SHA-256, encrypted with AES-256, and appended to an append-only local SQLite ledger with transaction rollback protection.",
        icon: "Database",
      },
      {
        title: "Idempotent Sync Engine",
        description:
          "Automatic background sync queue that detects upstream server availability, batches encrypted records, and confirms receipt via cryptographic hashes.",
        icon: "RefreshCw",
      },
      {
        title: "Hardware Peripheral Bridge",
        description:
          "Serial port and USB drivers for thermal ballot printers, barcode/NFC badge scanners, and biometric verification readers.",
        icon: "Cpu",
      },
    ],
    keyFeatures: [
      {
        title: "100% Offline Operational Mode",
        description:
          "Complete voting lifecycle executes without requiring an active internet connection, storing verified ballots in encrypted storage.",
      },
      {
        title: "Bilingual High-Contrast Arabic RTL UI",
        description:
          "Accessible, touch-friendly UI specifically engineered for large touchscreen kiosk displays with Arabic RTL primary alignment.",
      },
      {
        title: "Biometric & NFC Voter Authentication",
        description:
          "Instant identification of voters through smart card NFC scanning and biometric verification with real-time feedback.",
      },
      {
        title: "Automated End-to-End Simulation Tests",
        description:
          "Over 100+ automated Playwright scenarios simulating heavy polling traffic, network disconnects, and power interruption recovery.",
      },
    ],
    metrics: [
      { label: "Election Uptime", value: "100%", desc: "Zero downtime or crashes across all deployed polling stations." },
      { label: "Data Integrity", value: "0 Loss", desc: "Zero corrupted, duplicated, or lost ballot records." },
      { label: "Touch Latency", value: "< 45ms", desc: "Sub-50 millisecond UI response on touchscreen voting kiosks." },
      { label: "Test Coverage", value: "96%", desc: "Vitest unit tests & Playwright end-to-end automated test suites." },
    ],
    highlights: [
      "Sole developer leading frontend and desktop architecture for the official voting system",
      "Seamless offline sync engine with exponential backoff and idempotency keys",
      "Native Arabic RTL layout with WCAG 2.1 AAA contrast ratios for high visibility",
      "Automated CI build pipelines packaging universal Windows installers (.exe / .msi)",
    ],
    codeSnippet: {
      filename: "offline-sync.engine.ts",
      language: "typescript",
      code: `// Secure Queued Sync Engine with Idempotency Tokens
@Injectable({ providedIn: 'root' })
export class OfflineSyncEngine {
  private readonly db = inject(EncryptedLedgerService);
  private readonly api = inject(GovElectionApiService);
  private readonly syncState = signal<SyncState>({ status: 'idle', pendingCount: 0 });

  readonly isSyncing = computed(() => this.syncState().status === 'syncing');

  async queueBallotRecord(ballot: EncryptedBallot): Promise<string> {
    const recordId = crypto.randomUUID();
    const payload: LedgerRecord = {
      id: recordId,
      encryptedData: ballot.payload,
      hash: await this.computeSha256(ballot.payload),
      timestamp: Date.now(),
      status: 'pending'
    };

    await this.db.insertLedgerEntry(payload);
    this.updatePendingCount();
    this.triggerSync();
    return recordId;
  }

  private async triggerSync(): Promise<void> {
    if (this.isSyncing() || !navigator.onLine) return;
    this.syncState.update(s => ({ ...s, status: 'syncing' }));

    const batch = await this.db.getPendingEntries(50);
    for (const entry of batch) {
      try {
        await this.api.transmitRecordWithChecksum(entry);
        await this.db.markEntrySynced(entry.id);
      } catch (err) {
        console.warn('Sync backoff activated:', err);
        break;
      }
    }
    this.syncState.update(s => ({ ...s, status: 'idle' }));
  }
}`,
    },
  },
  {
    id: "apa-government-platform",
    slug: "apa-government-platform",
    number: "02",
    title: "APA Government Platform",
    subtitle: "Enterprise Citizen & Administrative Portal",
    category: "Admin · Client · SSO · Realtime",
    badge: "Government Flagship",
    period: "Dec 2024 – Present",
    client: "Cloud4Rain & Administrative Prosecution Authority",
    role: "Sole Frontend Developer & System Architect",
    status: "Active / In Production",
    toolsSummary: "Angular 17/18, NgRx, SignalR, TanStack Query, SSR, PrimeNG, Tailwind",
    summary:
      "The flagship digital transformation portal for the Administrative Prosecution Authority. Provides citizen legal service requests, internal judicial administrative case flows, unified Single Sign-On (SSO), and live real-time audit logging across government departments.",
    challenge:
      "Replacing legacy manual paperwork with a modern bilingual digital platform supporting over 80+ dynamic legal forms, complex approval matrices across 12 distinct judicial ranks, real-time push alerts, and strict server-side rendering for speed and SEO.",
    solution:
      "Built a modular multi-tier enterprise portal using Angular 17/18 with Angular SSR (Server-Side Rendering) for sub-second page loads. Implemented NgRx Store for stateful judicial workflows, TanStack Query for optimistic caching, ASP.NET Core SignalR WebSockets for live notifications, and a dynamic JSON-driven form builder.",
    mockupType: "portal",
    techStack: [
      { name: "Angular 17/18", category: "Frontend Framework", color: "#dd0031", bg: "rgba(221,0,49,0.15)" },
      { name: "Angular SSR", category: "Rendering", color: "#c2a4ff", bg: "rgba(194,164,255,0.15)" },
      { name: "NgRx Store", category: "State Management", color: "#ba2bd2", bg: "rgba(186,43,210,0.15)" },
      { name: "SignalR", category: "WebSockets", color: "#512bd4", bg: "rgba(81,43,212,0.15)" },
      { name: "TanStack Query", category: "Data Caching", color: "#ff4154", bg: "rgba(255,65,84,0.15)" },
      { name: "PrimeNG", category: "UI Suite", color: "#38bdf8", bg: "rgba(56,189,248,0.15)" },
      { name: "OAuth2 / OIDC", category: "Authentication", color: "#facc15", bg: "rgba(250,204,21,0.15)" },
      { name: "TypeScript", category: "Language", color: "#3178c6", bg: "rgba(49,120,198,0.15)" },
    ],
    architecture: [
      {
        title: "Enterprise SSO & RBAC Matrix",
        description:
          "Centralized OAuth2 / OpenID Connect Single Sign-On with 12-tier granular Role-Based Access Control and dynamic route guards.",
        icon: "Lock",
      },
      {
        title: "Dynamic JSON Form Renderer",
        description:
          "Schema-driven form engine capable of rendering multi-step conditional legal forms from backend JSON contracts.",
        icon: "FileText",
      },
      {
        title: "Realtime WebSocket Notification Bus",
        description:
          "ASP.NET Core SignalR client hub delivering instantaneous updates on judicial hearings, assignments, and audit alerts.",
        icon: "Radio",
      },
      {
        title: "Optimistic Caching & Offline Revalidation",
        description:
          "TanStack Query integration providing instant UI feedback on mutations with background cache reconciliation.",
        icon: "Zap",
      },
    ],
    keyFeatures: [
      {
        title: "Unified Citizen & Staff Portals",
        description:
          "Role-aware layout rendering customized dashboards for public citizens, administrative clerks, and senior prosecution judges.",
      },
      {
        title: "Dynamic Multi-Step Form Builder",
        description:
          "80+ interactive government legal applications with real-time validation, file attachments, and electronic signatures.",
      },
      {
        title: "Live Case Status & Hearing Timelines",
        description:
          "Visual interactive tracking timelines with SignalR push notifications whenever case milestones change.",
      },
      {
        title: "Bilingual Arabic/English RTL Switcher",
        description:
          "Zero-reload RTL/LTR bidirectional theme switching with custom typography and localized date/number formats.",
      },
    ],
    metrics: [
      { label: "Active Users", value: "50k+", desc: "Monthly active citizens and government staff using the portal." },
      { label: "Form Error Reduction", value: "-40%", desc: "Significant drop in user submission errors via real-time validation." },
      { label: "Initial Load Time", value: "1.1s", desc: "Sub-second first contentful paint enabled by Angular SSR." },
      { label: "Legal Forms", value: "80+", desc: "Digital dynamic forms created and managed within the platform." },
    ],
    highlights: [
      "Sole developer building and scaling the frontend architecture from scratch",
      "Seamless integration with ASP.NET Core backend services and Oracle DB schemas",
      "Zero-downtime rolling updates with Docker containers and Nginx reverse proxies",
      "Comprehensive WCAG 2.1 AA accessibility compliance across all public citizen pages",
    ],
    codeSnippet: {
      filename: "case-signalr.service.ts",
      language: "typescript",
      code: `// Realtime Judicial Case Stream with ASP.NET SignalR
@Injectable({ providedIn: 'root' })
export class CaseSignalRService {
  private hubConnection: signalR.HubConnection | null = null;
  private readonly liveCases = signal<Map<string, CaseUpdate>>(new Map());

  readonly liveCaseMap = computed(() => this.liveCases());

  async initHubConnection(userToken: string): Promise<void> {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/api/hubs/judicial-cases', {
        accessTokenFactory: () => userToken,
        skipNegotiation: false,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.hubConnection.on('OnCaseStatusChanged', (update: CaseUpdate) => {
      this.liveCases.update(map => {
        const next = new Map(map);
        next.set(update.caseId, update);
        return next;
      });
    });

    await this.hubConnection.start();
  }
}`,
    },
  },
  {
    id: "staff-affairs-elections",
    slug: "staff-affairs-elections",
    number: "03",
    title: "Staff Affairs & Elections",
    subtitle: "Enterprise Publishable Angular Libraries",
    category: "Publishable Libraries · NPM · Architecture",
    badge: "Architecture & Tooling",
    period: "2024",
    client: "Cloud4Rain Internal & Enterprise Clients",
    role: "Lead Library Author & System Architect",
    status: "Published & Maintained",
    toolsSummary: "Angular 17, ng-packagr, NgRx Store/Effects, RxJS, TypeScript, Storybook, MSW",
    summary:
      "A modular suite of enterprise-grade Angular libraries (`@cloud4rain/staff-affairs` and `@cloud4rain/elections-core`) published to private npm registries. Standardizes organizational hierarchies, payroll computing, employee promotions, and election committee workflows across multiple downstream products.",
    challenge:
      "Four separate engineering squads were independently building divergent staff management and election modules, creating duplicate code, inconsistent bug fixes, and disparate UI styles across the company's product lines.",
    solution:
      "Designed a clean library architecture using `ng-packagr` with secondary entry points for optimal tree-shaking. Isolated presentational components from stateful NgRx domain feature stores, and established a comprehensive mock service worker (MSW) and Storybook environment for client teams.",
    mockupType: "library",
    techStack: [
      { name: "ng-packagr", category: "Package Builder", color: "#dd0031", bg: "rgba(221,0,49,0.15)" },
      { name: "Angular 17", category: "Core Platform", color: "#c2a4ff", bg: "rgba(194,164,255,0.15)" },
      { name: "NgRx Store", category: "State Management", color: "#ba2bd2", bg: "rgba(186,43,210,0.15)" },
      { name: "RxJS", category: "Reactive Streams", color: "#b7178c", bg: "rgba(183,23,140,0.15)" },
      { name: "Storybook", category: "Component Catalog", color: "#ff4785", bg: "rgba(255,71,133,0.15)" },
      { name: "MSW", category: "API Mocking", color: "#ff6a00", bg: "rgba(255,106,0,0.15)" },
      { name: "TypeScript", category: "Language", color: "#3178c6", bg: "rgba(49,120,198,0.15)" },
      { name: "GitHub Actions", category: "CI/CD Publishing", color: "#4ade80", bg: "rgba(74,222,128,0.15)" },
    ],
    architecture: [
      {
        title: "Secondary Entry Points",
        description:
          "Granular import paths (e.g. `@c4r/staff/payroll`, `@c4r/staff/hierarchy`) ensuring consumers only bundle the exact code they utilize.",
        icon: "Package",
      },
      {
        title: "Decoupled Feature State Stores",
        description:
          "Self-contained NgRx feature slices, reducers, and effects with zero side-effect leakage into consuming applications.",
        icon: "Layers",
      },
      {
        title: "Role & Permission Directives",
        description:
          "Structural Angular directives (`*c4rHasPermission`) enforcing fine-grained security policies directly in declarative templates.",
        icon: "Shield",
      },
      {
        title: "Semantic Release Automation",
        description:
          "Fully automated CI publishing pipeline that runs unit tests, generates changelogs, bumps semver, and deploys to private npm.",
        icon: "GitBranch",
      },
    ],
    keyFeatures: [
      {
        title: "Tree-Shakeable Standalone Modules",
        description:
          "Zero-overhead packaging producing FESM2022 and ESM formats with full TypeScript definitions and sourcemaps.",
      },
      {
        title: "Interactive Storybook Sandboxes",
        description:
          "Comprehensive documentation with live interactive props, event spy logs, and RTL visual testing.",
      },
      {
        title: "Mock Service Worker Handlers",
        description:
          "Pre-packaged mock network handlers allowing consumer teams to build features instantly without live backend dependencies.",
      },
      {
        title: "Arabic/English i18n Localization",
        description:
          "Embedded multi-language resource files with dynamic translation key overrides for consuming applications.",
      },
    ],
    metrics: [
      { label: "Code Duplication", value: "-65%", desc: "Significant reduction in duplicate code across 4 enterprise apps." },
      { label: "Target Apps", value: "4 Apps", desc: "Production enterprise systems actively powered by the published libraries." },
      { label: "Bundle Overhead", value: "0KB Extra", desc: "Pure tree-shakeable architecture only shipping utilized symbols." },
      { label: "Packaged Components", value: "45+", desc: "Reusable domain components, pipes, directives, and state stores." },
    ],
    highlights: [
      "Architected publishable Angular libraries with strict TypeScript typing",
      "Automated CI/CD release pipeline with GitHub Actions and private NPM registries",
      "Integrated Storybook 8 with live mock data handlers for instant developer onboarding",
      "Reduced feature integration time for new enterprise apps from weeks to days",
    ],
    codeSnippet: {
      filename: "public-api.ts",
      language: "typescript",
      code: `// Secondary Entry Point: @cloud4rain/staff-affairs/payroll
export * from './lib/models/payroll.models';
export * from './lib/services/payroll-calculator.service';
export * from './lib/components/payroll-table/payroll-table.component';
export * from './lib/directives/has-payroll-role.directive';
export * from './lib/state/payroll.actions';
export * from './lib/state/payroll.selectors';
export * from './lib/state/payroll.effects';

// Configurable Feature Provider
export function provideStaffAffairs(config: StaffAffairsConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: STAFF_AFFAIRS_CONFIG, useValue: config },
    provideState(STAFF_FEATURE_KEY, staffReducer),
    provideEffects(StaffEffects)
  ]);
}`,
    },
  },
  {
    id: "c4r-ui-kit",
    slug: "c4r-ui-kit",
    number: "04",
    title: "C4R UI Kit",
    subtitle: "Enterprise Angular 21 Design System",
    category: "Design System · Storybook · Accessibility",
    badge: "Design System",
    period: "2024 – 2025",
    client: "Cloud4Rain Web Products",
    role: "Design System Lead & UI Engineer",
    status: "Active / v2.4.0",
    toolsSummary: "Angular 21, Storybook 10, Design Tokens, Tailwind, Jest, AXE a11y, Playwright",
    summary:
      "A complete, highly accessible (WCAG AAA) design system and component UI library built for Angular 21. Standardizes typography, colors, animations, data tables, form inputs, modals, and charts across all Cloud4Rain web applications.",
    challenge:
      "Ensuring seamless design fidelity from Figma to code while supporting both high-contrast Dark Cyber and Enterprise Light themes, full Arabic RTL layout mirroring, and strict WCAG AAA accessibility standards across 45+ complex UI components.",
    solution:
      "Constructed a robust design token engine utilizing CSS custom properties synced from Figma. Implemented 45+ standalone Angular 21 components with Signal inputs/outputs and OnPush change detection for maximum 60fps rendering performance. Automated accessibility checks using `@axe-core` and visual regression tests with Playwright.",
    mockupType: "storybook",
    techStack: [
      { name: "Angular 21", category: "Component Framework", color: "#dd0031", bg: "rgba(221,0,49,0.15)" },
      { name: "Storybook 10", category: "Interactive Catalog", color: "#ff4785", bg: "rgba(255,71,133,0.15)" },
      { name: "Design Tokens", category: "Design System", color: "#c2a4ff", bg: "rgba(194,164,255,0.15)" },
      { name: "Tailwind CSS", category: "Styling Engine", color: "#38bdf8", bg: "rgba(56,189,248,0.15)" },
      { name: "Jest & AXE", category: "Accessibility Testing", color: "#4ade80", bg: "rgba(74,222,128,0.15)" },
      { name: "Playwright", category: "Visual Regression", color: "#2eac66", bg: "rgba(46,172,102,0.15)" },
      { name: "TypeScript", category: "Strict Typing", color: "#3178c6", bg: "rgba(49,120,198,0.15)" },
    ],
    architecture: [
      {
        title: "Design Token Hierarchy",
        description:
          "Three-tiered token system (Global -> Semantic -> Component) exposed via CSS variables with instant runtime theme switching.",
        icon: "Palette",
      },
      {
        title: "Signal-Based Reactive Primitives",
        description:
          "100% Angular 21 Signal inputs, outputs, and model signals with OnPush change detection for zero unnecessary re-renders.",
        icon: "Cpu",
      },
      {
        title: "Automated a11y Audits (AXE)",
        description:
          "Continuous accessibility integration testing checking keyboard focus rings, ARIA roles, color contrast, and screen reader cues.",
        icon: "CheckCircle",
      },
      {
        title: "Visual Regression Pipeline",
        description:
          "Playwright visual snapshot tests preventing styling regressions across mobile, tablet, and desktop viewports.",
        icon: "Eye",
      },
    ],
    keyFeatures: [
      {
        title: "45+ Production Components",
        description:
          "Virtual-scrolling Data Tables, Hijri/Gregorian Date Pickers, Accordions, Autocomplete Dropdowns, Toast Alerts, and Metric Cards.",
      },
      {
        title: "Dynamic Dual Theme Engine",
        description:
          "Instant runtime toggling between Dark Cyber and Clean Enterprise light mode with zero page reload or flash of unstyled content.",
      },
      {
        title: "Full Arabic RTL Support",
        description:
          "Bidirectional layout flipping with mirrored iconography, padding resets, and font-kerning optimizations.",
      },
      {
        title: "Interactive Storybook 10 Workshop",
        description:
          "Live component playground with auto-generated documentation, arg controls, and accessibility evaluation panels.",
      },
    ],
    metrics: [
      { label: "Sprint Velocity", value: "+35%", desc: "Faster feature development for engineering teams using the kit." },
      { label: "Accessibility", value: "WCAG AAA", desc: "100% compliance across core components with @axe-core." },
      { label: "Components", value: "45+", desc: "Modular, tested UI primitives and complex interactive components." },
      { label: "Test Coverage", value: "98%", desc: "Comprehensive Jest unit tests on component logic and events." },
    ],
    highlights: [
      "Created modern design token pipeline translating Figma variables to CSS properties",
      "Authored interactive Storybook 10 documentation with live RTL and theme switchers",
      "Integrated automated WCAG AAA accessibility verification in CI/CD pipeline",
      "Adopted across 5+ enterprise production systems at Cloud4Rain",
    ],
    codeSnippet: {
      filename: "button.component.ts",
      language: "typescript",
      code: `// Signal-driven accessible button primitive
@Component({
  selector: 'c4r-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading()"
      [attr.aria-disabled]="disabled()"
      [class]="computedClasses()"
      (click)="onClick($event)">
      @if (loading()) {
        <c4r-spinner size="sm" class="me-2" />
      }
      <ng-content />
    </button>
  \`
})
export class C4RButtonComponent {
  readonly variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly loading = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');

  readonly clicked = output<MouseEvent>();

  protected readonly computedClasses = computed(() => {
    return c4rButtonStyles({ variant: this.variant(), size: this.size() });
  });

  protected onClick(event: MouseEvent): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit(event);
    }
  }
}`,
    },
  },
  {
    id: "time-attendance-c4r",
    slug: "time-attendance-c4r",
    number: "05",
    title: "Time Attendance — C4R",
    subtitle: "Enterprise Workforce & Biometric SaaS",
    category: "HR SaaS · Nx Monorepo · Signals",
    badge: "Enterprise SaaS",
    period: "2024 – 2025",
    client: "Cloud4Rain SaaS Clients",
    role: "Frontend Engineer",
    status: "Active / Deployed",
    toolsSummary: "Angular 20, Nx, NgRx Signal Store, Jest, Tailwind, Chart.js, RTL / i18n",
    summary:
      "A cloud-based workforce management and biometric time-attendance tracking SaaS application. Processes high-frequency employee punch logs, calculates complex overtime shift matrices, and provides managers with real-time workforce attendance heatmaps.",
    challenge:
      "Rendering huge data grids of over 10,000+ daily employee punch logs without browser freezing, handling overnight and rotating shift calculations, and generating heavy multi-page PDF/Excel export summaries on the fly.",
    solution:
      "Engineered with Angular 20 in an Nx monorepo utilizing NgRx Signal Store for declarative, high-performance state management. Integrated virtual scrolling data tables, Web Workers for heavy background report calculations, and interactive attendance heatmaps using Chart.js.",
    mockupType: "saas",
    techStack: [
      { name: "Angular 20", category: "Frontend Framework", color: "#dd0031", bg: "rgba(221,0,49,0.15)" },
      { name: "Nx Monorepo", category: "Workspace Tooling", color: "#38bdf8", bg: "rgba(56,189,248,0.15)" },
      { name: "NgRx Signal Store", category: "State Management", color: "#ba2bd2", bg: "rgba(186,43,210,0.15)" },
      { name: "Tailwind CSS", category: "Styling Engine", color: "#00f0ff", bg: "rgba(0,240,255,0.15)" },
      { name: "Chart.js", category: "Data Visualization", color: "#ff6384", bg: "rgba(255,99,132,0.15)" },
      { name: "Jest", category: "Testing", color: "#99425b", bg: "rgba(153,66,91,0.15)" },
      { name: "Web Workers", category: "Concurrency", color: "#facc15", bg: "rgba(250,204,21,0.15)" },
      { name: "TypeScript", category: "Language", color: "#3178c6", bg: "rgba(49,120,198,0.15)" },
    ],
    architecture: [
      {
        title: "NgRx Signal Store Architecture",
        description:
          "Deeply reactive, granular state management with custom store features for attendance filtering, sorting, and pagination.",
        icon: "Activity",
      },
      {
        title: "Web Worker Export Engine",
        description:
          "Offloaded intensive PDF generation and Excel workbook serialization to background worker threads, preventing UI lockups.",
        icon: "Cpu",
      },
      {
        title: "Virtual Scrolling Data Grid",
        description:
          "High-performance virtual viewport rendering thousands of punch logs with constant memory footprint and 60fps scrolling.",
        icon: "Grid",
      },
      {
        title: "Realtime Biometric Polling",
        description:
          "Live event ingestion synchronizing device punch events with sub-second dashboard KPI updates.",
        icon: "Clock",
      },
    ],
    keyFeatures: [
      {
        title: "Interactive Shift Rotation Planner",
        description:
          "Visual schedule builder supporting complex multi-tier shifts, night shifts, and flexible overtime calculation rules.",
      },
      {
        title: "Live Workforce Attendance Heatmaps",
        description:
          "Interactive dashboard visual charts highlighting on-time attendance, absences, remote punch-ins, and overtime anomalies.",
      },
      {
        title: "Custom Multi-Format Report Builder",
        description:
          "Instant export of customizable attendance sheets to PDF and Excel with custom formulas and organizational filters.",
      },
      {
        title: "Arabic-First RTL Interface",
        description:
          "Native Arabic layout optimized for Middle Eastern enterprise HR managers with instant English toggling.",
      },
    ],
    metrics: [
      { label: "Daily Punches", value: "15,000+", desc: "Daily biometric and mobile employee check-ins processed smoothly." },
      { label: "Render Speed", value: "< 1s", desc: "Roster rendering time for 5,000+ employee records via virtual scrolling." },
      { label: "Sync Accuracy", value: "99.9%", desc: "Precision sync between on-premise biometric hardware and cloud SaaS." },
      { label: "Language Parity", value: "100%", desc: "Complete bilingual Arabic & English RTL/LTR feature support." },
    ],
    highlights: [
      "Engineered high-performance attendance roster with virtual scrolling data grids",
      "Utilized NgRx Signal Store for declarative, fine-grained state management",
      "Built Web Worker architecture for zero-lag PDF and Excel report compilation",
      "Designed intuitive drag-and-drop shift scheduling interface",
    ],
    codeSnippet: {
      filename: "attendance.store.ts",
      language: "typescript",
      code: `// Signal Store with Custom Entity Management
export const AttendanceStore = signalStore(
  { providedIn: 'root' },
  withState<AttendanceState>(initialAttendanceState),
  withEntities<AttendanceRecord>(),
  withComputed(({ entities, filter, selectedDepartment }) => ({
    filteredRecords: computed(() => {
      const dept = selectedDepartment();
      const query = filter().toLowerCase();
      return entities().filter(record => {
        const matchesDept = !dept || record.departmentId === dept;
        const matchesQuery = record.employeeName.toLowerCase().includes(query);
        return matchesDept && matchesQuery;
      });
    }),
    summaryStats: computed(() => {
      const all = entities();
      return {
        present: all.filter(r => r.status === 'present').length,
        late: all.filter(r => r.status === 'late').length,
        absent: all.filter(r => r.status === 'absent').length,
        overtimeHours: all.reduce((sum, r) => sum + (r.overtimeMinutes / 60), 0)
      };
    })
  })),
  withMethods((store, api = inject(AttendanceApiService)) => ({
    loadRecords: rxMethod<DateRange>(pipe(
      tap(() => patchState(store, { isLoading: true })),
      switchMap(range => api.fetchAttendanceByRange(range).pipe(
        tapResponse({
          next: records => patchState(store, setAllEntities(records), { isLoading: false }),
          error: () => patchState(store, { isLoading: false })
        })
      ))
    ))
  }))
);`,
    },
  },
  {
    id: "rafraf-ego-projectegy",
    slug: "rafraf-ego-projectegy",
    number: "06",
    title: "Rafraf · EGO · Project-EGY",
    subtitle: "Ecommerce & Classifieds Marketplaces",
    category: "Ecommerce · Classifieds · PrimeNG",
    badge: "Commercial Ecommerce",
    period: "2023 – 2024",
    client: "Project-EGY & Commercial Marketplace Clients",
    role: "Frontend Developer",
    status: "Delivered & Live",
    toolsSummary: "Angular, PrimeNG, Angular Material, RxJS, Sass, Payment Gateways, REST APIs",
    summary:
      "A collection of high-converting multi-vendor ecommerce portals and automotive classifieds marketplaces. Features faceted search engines, multi-step checkout funnels, secure token authentication, and interactive product catalogs.",
    challenge:
      "Providing real-time faceted vehicle searching across 30+ dynamic criteria (make, model, trim, mileage, price) with instantaneous response times on mobile devices, alongside bulletproof payment processing.",
    solution:
      "Implemented Angular standalone and modular architecture with route-level code splitting. Integrated debounced reactive RxJS search streams with browser URL query parameter syncing, automated JWT refresh token rotation interceptors, and customized PrimeNG UI controls.",
    mockupType: "ecommerce",
    techStack: [
      { name: "Angular", category: "Frontend Framework", color: "#dd0031", bg: "rgba(221,0,49,0.15)" },
      { name: "PrimeNG", category: "UI Suite", color: "#38bdf8", bg: "rgba(56,189,248,0.15)" },
      { name: "Angular Material", category: "Components", color: "#c2a4ff", bg: "rgba(194,164,255,0.15)" },
      { name: "RxJS", category: "Reactive Streams", color: "#b7178c", bg: "rgba(183,23,140,0.15)" },
      { name: "Sass / SCSS", category: "Styling", color: "#cf649a", bg: "rgba(207,100,154,0.15)" },
      { name: "Payment Gateways", category: "Fintech", color: "#4ade80", bg: "rgba(74,222,128,0.15)" },
      { name: "TypeScript", category: "Language", color: "#3178c6", bg: "rgba(49,120,198,0.15)" },
    ],
    architecture: [
      {
        title: "Faceted Search & URL Sync",
        description:
          "Debounced reactive search pipeline syncing filter states with browser URL query parameters for shareable search results.",
        icon: "Search",
      },
      {
        title: "JWT Token Refresh Interceptor",
        description:
          "HTTP interceptor managing automatic silent token refresh on 401 responses with queued pending request replay.",
        icon: "Key",
      },
      {
        title: "Multi-Step Checkout Funnel",
        description:
          "Optimized checkout wizard with address management, order summary, coupon code validation, and payment gateway integration.",
        icon: "CreditCard",
      },
      {
        title: "Responsive Media Lightbox",
        description:
          "Touch-friendly product image gallery with hardware-accelerated zoom and swipe gestures.",
        icon: "Image",
      },
    ],
    keyFeatures: [
      {
        title: "Realtime Faceted Search Filter",
        description:
          "Instant filtering across vehicle make, model, year, transmission, price brackets, and location.",
      },
      {
        title: "Vendor Management Dashboard",
        description:
          "Listing creation wizard with client-side image resizing, validation, and analytics on ad views and inquiries.",
      },
      {
        title: "Interactive Vehicle Comparison Matrix",
        description:
          "Side-by-side feature comparison table highlighting differences in vehicle specifications.",
      },
      {
        title: "Secure Payment Gateway Integration",
        description:
          "Support for credit card processing, mobile wallets, and cash on delivery with automated email invoice generation.",
      },
    ],
    metrics: [
      { label: "Active Listings", value: "20,000+", desc: "Classifieds and ecommerce product listings managed in the system." },
      { label: "Conversion Rate", value: "+25%", desc: "Increase in completed purchases with streamlined checkout." },
      { label: "Search Latency", value: "< 200ms", desc: "Instant debounced search filter response time." },
      { label: "User Rating", value: "4.8 / 5", desc: "High customer satisfaction rating on mobile web experience." },
    ],
    highlights: [
      "Built high-converting ecommerce checkout funnels with automatic token refresh",
      "Engineered debounced faceted search with deep URL query synchronization",
      "Created vendor product creation wizards with client-side image compression",
      "Implemented responsive PrimeNG & Material UI design with mobile optimization",
    ],
    codeSnippet: {
      filename: "jwt-refresh.interceptor.ts",
      language: "typescript",
      code: `// Automatic Silent JWT Token Refresh Interceptor
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private readonly refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private readonly authService = inject(AuthService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();
    let authReq = req;
    if (token) {
      authReq = req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } });
    }

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap(token => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.accessToken);
          return next.handle(request.clone({
            setHeaders: { Authorization: \`Bearer \${token.accessToken}\` }
          }));
        }),
        catchError(err => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next.handle(request.clone({
        setHeaders: { Authorization: \`Bearer \${token}\` }
      })))
    );
  }
}`,
    },
  },
];
