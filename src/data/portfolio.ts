import { siteContentSchema } from '../lib/site-schema';
import type { Project } from '../lib/site-schema';
export type {
  Project,
  ProjectCategory,
  ProjectDemo,
  ProjectSource,
  ProjectScreenshot,
  SiteContent,
} from '../lib/site-schema';

export const profile = {
  name: 'Vikas Bhardwaj',
  role: 'Full-Stack & Applied AI Product Engineer',
  headline: 'Vikas Bhardwaj — Full-Stack & Applied AI Product Engineer',
  location: 'Jammu & Kashmir, India',
  email: 'vbvoxe@gmail.com',
  github: 'https://github.com/vikas-bhar',
  linkedin: 'https://www.linkedin.com/in/vikas-bhardwaj-5438083b4',
  website: 'https://portfolio-vikas-eosin.vercel.app',
  heroSummary:
    'I architect and ship end-to-end web applications, agentic AI workflows, and native browser/system tools—taking fuzzy real-world problems from zero to live deployment.',
  summary:
    'Full-stack and applied AI product engineer based in Jammu & Kashmir, building end-to-end web applications, agentic workflows, and native browser/system tools. I focus on practical software under real-world constraints, from offline-first access and telemetry pipelines to network-level filtering and direct-ordering prototypes.',
  about: [
    'I’m a full-stack and applied AI developer based in Jammu & Kashmir, focused on building fast, practical software that works under real-world constraints.',
    'Whether I’m wiring up a serverless telemetry dashboard, optimizing local AI models on limited hardware, or writing C++ daemons for native network filtering, I care most about shipping functional products that solve actual problems.',
    'Outside of client work and hackathons (including DTU’s SEVA2026 and Devpost builds), I run Vision Start, helping businesses automate their web and digital growth infrastructure.',
  ],
} as const;

export const navigation = [
  { id: 'project', label: 'Work' },
  { id: 'my-skill', label: 'Capabilities' },
  { id: 'about-me', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'contact', label: 'Contact' },
] as const;

