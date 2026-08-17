export const portfolio = {
  name: {
    first: "ANAS",
    last: "ESSAM MAHMOUD",
    full: "Anas Essam Mahmoud",
  },
  brand: "ANAS",
  title: "Angular Frontend Developer",
  roles: ["Angular Developer", "Software Engineer"] as const,
  location: "El-Sheikh Zayed City, Giza, Egypt",
  email: "anasessam211@gmail.com",
  phone: "+20 109 420 1827",
  phoneHref: "+201094201827",
  social: {
    linkedin: "https://www.linkedin.com/in/anas-essam211/",
    github: "https://github.com/anasessam12",
  },
  resumeUrl: "/Anas-Essam-Mahmoud-CV.pdf",
  about:
    "Angular Frontend Developer specializing in bilingual Arabic/English web applications across government, ERP/HR SaaS, ecommerce, and corporate domains. I ship production apps end-to-end — admin and client portals with SSO, offline-first Electron desktop apps, reusable published libraries, and company design systems — working closely with backend, design, and QA to deliver polished, accessible RTL interfaces.",
  whatIDo: [
    {
      title: "BUILD",
      subtitle: "Angular apps & platforms",
      shortDescription:
        "End-to-end Angular products: admin/client portals, SSO, RBAC, bilingual RTL UIs, and offline-first Electron apps.",
      description:
        "Architect and ship Angular apps end-to-end across government, SaaS, and ecommerce — admin and client portals with SSO and full RBAC, bilingual Arabic/English RTL interfaces, config-driven forms, realtime SignalR features, and offline-first Electron desktop products with queued sync. I own layered core/features/shared architecture, API contracts with backend, and polished delivery with design and QA.",
      skills: [
        "Angular 17–21",
        "TypeScript",
        "RxJS",
        "NgRx",
        "Signals",
        "Nx",
        "Electron",
        "SSR",
        "PrimeNG",
        "REST APIs",
      ],
    },
    {
      title: "SCALE",
      subtitle: "Libraries & design systems",
      shortDescription:
        "Publishable Angular libraries, themeable UI kits, Storybook docs, and monorepo architecture for reusable delivery.",
      description:
        "Build and publish versioned Angular libraries (ng-packagr, private npm) and themeable design systems with Storybook, design tokens, and AXE accessibility checks. I set up Nx monorepos, shared conventions (OnPush, signals, Jest), CI with GitHub Actions / Nx Cloud, and Docker/Helm delivery so teams can reuse UI and domain features across multiple apps.",
      skills: [
        "ng-packagr",
        "Storybook",
        "Design Tokens",
        "Tailwind",
        "Jest",
        "Playwright",
        "GitHub Actions",
        "Docker",
        "RTL / i18n",
        "AXE a11y",
      ],
    },
  ],
  experience: [ 
    {
    role: "Software Engineer",
    company: "Cloud4Rain",
    dates: "Dec 2024 – Present",
    description:
      "Sole developer on the APA government platform; shipped Angular apps end-to-end (admin, client, SSO, Electron voting), published @cloud4rain libraries, and contributed Time Attendance features in a team Angular 20 + Nx SaaS codebase.",
  },
    {
      role: "Frontend Developer",
      company: "Project-EGY",
      dates: "Dec 2022 – Nov 2023",
      description:
        "Built reusable Angular components, pipes, interceptors, and standalone modules for company and ecommerce products; grew from intern to full frontend developer through Nov 2023.",
    },
    {
      role: "Freelance Angular Developer",
      company: "Freelance",
      dates: "Jan 2024 – Dec 2024",
      description:
        "Delivered client Angular apps with CRUD flows, refresh-token auth, responsive PrimeNG/Material UI, and performance-focused architecture (Rafraf ecommerce, EGO classifieds).",
    },
    
  ],
  techStack: [
    { label: "Angular", color: "#dd0031", text: "#ffffff" },
    { label: "TypeScript", color: "#3178c6", text: "#ffffff" },
    { label: "JavaScript", color: "#f7df1e", text: "#111111" },
    { label: "RxJS", color: "#b7178c", text: "#ffffff" },
    { label: "NgRx", color: "#ba2bd2", text: "#ffffff" },
    { label: "Nx", color: "#143055", text: "#ffffff" },
    { label: "Electron", color: "#2b2e3a", text: "#9feaf9" },
    { label: "Tailwind", color: "#0f172a", text: "#38bdf8" },
    { label: "PrimeNG", color: "#1e3a5f", text: "#7dd3fc" },
    { label: "Storybook", color: "#ff4785", text: "#ffffff" },
    { label: "Jest", color: "#99425b", text: "#ffffff" },
    { label: "Playwright", color: "#2eac66", text: "#ffffff" },
    { label: "Docker", color: "#1d63ed", text: "#ffffff" },
    { label: "SSR", color: "#0b080c", text: "#c2a4ff" },
    { label: "SignalR", color: "#512bd4", text: "#ffffff" },
    { label: "GitHub", color: "#24292f", text: "#ffffff" },
  ],
  projects: [
    {
      title: "APA Voting Desktop",
      slug: "apa-voting-desktop",
      category: "Electron · Government",
      tools: "Angular 21, Nx, Electron 41, Vitest, Playwright",
      image: "/images/placeholder.webp",
    },
    {
      title: "APA Government Platform",
      slug: "apa-government-platform",
      category: "Admin · Client · SSO",
      tools: "Angular 17/18, NgRx, SignalR, TanStack Query, SSR",
      image: "/images/placeholder.webp",
    },
    {
      title: "Staff Affairs & Elections",
      slug: "staff-affairs-elections",
      category: "Publishable Libraries",
      tools: "Angular 17, ng-packagr, NgRx Store/Effects",
      image: "/images/placeholder.webp",
    },
    {
      title: "C4R UI Kit",
      slug: "c4r-ui-kit",
      category: "Design System",
      tools: "Angular 21, Storybook 10, Design Tokens, Jest, AXE",
      image: "/images/placeholder.webp",
    },
    {
      title: "Time Attendance — C4R",
      slug: "time-attendance-c4r",
      category: "HR SaaS",
      tools: "Angular 20, Nx, NgRx, Jest, RTL / i18n",
      image: "/images/placeholder.webp",
    },
    {
      title: "Rafraf · EGO · Project-EGY",
      slug: "rafraf-ego-projectegy",
      category: "Ecommerce · Classifieds",
      tools: "Angular, PrimeNG, Angular Material",
      image: "/images/placeholder.webp",
    },
  ] as {
    title: string;
    slug: string;
    category: string;
    tools: string;
    image: string;
    link?: string;
  }[],
  copyrightYear: new Date().getFullYear(),
};

export type Portfolio = typeof portfolio;
