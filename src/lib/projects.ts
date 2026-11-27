import { profile, type Project } from '../data/portfolio';

/** Search the current published project fields, not external links or private CMS records. */
export function matchesProjectSearch(project: Project, query: string): boolean {
  const normalize = (value: string) => value.normalize('NFKC').toLowerCase();
  const terms = normalize(query).trim().split(/\s+/u).filter(Boolean);
  const text = normalize(
    [
      project.title,
      project.kind,
      project.category,
      project.context,
      project.description,
      project.problem,
      project.architecture,
      project.impact,
      ...project.tags,
    ].join(' '),
  );
  return terms.every((term) => text.includes(term));
}

export function createSourceRequestLink(
  projectTitle: string,
  contact: { name: string; email: string } = profile,
): string {
  const subject = encodeURIComponent(`Source access / walkthrough: ${projectTitle}`);
  const body = encodeURIComponent(
    `Hi ${contact.name.split(' ')[0]},\n\nI’d like to learn more about ${projectTitle}. Could you share a walkthrough or source access?\n\nThanks!`,
  );
  return `mailto:${contact.email}?subject=${subject}&body=${body}`;
}

export function projectExcerpt(text: string, length = 145) {
  if (text.length <= length) return text;
  const sliced = text.slice(0, length + 1);
  const boundary = sliced.lastIndexOf(' ');
  return `${sliced.slice(0, boundary > length / 2 ? boundary : length).trimEnd()}…`;
}