export const projects: Project[] = [
  {
    id: 'kisan-sathi',
    featured: true,
    visible: true,
    title: 'Kisan Sathi',
    category: 'ai',
    kind: 'Offline-first agriculture',
    context: 'DTU · SEVA2026 Challenge',
    description:
      'A multilingual farming companion for crop-disease assistance, weather advisories, and mandi prices—even when connectivity is unreliable.',
    problem:
      'Rural farmers need timely crop and market guidance without depending on a stable connection or an English-only interface.',
    architecture:
      'Expo / React Native client, offline-first caching, and ML-backed crop-assistance flows, with a web build deployed on Vercel.',
    impact:
      'Built for DTU’s SEVA2026 Challenge around low-connectivity rural use. The live onboarding offers English, Hindi, Dogri, and Urdu.',
    tags: ['Expo / React Native', 'Offline-first', 'ML inference', 'Vercel'],
    stages: [
      { label: 'Farmer', detail: 'Multilingual client' },
      { label: 'Assist', detail: 'Cache + ML flows' },
      { label: 'Access', detail: 'Mobile + web' },
    ],
    demo: {
      availability: 'verified',
      url: 'https://kisan-saathi-indol.vercel.app',
      verifiedOn: '2026-11-11',
    },
    source: {
      availability: 'private',
      url: 'https://github.com/vikas-bhar/leadscout..',
      reason: 'The linked source repository is private. Request a walkthrough or source access.',
    },
    evidenceNote:
      'Public onboarding retrieved; Expo web build confirmed in Vercel. Offline and ML behavior have not been independently tested.',
  },
  {
    id: 'aeo-pulse',
    featured: true,
    visible: true,
    title: 'AEO Pulse',
    category: 'ai',
    kind: 'Agentic telemetry & search visibility',
    context: 'Live telemetry gateway',
    description:
      'A central view of AI-crawler activity, agent-tool dispatch, and search-readiness diagnostics for brands and websites.',
    problem:
      'Traditional traffic dashboards give little visibility into how AI crawlers and answer engines access a website.',
    architecture:
      'The supplied live gateway uses Express, Supabase telemetry, and script / edge / middleware ingestion, with AEO auditing and a WebMCP tool dispatcher.',
    impact:
      'Brings crawler events and AI-search readiness checks into one inspectable dashboard, replacing scattered tracking with a centralized telemetry flow.',
    tags: ['Express', 'Supabase', 'Telemetry pipelines', 'WebMCP'],
    stages: [
      { label: 'Collect', detail: 'Script + edge' },
      { label: 'Ingest', detail: 'Express → Supabase' },
      { label: 'Inspect', detail: 'Feed + AEO audit' },
    ],
    demo: {
      availability: 'verified',
      url: 'https://unknown-alpha-two.vercel.app',
      verifiedOn: '2026-11-11',
    },
    source: {
      availability: 'private',
      url: 'https://github.com/vikas-bhar/unknown',
      reason: 'The linked source repository is private. Request a walkthrough or source access.',
    },
    evidenceNote:
      'Public telemetry UI retrieved; Express deployment confirmed in Vercel. Authentication and write APIs have not been tested.',
  },
  {
    id: 'focuspulse',
    featured: true,
    visible: true,
    title: 'FocusPulse',
    category: 'systems',
    kind: 'Native systems & browser engineering',
    context: 'Builder-provided architecture',
    description:
      'A cross-platform distraction blocker targeting short-video loops at the network and OS level—not just another browser timer.',
    problem:
      'Tab timers are easy to bypass. Short-video loops span browsers and native apps, so focus needs enforcement beyond a single page.',
    architecture:
      'C++ host daemon integrated with a Chrome Manifest V3 extension and declarativeNetRequest filtering; esbuild tooling and Android Accessibility Services extend the approach.',
    impact:
      'Designed to connect native-process control with browser-level filtering, addressing distraction at the system boundary rather than the UI alone.',
    tags: ['C++ daemon', 'Chrome MV3', 'esbuild', 'Android Accessibility'],
    stages: [
      { label: 'Host', detail: 'C++ native daemon' },
      { label: 'Filter', detail: 'MV3 network rules' },
      { label: 'Extend', detail: 'Android services' },
    ],
    demo: {
      availability: 'unavailable',
      reason: 'No public FocusPulse demo has been supplied or verified.',
    },
    source: {
      availability: 'unverified',
      reason: 'A matching FocusPulse repository has not been supplied or verified.',
    },
    evidenceNote:
      'Architecture is supplied by the builder. Public demo, source, and working-UI capture are pending verification.',
  },
  {
    id: 'rasa-direct-ordering',
    featured: true,
    visible: true,
    title: 'Rasa by Gulab — Direct-Ordering Prototype',
    category: 'fullstack',
    kind: 'Hospitality & direct commerce',
    context: 'Concept prototype · not an official restaurant site',
    description:
      'A mobile-first menu, shopping bag, and WhatsApp handoff exploring commission-free direct ordering for local hospitality.',
    problem:
      'Local restaurants need a direct digital ordering channel without making every customer interaction depend on delivery marketplaces and their fees.',
    architecture:
      'Next.js menu and cart experience, a WhatsApp order handoff, and a Vercel deployment. Sample business details are explicitly labeled in the prototype.',
    impact:
      'Makes a direct-ordering customer journey tangible for hospitality pitches. It is a concept—not a confirmed client launch or a claim of realized fee savings.',
    tags: ['Next.js', 'Direct ordering', 'WhatsApp handoff', 'Vercel'],
    stages: [
      { label: 'Discover', detail: 'Next.js menu' },
      { label: 'Choose', detail: 'Shopping bag' },
      { label: 'Order', detail: 'WhatsApp handoff' },
    ],
    demo: {
      availability: 'verified',
      url: 'https://rasa-by-gulab.vercel.app',
      verifiedOn: '2026-11-11',
    },
    source: {
      availability: 'private',
      url: 'https://github.com/vikas-bhar/RASA-by-Gulab',
      reason: 'The linked source repository is private. Request a walkthrough or source access.',
    },
    evidenceNote:
      'Public concept page, menu, and ordering controls retrieved. No order was submitted and no commercial outcome is claimed.',
  },
  {
    id: 'venus-ai',
    title: 'Venus AI',
    category: 'ai',
    kind: 'AI & conversational interfaces',
    context: 'Earlier project · original demo needs a new URL',
    description:
      'An AI application exploring conversational interfaces, generative reasoning, and responsive workflows.',
    tags: ['React', 'TypeScript', 'LLMs', 'Tailwind CSS'],
    demo: {
      availability: 'unavailable',
      url: 'https://vdda.netlify.app',
      reason:
        'The previously supplied Venus AI URL now serves Veda Scholar, not Venus AI. An updated project URL is needed.',
    },
    evidenceNote:
      'Original project retained. On 2026-11-11 the former deployment showed Veda Scholar / JK exam preparation, so it is not presented as a verified Venus AI demo.',
    featured: false,
    visible: true,
    problem: '',
    architecture: '',
    impact: '',
    stages: [],
    source: {
      availability: 'unverified',
      reason:
        'No matching public repository has been confirmed for this project. Request a walkthrough or source link.',
    },
  },
  {
    id: 'sheet-craft',
    title: 'Sheet Craft',
    category: 'fullstack',
    kind: 'Productivity & data tools',
    context: 'Earlier project · public landing page checked',
    description:
      'An AI-assisted workspace for turning text, files, and images into organized Google Sheets, with a guest/offline demo entry.',
    tags: ['Next.js', 'React', 'Spreadsheets'],
    demo: {
      availability: 'verified',
      url: 'https://sheet-craft-two.vercel.app',
      verifiedOn: '2026-11-11',
    },
    evidenceNote:
      'Public sign-in and guest-demo landing page retrieved. Google account access and spreadsheet-writing behavior were not tested.',
    featured: false,
    visible: true,
    problem: '',
    architecture: '',
    impact: '',
    stages: [],
    source: {
      availability: 'unverified',
      reason:
        'No matching public repository has been confirmed for this project. Request a walkthrough or source link.',
    },
  },
  {
    id: 'prepstudy',
    title: 'PrepStudy Platform',
    category: 'fullstack',
    kind: 'Education & learning',
    context: 'Earlier project · academic tools',
    description:
      'An academic-assistance interface with subject detection, question and answer input, image upload, and an AI answer-evaluation workflow.',
    tags: ['Next.js', 'React', 'Tailwind CSS'],
    demo: {
      availability: 'verified',
      url: 'https://prepsudy.vercel.app',
      verifiedOn: '2026-11-11',
    },
    evidenceNote:
      'Public PrepStudy academic-intelligence UI retrieved. No file was uploaded and no evaluation was submitted.',
    featured: false,
    visible: true,
    problem: '',
    architecture: '',
    impact: '',
    stages: [],
    source: {
      availability: 'unverified',
      reason:
        'No matching public repository has been confirmed for this project. Request a walkthrough or source link.',
    },
  },
  {
    id: 'arora-tech',
    title: 'Arora Tech',
    category: 'fullstack',
    kind: 'E-commerce & technology',
    context: 'Earlier project · storefront prototype',
    description:
      'A responsive laptop storefront with categorized refurbished machines, product details, and shopping-oriented interactions.',
    tags: ['React', 'Next.js', 'E-Commerce'],
    demo: {
      availability: 'verified',
      url: 'https://arora-tech.vercel.app',
      verifiedOn: '2026-11-11',
    },
    evidenceNote:
      'Public refurbished-laptop catalog retrieved. Transactions, inventory accuracy, testimonials, and commercial claims were not verified.',
    featured: false,
    visible: true,
    problem: '',
    architecture: '',
    impact: '',
    stages: [],
    source: {
      availability: 'unverified',
      reason:
        'No matching public repository has been confirmed for this project. Request a walkthrough or source link.',
    },
  },
  {
    id: 'ms-fast-food',
    title: 'MS Fast Food Point',
    category: 'web',
    kind: 'Food & online ordering',
    context: 'Earlier project · restaurant ordering UI',
    description:
      'A mobile-first restaurant experience with menu categories, food selections, price sorting, and an order-building interface.',
    tags: ['React', 'Tailwind CSS', 'Ordering UI'],
    demo: {
      availability: 'verified',
      url: 'https://ms-fast-food-point.vercel.app',
      verifiedOn: '2026-11-11',
    },
    evidenceNote:
      'Public restaurant menu and ordering controls retrieved. No order was placed; delivery-time and nutrition claims were not verified.',
    featured: false,
    visible: true,
    problem: '',
    architecture: '',
    impact: '',
    stages: [],
    source: {
      availability: 'unverified',
      reason:
        'No matching public repository has been confirmed for this project. Request a walkthrough or source link.',
    },
  },
  {
    id: 'lsss-school',
    title: 'LSSS School',
    category: 'web',
    kind: 'Education & school portal',
    context: 'Earlier project · academic portal',
    description:
      'A school information portal bringing academic programs, admissions, institutional information, and a classroom-portal entry into one experience.',
    tags: ['React', 'TypeScript', 'School portal'],
    demo: {
      availability: 'verified',
      url: 'https://lsss-school-sage.vercel.app',
      verifiedOn: '2026-11-11',
    },
    evidenceNote:
      'The original custom domain littlestarseniorsecondaryschooljuria.com could not be retrieved. The previously supplied Vercel alternative was retrieved successfully. Portal login and institutional claims were not tested.',
    featured: false,
    visible: true,
    problem: '',
    architecture: '',
    impact: '',
    stages: [],
    source: {
      availability: 'unverified',
      reason:
        'No matching public repository has been confirmed for this project. Request a walkthrough or source link.',
    },
  },
  {
    id: 'rahat-hospital',
    title: 'Rahat Hospital & Research Centre',
    category: 'web',
    kind: 'Healthcare & patient information',
    context: 'Earlier project · deployment unavailable',
    description:
      'A healthcare information portal concept for clinical departments, medical services, consultation details, and emergency-care access.',
    tags: ['React', 'TypeScript', 'Healthcare'],
    demo: {
      availability: 'unavailable',
      url: 'https://rahat-hospital-reserch-centre.vercel.app',
      reason: 'The previously supplied deployment currently returns DEPLOYMENT_NOT_FOUND.',
    },
    evidenceNote:
      'Project retained, but its deployment returned a Vercel 404 / DEPLOYMENT_NOT_FOUND page on 2026-11-11. No medical-service availability is implied.',
    featured: false,
    visible: true,
    problem: '',
    architecture: '',
    impact: '',
    stages: [],
    source: {
      availability: 'unverified',
      reason:
        'No matching public repository has been confirmed for this project. Request a walkthrough or source link.',
    },
  },
];

