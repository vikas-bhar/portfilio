import { z } from 'zod';

const text = (max = 1000) => z.string().trim().max(max);
const requiredText = (max = 200) => text(max).min(1, 'This field is required.');
const id = z.string().regex(/^[a-z][a-z0-9-]{0,79}$/, 'Use a lowercase, hyphenated ID.');
const httpsUrl = z
  .string()
  .max(2000)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && !url.username && !url.password;
    } catch {
      return false;
    }
  }, 'Enter a complete HTTPS URL without embedded credentials.');
const githubUrl = httpsUrl.refine((value) => {
  try {
    const url = new URL(value);
    return (
      url.hostname === 'github.com' &&
      url.pathname.split('/').filter(Boolean).length === 2 &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}, 'Use a github.com repository URL.');
const date = z.iso.date({ error: 'Use a valid YYYY-MM-DD date.' });

export const projectDemoSchema = z.discriminatedUnion('availability', [
  z.object({ availability: z.literal('verified'), url: httpsUrl, verifiedOn: date }),
  z.object({ availability: z.literal('unverified'), url: httpsUrl, reason: requiredText(1000) }),
  z.object({
    availability: z.literal('unavailable'),
    reason: requiredText(1000),
    url: httpsUrl.optional(),
  }),
]);
export const projectSourceSchema = z.discriminatedUnion('availability', [
  z.object({ availability: z.literal('public'), url: githubUrl }),
  z.object({
    availability: z.literal('private'),
    url: githubUrl.optional(),
    reason: requiredText(1000),
  }),
  z.object({ availability: z.literal('unverified'), reason: requiredText(1000) }),
]);
export const projectCoverImageSchema = z.object({
  src: z
    .string()
    .max(2000)
    .refine(
      (value) =>
        /^\/projects\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|gif|svg)$/.test(value) ||
        httpsUrl.safeParse(value).success,
      'Use an HTTPS image URL or a local /projects/ image path.',
    ),
  alt: requiredText(300),
});
export const projectScreenshotSchema = z.object({
  src: z
    .string()
    .max(2000)
    .refine(
      (value) =>
        /^\/projects\/[a-zA-Z0-9/_-]+\.(png|jpe?g|webp|gif)$/.test(value) ||
        httpsUrl.safeParse(value).success,
      'Use an HTTPS image URL or a local /projects/ image path.',
    ),
  alt: requiredText(300),
  width: z.number().int().min(32).max(8192),
  height: z.number().int().min(32).max(8192),
  capturedOn: date,
});
export const projectSchema = z.object({
  id,
  title: requiredText(160),
  category: z.enum(['ai', 'systems', 'fullstack', 'web']),
  kind: requiredText(160),
  context: text(400),
  description: requiredText(3000),
  problem: text(4000),
  architecture: text(4000),
  impact: text(4000),
  featured: z.boolean(),
  visible: z.boolean(),
  tags: z.array(requiredText(100)).max(16),
  stages: z.array(z.object({ label: requiredText(80), detail: text(200) })).max(5),
  demo: projectDemoSchema,
  source: projectSourceSchema,
  evidenceNote: text(2000),
  coverImage: projectCoverImageSchema.optional(),
  screenshot: projectScreenshotSchema.optional(),
});

export const sectionIds = [
  'home',
  'project',
  'my-skill',
  'about-me',
  'experience',
  'contact',
] as const;
export const copyKeys = [
  'availability',
  'heroEyebrow',
  'builderNoteTitle',
  'builderNoteDetail',
  'workEyebrow',
  'workTitle',
  'workAccent',
  'workSummary',
  'skillsEyebrow',
  'skillsTitle',
  'skillsAccent',
  'skillsSummary',
  'skillsNote',
  'aboutEyebrow',
  'aboutTitle',
  'aboutAccent',
  'aboutLink',
  'experienceEyebrow',
  'experienceTitle',
  'experienceAccent',
  'experienceSummary',
  'contactEyebrow',
  'contactTitle',
  'contactAccent',
  'contactDescription',
  'contactAvailability',
  'footerTagline',
  'footerSignoff',
  'wordmark',
  'wordmarkSuffix',
] as const;

function contrast(hex: string, background: string) {
  const luminance = (color: string) => {
    const channels = color
      .slice(1)
      .match(/../g)!
      .map((part) => parseInt(part, 16) / 255)
      .map((channel) =>
        channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
      );
    return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
  };
  const a = luminance(hex);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
const color = (background: string) =>
  z
    .string()
    .regex(/^#[a-fA-F0-9]{6}$/, 'Use a six-digit hex color.')
    .refine(
      (value) => /^#[a-fA-F0-9]{6}$/.test(value) && contrast(value, background) >= 4.5,
      'Choose a color with at least 4.5:1 contrast against this theme.',
    );

export const siteContentSchema = z
  .object({
    schemaVersion: z.literal(1),
    profile: z.object({
      name: requiredText(120),
      role: requiredText(160),
      headline: text(300),
      location: text(180),
      email: z.email().max(254),
      github: httpsUrl,
      linkedin: httpsUrl,
      website: httpsUrl,
      heroSummary: requiredText(1500),
      summary: requiredText(3000),
      about: z.array(requiredText(2000)).min(1).max(8),
    }),
    projects: z.array(projectSchema).min(1).max(60),
    skillGroups: z
      .array(
        z.object({
          id,
          title: requiredText(160),
          subtitle: text(500),
          skills: z.array(requiredText(150)).min(1).max(24),
        }),
      )
      .min(1)
      .max(12),
    milestones: z
      .array(
        z.object({
          id,
          category: text(160),
          title: requiredText(200),
          organization: text(300),
          description: text(3000),
          highlights: z.array(requiredText(150)).max(16),
        }),
      )
      .max(30),
    focusAreas: z.array(z.object({ title: requiredText(160), description: text(1500) })).max(6),
    buildPath: z
      .array(z.object({ title: requiredText(120), detail: text(500) }))
      .min(1)
      .max(5),
    sections: z
      .array(z.object({ id: z.enum(sectionIds), label: requiredText(40), visible: z.boolean() }))
      .length(sectionIds.length),
    copy: z.object(
      Object.fromEntries(copyKeys.map((key) => [key, text(1500)])) as Record<
        (typeof copyKeys)[number],
        ReturnType<typeof text>
      >,
    ),
    settings: z.object({
      metaDescription: requiredText(500),
      accentDark: color('#101214'),
      accentLight: color('#efefea'),
      defaultTheme: z.enum(['dark', 'light']),
      animations: z.boolean(),
      resumeEnabled: z.boolean(),
    }),
  })
  .superRefine((content, context) => {
    for (const key of ['projects', 'skillGroups', 'milestones', 'sections'] as const) {
      const ids = content[key].map((item) => item.id);
      if (new Set(ids).size !== ids.length)
        context.addIssue({
          code: 'custom',
          path: [key],
          message: 'Every item must have a unique ID.',
        });
    }
    if (content.sections[0]?.id !== 'home' || !content.sections[0]?.visible)
      context.addIssue({
        code: 'custom',
        path: ['sections'],
        message: 'Home must stay first and visible.',
      });
    const headings = {
      project: ['workTitle', 'workAccent'],
      'my-skill': ['skillsTitle', 'skillsAccent'],
      'about-me': ['aboutTitle', 'aboutAccent'],
      experience: ['experienceTitle', 'experienceAccent'],
      contact: ['contactTitle', 'contactAccent'],
    } as const;
    for (const section of content.sections) {
      if (section.id === 'home' || !section.visible) continue;
      const [title, accent] = headings[section.id];
      if (!content.copy[title] && !content.copy[accent])
        context.addIssue({
          code: 'custom',
          path: ['copy', title],
          message: 'Provide at least one heading line for this visible section.',
        });
    }
  })
  .transform((content) => ({
    ...content,
    profile: { ...content.profile, headline: `${content.profile.name} — ${content.profile.role}` },
  }));

export type Project = z.infer<typeof projectSchema>;
export type ProjectCategory = Project['category'];
export type ProjectDemo = z.infer<typeof projectDemoSchema>;
export type ProjectSource = z.infer<typeof projectSourceSchema>;
export type ProjectScreenshot = z.infer<typeof projectScreenshotSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
export interface ContentRecord {
  revision: string;
  updatedAt: string | null;
  content: SiteContent;
}
export interface DraftRecord extends ContentRecord {
  baseRevision: string;
}
export interface AdminSession {
  authenticated: boolean;
  setupRequired: boolean;
  storage: 'local' | 'vercel-blob' | 'unconfigured';
  csrfToken?: string;
  expiresAt?: number;
}
