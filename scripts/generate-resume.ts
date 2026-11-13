import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defaultContent } from '../src/data/portfolio';
import { createResumeText } from '../src/lib/resume';
import { createResumeHtml } from '../src/lib/resume-html';

const destination = fileURLToPath(new URL('../public/resume/', import.meta.url));
await mkdir(destination, { recursive: true });
await Promise.all([
  writeFile(`${destination}Vikas_Bhardwaj_Resume.html`, createResumeHtml(), 'utf8'),
  writeFile(`${destination}Vikas_Bhardwaj_Resume.txt`, createResumeText(), 'utf8'),
]);
console.log(
  `Generated factory résumé exports with ${defaultContent.projects.length} projects. Published changes are served by /api/resume/.`,
);