export const skillGroups = [
  {
    id: 'frontend',
    title: 'Frontend & Full-Stack Web',
    subtitle: 'From a responsive interface to authenticated data and APIs.',
    skills: [
      'Next.js & React',
      'TypeScript / JavaScript',
      'Tailwind CSS',
      'HTML5 / CSS3',
      'Supabase Auth & Postgres',
      'REST APIs',
    ],
  },
  {
    id: 'ai',
    title: 'Applied AI & Automation',
    subtitle: 'Useful workflows, constrained hardware, and repeatable automation.',
    skills: [
      'Multi-agent workflows',
      'Local LLM optimization',
      'Hindi / Hinglish TTS',
      'Vocoder pipelines',
      'Playwright / Puppeteer',
      'Headless browser automation',
    ],
  },
  {
    id: 'systems',
    title: 'Systems & Extension Engineering',
    subtitle: 'Engineering beyond the page, at browser and OS boundaries.',
    skills: [
      'Chrome Manifest V3',
      'Network filtering / declarativeNetRequest',
      'C++ native daemons',
      'esbuild',
      'Android Accessibility Services',
    ],
  },
  {
    id: 'cloud',
    title: 'Cloud, DevOps & Deployment',
    subtitle: 'Taking a build from local development to a reachable product.',
    skills: [
      'Vercel & Netlify',
      'Oracle Cloud Always Free VMs',
      'Koyeb',
      'Git / GitHub CI/CD',
      'DNS & domain management',
    ],
  },
] as const;

