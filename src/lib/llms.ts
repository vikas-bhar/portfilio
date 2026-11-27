import type { Project, SiteContent } from './site-schema';
import { projectIllustration } from './project-images';

export const llmsPaths = {
  index: '/llms.txt',
  full: '/llms-full.txt',
  markdown: '/index.md',
} as const;

const evidenceContext =
  'This is owner-published portfolio information, not independent certification. A checked public page is not an end-to-end product test. Preserve prototype, unavailable-demo, private-source, and unverified-evidence qualifications; illustrations and architecture diagrams are not working-UI screenshots.';

// Owner copy is literal text, not Markdown syntax or additional generated links.
const text = (value: string) =>
  value
    .trim()
    .replace(/\s+/gu, ' ')
    .replace(/[\\`*_[\]<>#|]/g, '\\$&');
const link = (label: string, href: string) =>
  `[${text(label)}](${href.replace(/[\s<>()]/gu, (character) =>
    character === '(' ? '%28' : character === ')' ? '%29' : encodeURIComponent(character),
  )})`;
const document = (parts: string[]) => parts.filter(Boolean).join('\n\n') + '\n';
const list = (values: string[]) => values.filter(Boolean).join('\n');
const field = (label: string, value: string) => (value ? `- ${label}: ${text(value)}` : '');
const categoryLabels = {
  ai: 'Applied AI',
  systems: 'Systems',
  fullstack: 'Full-stack',
  web: 'Web',
} as const;

function identity(content: SiteContent) {
  return `# ${text(content.profile.name)}\n\n> ${text(content.profile.role)}${content.profile.location ? ` — ${text(content.profile.location)}` : ''}`;
}

function resources(content: SiteContent) {
  return list([
    `- ${link('Complete portfolio text', llmsPaths.full)}: Full published profile, visible projects, capabilities, About, experience, and evidence notes in Markdown.`,
    `- ${link('Markdown page', llmsPaths.markdown)}: The same complete portfolio as a text/markdown resource; no JavaScript required.`,
    ...(content.settings.resumeEnabled
      ? [
          `- ${link('Plain-text résumé', '/api/resume/text')}: Published résumé export.`,
          `- ${link('Printable résumé', '/api/resume/html')}: Published HTML with Print / Save as PDF.`,
        ]
      : []),
  ]);
}

/** Small llms.txt index. Root-relative resource links also work on preview/deployment hosts. */
export function createLlmsIndex(content: SiteContent): string {
  const { profile } = content;
  return document([
    identity(content),
    text(profile.summary),
    'These resources are generated from the current published portfolio. They do not contain unpublished drafts or authentication data. Links beginning with / resolve on the host serving this document.',
    evidenceContext,
    '## Portfolio resources',
    resources(content),
    '## Optional',
    list([
      `- ${link('Portfolio website', profile.website)}: Configured canonical profile URL.`,
      `- ${link('GitHub profile', profile.github)}: Owner identity; not a substitute for an individual project source link.`,
      `- ${link('LinkedIn', profile.linkedin)}: Professional profile.`,
      `- ${link('Contact by email', `mailto:${profile.email}`)}: Project walkthrough and source-access requests.`,
    ]),
  ]);
}

function projectText(project: Project, content: SiteContent) {
  const demo = project.demo;
  const source = project.source;
  const capture = project.screenshot;
  const cover = project.coverImage ?? projectIllustration(project);
  return document([
    `### ${text(project.title)}`,
    list([
      field('Category', categoryLabels[project.category]),
      field('Focus', project.kind),
      field('Featured', project.featured ? 'Yes' : 'No'),
      field('Context', project.context),
      field('Description', project.description),
      field('Problem', project.problem),
      field('Architecture', project.architecture),
      field('Impact (owner-described)', project.impact),
      field('Technologies', project.tags.join(' | ')),
      ...(project.stages.length
        ? [
            field(
              'Architecture flow',
              project.stages
                .map((stage) => `${stage.label}${stage.detail ? `: ${stage.detail}` : ''}`)
                .join(' → '),
            ),
          ]
        : []),
      demo.availability === 'unavailable'
        ? field('Live demo', `Unavailable — ${demo.reason}`)
        : `- Live demo: ${link('Provided demo', demo.url)} — ${
            demo.availability === 'verified'
              ? `public page checked ${demo.verifiedOn}; not an end-to-end verification.`
              : `not independently verified. ${text(demo.reason)}`
          }`,
      source.availability === 'public'
        ? `- Source: ${link('Public GitHub repository', source.url)}.`
        : field(
            'Source',
            `${source.availability === 'private' ? 'Private repository' : 'Unverified source'} — ${source.reason}`,
          ),
      ...(source.availability === 'public'
        ? []
        : [
            `- Source access: ${link('Request a walkthrough or repository access', `mailto:${content.profile.email}`)}.`,
          ]),
      field('Verification note', project.evidenceNote),
      capture
        ? `- Working-UI capture: ${link(capture.alt, capture.src)} — owner-supplied; capture date ${capture.capturedOn}. The image is not independent verification of the product.`
        : `- Project image: ${link(cover.alt, cover.src)} — ${project.coverImage ? 'owner-supplied cover image' : 'thematic illustration'}, not a working-UI screenshot. No working-UI capture has been supplied.`,
    ]),
  ]).trimEnd();
}

/** An explicit public projection, never a serialized CMS record or a draft export. */
export function createLlmsFull(content: SiteContent): string {
  const { profile, copy } = content;
  const sections: string[] = [];
  for (const section of content.sections.filter((item) => item.visible)) {
    switch (section.id) {
      case 'home':
        sections.push(
          '## Profile',
          text(profile.heroSummary),
          text(profile.summary),
          field('Availability', copy.availability),
          '### Build approach',
          list(
            content.buildPath.map(
              (stage, index) => `${index + 1}. ${text(stage.title)} — ${text(stage.detail)}`,
            ),
          ),
          text([copy.builderNoteTitle, copy.builderNoteDetail].filter(Boolean).join(' — ')),
        );
        break;
      case 'project': {
        const projects = content.projects.filter((project) => project.visible);
        sections.push(
          '## Projects',
          text(copy.workSummary),
          `${projects.length} visible ${projects.length === 1 ? 'project' : 'projects'}; ${projects.filter((project) => project.featured).length} featured.`,
          ...projects.map((project) => projectText(project, content)),
        );
        break;
      }
      case 'my-skill':
        sections.push(
          '## Capabilities',
          text(copy.skillsSummary),
          ...content.skillGroups.map((group) =>
            document([
              `### ${text(group.title)}`,
              text(group.subtitle),
              list(group.skills.map((skill) => `- ${text(skill)}`)),
            ]).trimEnd(),
          ),
          text(copy.skillsNote),
        );
        break;
      case 'about-me':
        sections.push(
          '## About',
          ...profile.about.map(text),
          ...content.focusAreas.map((area) =>
            document([`### ${text(area.title)}`, text(area.description)]).trimEnd(),
          ),
        );
        break;
      case 'experience':
        sections.push(
          '## Experience and milestones',
          text(copy.experienceSummary),
          ...content.milestones.map((milestone) =>
            document([
              `### ${text(milestone.title)}`,
              list([
                field('Category', milestone.category),
                field('Organization', milestone.organization),
                field('Description', milestone.description),
                field('Highlights', milestone.highlights.join(' | ')),
              ]),
            ]).trimEnd(),
          ),
        );
        break;
      case 'contact':
        sections.push(
          '## Contact',
          text(copy.contactDescription),
          field('Availability', copy.contactAvailability),
          `Email: ${link(profile.email, `mailto:${profile.email}`)}. The website opens an email draft; it does not send or store contact messages.`,
        );
    }
  }
  return document([
    identity(content),
    list([
      `- Website: ${link(profile.website, profile.website)} (configured canonical profile URL).`,
      `- GitHub profile: ${link(profile.github, profile.github)}.`,
      `- LinkedIn: ${link(profile.linkedin, profile.linkedin)}.`,
      `- Email: ${link(profile.email, `mailto:${profile.email}`)}.`,
    ]),
    'This is a reading resource generated from the current published portfolio, not an action API. Unpublished drafts, hidden project/section details, private repository URLs, and authentication data are not included.',
    evidenceContext,
    ...sections,
    '## Public text resources',
    resources(content),
  ]);
}
