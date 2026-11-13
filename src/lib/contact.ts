import { profile } from '../data/portfolio';

export interface ContactMessage {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

export function createMailtoLink(
  data: ContactMessage,
  contact: { name: string; email: string } = profile,
): string {
  const name = [data.firstName.trim(), data.lastName.trim()].filter(Boolean).join(' ');
  const subject = encodeURIComponent(`Portfolio inquiry from ${name || 'a new collaborator'}`);
  const body = encodeURIComponent(
    `Hi ${contact.name.split(' ')[0]},\n\n${data.message.trim()}\n\nFrom: ${name}\nEmail: ${data.email.trim()}`,
  );

  return `mailto:${contact.email}?subject=${subject}&body=${body}`;
}