export const milestones = [
  {
    id: 'vision-start',
    category: 'Independent venture',
    title: 'Founder & Lead Builder',
    organization: 'Vision Start / Zenastra Industries',
    description:
      'Building full-stack web prototypes, direct-ordering platforms, and custom digital pitches for local hospitality, alongside automated digital-marketing pipelines.',
    highlights: ['Full-stack prototypes', 'Hospitality platforms', 'Growth automation'],
  },
  {
    id: 'hackathons',
    category: 'Prototypes & submissions',
    title: 'National & Global Hackathon Builder',
    organization: 'SEVA2026 (DTU) · Devpost builds',
    description:
      'Built and submitted prototypes for SEVA2026 (DTU), RevenueCat Shipaton, Agentic Cinema, and Build with Gemini XPRIZE.',
    highlights: ['SEVA2026', 'RevenueCat Shipaton', 'Agentic Cinema', 'Build with Gemini XPRIZE'],
  },
  {
    id: 'community',
    category: 'Developer ecosystems',
    title: 'Community & Open Ecosystems',
    organization: 'GDG Jammu (Build with AI) · Hack Club',
    description:
      'Learning and building through local developer communities and open ecosystems, including GDG Jammu’s Build with AI and Hack Club.',
    highlights: ['GDG Jammu', 'Build with AI', 'Hack Club'],
  },
] as const;

