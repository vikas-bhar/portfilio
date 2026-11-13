import { profile } from '../data/portfolio';

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
