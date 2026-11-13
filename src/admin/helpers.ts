import { siteContentSchema, type SiteContent, type Project } from '../lib/site-schema';

export const today = () => new Date().toISOString().slice(0, 10);
export const uniqueId = (prefix: string) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
export function moveItem<T>(items: readonly T[], index: number, direction: -1 | 1): T[] {
  const next = items.slice();
  const target = index + direction;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target]!, next[index]!];
  return next;
}
export function blankProject(): Project {
  return {
    id: uniqueId('project'),
    title: 'New project',
    category: 'web',
    kind: 'Web application',
    context: '',
    description: 'Add a short, factual description of this project.',
    problem: '',
    architecture: '',
    impact: '',
    featured: false,
    visible: false,
    tags: [],
    stages: [],
    demo: { availability: 'unavailable', reason: 'No public demo has been supplied yet.' },
    source: { availability: 'unverified', reason: 'No public repository has been confirmed yet.' },
    evidenceNote: '',
  };
}
export function normalizeContent(content: SiteContent) {
  const clean = (values: string[]) => values.map((value) => value.trim()).filter(Boolean);
  return siteContentSchema.safeParse({
    ...content,
    projects: content.projects.map((project) => ({ ...project, tags: clean(project.tags) })),
    skillGroups: content.skillGroups.map((group) => ({ ...group, skills: clean(group.skills) })),
    milestones: content.milestones.map((milestone) => ({
      ...milestone,
      highlights: clean(milestone.highlights),
    })),
    profile: { ...content.profile, about: clean(content.profile.about) },
  });
}
export function downloadBackup(content: SiteContent) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = `portfolio-content-${today()}.json`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function notifySite() {
  if (typeof BroadcastChannel !== 'undefined') {
    const channel = new BroadcastChannel('portfolio-content');
    channel.postMessage('refresh');
    channel.close();
  }
}
export function formatTime(value: string | null) {
  return value
    ? new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'Factory content · not published yet';
}
