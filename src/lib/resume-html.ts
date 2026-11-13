import { defaultContent } from '../data/portfolio';
import type { SiteContent } from './site-schema';
import { resumeFileStem } from './resume';
import { createSourceRequestLink } from './projects';

export function createResumeHtml(content: SiteContent = defaultContent, preview = false): string {
  const { profile, projects, skillGroups, milestones } = content;
  const escape = (value: string) =>
    value.replace(
      /[&<>"']/g,
      (character) =>
        ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!,
    );

  const skills = skillGroups
    .map(
      (group) =>
        `<div class="skill-group"><h3>${escape(group.title)}</h3><p>${group.skills.map(escape).join(' · ')}</p></div>`,
    )
    .join('');

  const work = projects
    .filter((project) => project.visible)
    .map((project) => {
      const demo =
        project.demo.availability !== 'unavailable'
          ? `<a href="${escape(project.demo.url)}" target="_blank" rel="noopener noreferrer">Live Demo</a><span>Public page checked ${project.demo.availability === 'verified' ? escape(project.demo.verifiedOn) : 'not independently checked'}</span>`
          : '<span>Live Demo: unavailable / not verified</span>';
      const source =
        project.source.availability === 'public'
          ? `<a href="${escape(project.source.url)}" target="_blank" rel="noopener noreferrer">GitHub</a>`
          : `<span>GitHub: ${project.source.availability === 'private' ? 'private repository' : 'source unverified'}</span><a href="${escape(createSourceRequestLink(project.title, profile))}">Request source / walkthrough</a>`;
      return `<article class="project">
    <h3>${escape(project.title)}</h3>
    <p class="context">${escape(project.context)}</p>
    <p class="tech">${project.tags.map(escape).join(' · ')}</p>
    ${project.problem ? `<p><strong>Problem.</strong> ${escape(project.problem)}</p>` : `<p>${escape(project.description)}</p>`}
    ${project.architecture ? `<p><strong>Architecture.</strong> ${escape(project.architecture)}</p>` : ''}
    ${project.impact ? `<p><strong>Impact.</strong> ${escape(project.impact)}</p>` : ''}
    <div class="project-links">${demo}${source}</div>
    <p class="verification">${escape(project.evidenceNote)}</p>
  </article>`;
    })
    .join('');

  const experience = milestones
    .map(
      (milestone) =>
        `<article class="milestone"><h3>${escape(milestone.title)}</h3><p class="context">${escape(milestone.organization)}</p><p>${escape(milestone.description)}</p></article>`,
    )
    .join('');

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${escape(profile.headline)}. Printable résumé and selected product-engineering work." />
  <meta name="color-scheme" content="light" />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <title>${escape(profile.name)} — Résumé</title>
  ${preview ? '<meta name="robots" content="noindex, nofollow" />' : ''}
  <style>
    * { box-sizing: border-box; }
    :root { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #24332a; background: #eeeee8; font-size: 14px; line-height: 1.7; color-scheme: light; }
    body { margin: 0; padding: 28px 20px 50px; }
    a { color: #326146; text-underline-offset: 3px; overflow-wrap: anywhere; }
    a:hover { color: #183d28; }
    h1, h2, h3, p { margin: 0; }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 22px; }
    .button { border-radius: 5px; padding: 10px 18px; font: inherit; font-size: 12px; border: 1px solid #bac6b9; background: #fff; color: #24332a; cursor: pointer; text-decoration: none; }
    .button-primary { background: #243d2c; color: #fff; border-color: #243d2c; }
    .document { background: white; width: 100%; max-width: 850px; padding: 46px 52px; margin: 0 auto; border: 1px solid #d7ded3; border-radius: 7px; box-shadow: 0 8px 30px rgb(35 50 39 / 5%); }
    header { border-bottom: 1px solid #d7ded3; padding-bottom: 25px; }
    .eyebrow { font-size: 9px; letter-spacing: 1.8px; color: #5b715f; margin-bottom: 13px; }
    h1 { font-size: 36px; line-height: 1.2; letter-spacing: -1.3px; font-weight: 650; }
    .role { margin-top: 8px; font-size: 16px; color: #4e6b55; }
    .location { margin-top: 5px; }
    .contact { display: flex; gap: 17px; flex-wrap: wrap; margin-top: 15px; font-size: 11px; }
    section { margin-top: 25px; }
    h2 { color: #4e6b55; text-transform: uppercase; font-size: 11px; letter-spacing: 1.2px; border-bottom: 1px solid #d7ded3; padding-bottom: 7px; margin-bottom: 12px; }
    h3 { font-size: 14px; font-weight: 650; line-height: 1.5; }
    p { color: #536158; font-size: 12px; }
    .skills { display: grid; grid-template-columns: 1fr 1fr; gap: 13px 25px; }
    .skill-group { break-inside: avoid; }
    .skill-group h3 { font-size: 12px; margin-bottom: 3px; }
    .skill-group p { font-size: 11px; }
    .project { margin-bottom: 20px; break-inside: avoid; }
    .project > p:not(.context):not(.tech):not(.verification) { margin-top: 6px; }
    .project strong { font-weight: 600; color: #24332a; }
    .context { font-size: 10px; color: #4e6b55; margin-top: 3px; }
    .tech { color: #4e6b55; font-size: 10px; margin: 3px 0 7px; }
    .project-links { display: flex; flex-wrap: wrap; gap: 5px 14px; font-size: 10px; color: #536158; margin-top: 8px; }
    .verification { font-size: 9px; margin-top: 6px; }
    .milestone { break-inside: avoid; margin-bottom: 14px; }
    .milestone > p:last-child { margin-top: 5px; }
    .print-note { text-align: center; margin: 18px auto 0; max-width: 600px; color: #68796a; font-size: 11px; }
    @media (max-width: 600px) { body { padding: 20px 12px 30px; } .document { padding: 28px 23px; } h1 { font-size: 29px; } .contact { gap: 9px 14px; } .skills { grid-template-columns: 1fr; } }
    @page { size: A4; margin: 16mm; }
    @media print { :root { background: white; } body { padding: 0; } .actions, .print-note { display: none; } .document { border: 0; box-shadow: none; border-radius: 0; padding: 0; max-width: none; } a { color: #326146; } h2 { break-after: avoid; } .skills { grid-template-columns: 1fr 1fr; } }
  </style>
</head>
<body>
  ${preview ? '<p class="print-note">PRIVATE DRAFT — not published</p>' : ''}
  <nav class="actions" aria-label="Résumé actions">
    <button type="button" class="button button-primary" onclick="window.print()">Print / Save as PDF</button>
    <a class="button" href="/api/resume/text${preview ? '?preview=draft' : ''}" download="${resumeFileStem(profile.name)}.txt">Download text</a>
    <a class="button" href="/">Back to portfolio</a>
  </nav>
  <main class="document">
    <header>
      <p class="eyebrow">FULL-STACK / APPLIED AI / SYSTEMS</p>
      <h1>${escape(profile.name)}</h1>
      <p class="role">${escape(profile.role)}</p>
      <p class="location">${escape(profile.location)}</p>
      <div class="contact">
        <a href="mailto:${escape(profile.email)}">${escape(profile.email)}</a>
        <a href="${escape(profile.website)}" target="_blank" rel="noopener noreferrer">Portfolio</a>
        <a href="${escape(profile.github)}" target="_blank" rel="noopener noreferrer">GitHub</a>
        <a href="${escape(profile.linkedin)}" target="_blank" rel="noopener noreferrer">LinkedIn</a>
      </div>
    </header>
    <section aria-labelledby="summary"><h2 id="summary">Professional summary</h2><p>${escape(profile.summary)}</p></section>
    <section aria-labelledby="skills"><h2 id="skills">Technical capabilities</h2><div class="skills">${skills}</div></section>
    <section aria-labelledby="work"><h2 id="work">Projects &amp; selected work</h2>${work}</section>
    <section aria-labelledby="experience"><h2 id="experience">Experience & milestones</h2>${experience}</section>
  </main>
  <p class="print-note">Choose “Save as PDF” in your browser’s print dialog to save a PDF copy.</p>
</body>
</html>
`;

  return html.replace(/[ \t]+$/gm, '');
}
