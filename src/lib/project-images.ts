import type { Project } from './site-schema';

interface Illustration {
  src: string;
  alt: string;
}
const illustrations: Record<string, Illustration> = {
  'kisan-sathi': {
    src: '/projects/kisan-sathi.svg',
    alt: 'A sprout growing above farmland — Kisan Sathi project illustration.',
  },
  'aeo-pulse': {
    src: '/projects/aeo-pulse.svg',
    alt: 'A pulse connected to telemetry nodes — AEO Pulse project illustration.',
  },
  focuspulse: {
    src: '/projects/focuspulse.svg',
    alt: 'A protective shield with a check mark — FocusPulse project illustration.',
  },
  'rasa-direct-ordering': {
    src: '/projects/rasa-direct-ordering.svg',
    alt: 'A plate, cutlery, and a botanical sprig — Rasa project illustration.',
  },
  'venus-ai': {
    src: '/projects/venus-ai.svg',
    alt: 'A conversation bubble and a sparkle — Venus AI project illustration.',
  },
  'sheet-craft': {
    src: '/projects/sheet-craft.svg',
    alt: 'A stack of organized spreadsheets — Sheet Craft project illustration.',
  },
  prepstudy: {
    src: '/projects/prepstudy.svg',
    alt: 'An open book and a pencil — PrepStudy project illustration.',
  },
  'arora-tech': {
    src: '/projects/arora-tech.svg',
    alt: 'A laptop with code brackets — Arora Tech project illustration.',
  },
  'ms-fast-food': {
    src: '/projects/ms-fast-food.svg',
    alt: 'A warm serving bowl with chopsticks — MS Fast Food Point project illustration.',
  },
  'lsss-school': {
    src: '/projects/lsss-school.svg',
    alt: 'A school building with a flag and clock — LSSS School project illustration.',
  },
  'rahat-hospital': {
    src: '/projects/rahat-hospital.svg',
    alt: 'A medical cross and pulse line — Rahat Hospital project illustration, not proof of available services.',
  },
};
const categories = {
  ai: 'venus-ai',
  systems: 'focuspulse',
  fullstack: 'sheet-craft',
  web: 'arora-tech',
} as const;

/** Existing saved content also gets illustrations; no destructive CMS migration is needed. */
export function projectIllustration(
  project: Pick<Project, 'id' | 'title' | 'category'>,
): Illustration {
  return illustrations[project.id] ?? categoryIllustration(project);
}
export function categoryIllustration(project: Pick<Project, 'title' | 'category'>): Illustration {
  const illustration = illustrations[categories[project.category]]!;
  return {
    src: illustration.src,
    alt: `A simple ${project.category === 'ai' ? 'conversation' : project.category === 'systems' ? 'shield' : project.category === 'fullstack' ? 'workspace' : 'laptop'} illustration for ${project.title}; not a product screenshot.`,
  };
}
