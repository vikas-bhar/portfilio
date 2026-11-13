import { defaultContent } from '../data/portfolio';
import type { SiteContent } from './site-schema';

export function createResumeText(content: SiteContent = defaultContent): string {
  const { profile, skillGroups, milestones } = content;
  const projects = content.projects.filter((project) => project.visible);
  const skills = skillGroups
    .map((group) => `${group.title.toUpperCase()}\n${group.skills.join(', ')}`)
    .join('\n\n');
  const work = projects
    .map((project, index) => {
      const demo =
        project.demo.availability !== 'unavailable'
          ? `${project.demo.url} (${project.demo.availability === 'verified' ? `public page checked ${project.demo.verifiedOn}` : 'provided URL, not independently checked'})`
          : `Unavailable — ${project.demo.reason}`;
      const source =
        project.source.availability === 'public'
          ? project.source.url
          : project.source.availability === 'private'
            ? `Private repository — request access: ${profile.email}`
            : `Unverified — request a walkthrough: ${profile.email}`;
      return (
        `${index + 1}. ${project.title}\n` +
        `   ${project.context}\n` +
        `   ${project.tags.join(' | ')}\n` +
        (project.problem ? `   Problem: ${project.problem}\n` : `   ${project.description}\n`) +
        (project.architecture ? `   Architecture: ${project.architecture}\n` : '') +
        (project.impact ? `   Impact: ${project.impact}\n` : '') +
        `   Live demo: ${demo}\n` +
        `   GitHub: ${source}\n` +
        `   Verification: ${project.evidenceNote}`
      );
    })
    .join('\n\n');
  const experience = milestones
    .map((milestone) => `${milestone.title}\n${milestone.organization}\n${milestone.description}`)
    .join('\n\n');

  return `${profile.name.toUpperCase()}
${profile.role}
${profile.location}

Email: ${profile.email}
Portfolio: ${profile.website}
GitHub: ${profile.github}
LinkedIn: ${profile.linkedin}

PROFESSIONAL SUMMARY
--------------------
${profile.summary}

TECHNICAL CAPABILITIES
--------------------
${skills}

PROJECTS & SELECTED WORK
--------------------
${work}

EXPERIENCE & MILESTONES
--------------------
${experience}
`;
}

export function resumeFileStem(name: string): string {
  return `${
    name
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
      .slice(0, 80) || 'Portfolio'
  }_Resume`;
}