export const resumeFiles = {
  html: '/api/resume/html',
  text: '/api/resume/text',
} as const;

export const defaultContent = siteContentSchema.parse({
  schemaVersion: 1,
  profile,
  projects,
  skillGroups,
  milestones,
  sections: [
    { id: 'home', label: 'Home', visible: true },
    ...navigation.map((item) => ({ ...item, visible: true })),
  ],
  focusAreas: [
    {
      title: 'Constraints first',
      description:
        'Unreliable connectivity, limited hardware, or a real business bottleneck—the constraint shapes the architecture.',
    },
    {
      title: 'Systems, not isolated screens',
      description:
        'Connect the interface to data, intelligence, native processes, and the workflow it needs to support.',
    },
    {
      title: 'Built to ship',
      description:
        'Own the path from the first prototype through deployment, with clear trade-offs and honest product scope.',
    },
  ],
  buildPath: [
    { title: 'Understand', detail: 'Start with the real-world constraint.' },
    { title: 'Engineer', detail: 'Connect the interface, intelligence, and system.' },
    { title: 'Ship', detail: 'Deploy, inspect, and iterate on the product.' },
  ],
  copy: {
    availability: 'Open to product engineering & client work',
    heroEyebrow: 'JAMMU & KASHMIR / BUILDING FOR THE REAL WORLD',
    builderNoteTitle: 'End-to-end ownership.',
    builderNoteDetail: 'From fuzzy brief to live deployment.',
    workEyebrow: 'PROJECTS & SELECTED WORK',
    workTitle: 'Real problems.',
    workAccent: 'Engineered solutions.',
    workSummary:
      'Featured builds and earlier projects. Start with a quick summary, then choose Show more for the full story.',
    skillsEyebrow: 'TECHNICAL CAPABILITIES',
    skillsTitle: 'Four engineering pillars.',
    skillsAccent: 'One product mindset.',
    skillsSummary:
      'The capabilities I use to move across the full product stack—from the first interaction to the native process and the deployed service.',
    skillsNote: 'Architecture follows the problem—not the other way around.',
    aboutEyebrow: 'ABOUT THE BUILDER',
    aboutTitle: 'Practical software.',
    aboutAccent: 'Real-world constraints.',
    aboutLink: 'Have a product problem? Let’s work through it',
    experienceEyebrow: 'EXPERIENCE & MILESTONES',
    experienceTitle: 'Independent work.',
    experienceAccent: 'Shared ecosystems.',
    experienceSummary:
      'Business prototypes, national and global hackathon builds, and the developer communities that keep the work moving.',
    contactEyebrow: 'LET’S BUILD SOMETHING USEFUL',
    contactTitle: 'Have an idea?\nLet’s make',
    contactAccent: 'it happen.',
    contactDescription:
      'An ambitious project, a question, or just a hello. My inbox is a good place to start.',
    contactAvailability: 'Open to collaborations & new opportunities',
    footerTagline: 'Full-stack. Applied AI. Built to ship.',
    footerSignoff: 'KEEP BUILDING.',
    wordmark: 'vikas',
    wordmarkSuffix: '.bhardwaj',
  },
  settings: {
    metaDescription:
      'Vikas Bhardwaj — full-stack and applied AI product engineer in Jammu & Kashmir. End-to-end web apps, agentic workflows, and native browser/system tools.',
    accentDark: '#b4ecc5',
    accentLight: '#326146',
    defaultTheme: 'dark',
    animations: true,
    resumeEnabled: true,
  },
});
