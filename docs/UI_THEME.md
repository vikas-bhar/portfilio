# Editorial studio UI theme

The public portfolio adopts the warm editorial / creative-studio direction of the [supplied UI reference](https://enosh-portfolio-six.vercel.app/creative-work): charcoal, parchment, mustard details, expressive headings, understated category filters, and artwork-led project captions.

This is a **presentation change**, not a content import or a deployment/domain change.

## Implementation

- `src/styles/base.css`: shared warm dark/light palette and type tokens.
- `src/styles/studio.css`: public layout, paper treatments, gallery, supporting sections, navigation, and responsive rules. It replaces the previous `simple.css` presentation layer.
- `src/styles/fonts.css`: self-hosted Latin variable DM Sans (body), Bricolage Grotesque (headings), Fraunces (editorial nameplates), plus the existing Geist/Geist Mono fonts. The font packages include their OFL licenses.
- `src/components/HeroArtwork.tsx`: original, decorative notebook drawing built from inline SVG and the existing build-path content. It is hidden from assistive technology and omitted at small viewport sizes.
- `public/paper-grain.svg`: original repeatable procedural paper texture; no remote image requests.
- `Hero.tsx`: the existing name and role presented as cut-paper nameplates. The heading text still comes entirely from the editable profile.
- `Projects.tsx` / `src/styles/project-archive.css`: the reference home page’s Projects layout, adapted as a searchable two-column archive of torn-paper project files. Each file pairs a numbered mounted illustration/capture with its category, title, summary, technology chips, and an arrow disclosure. The existing editable heading/introduction remain in use; no reference project content or assets are imported.
- `src/lib/projects.ts`: case-insensitive, Unicode-normalized, multi-keyword matching across the published project fields. Search and category filters work together; counts, clear/Escape, empty-state reset, and keyboard focus recovery are supported. Hidden projects are excluded before searching.
- `ProjectCard.tsx`: independent in-place details instead of inventing case-study destinations. Genuine captures, illustration labels, original demo/source availability, and request-access actions remain separate and honest.

## Preserved behavior

All eleven factory projects and four flagships, their order/visibility, evidence labels, illustrations and genuine-capture support are unchanged. No images or project descriptions were taken from the reference. No developer portrait was restored.

The original scene, wires, floats, pointer tilt, reduced-motion preference, WebGL fallback, and owner animation switch remain. Theme choice still persists, both themes remain available, and existing published appearance settings remain authoritative. The factory accent defaults are now mustard/rust; stored CMS content is not reset or rewritten.

Admin access remains **three-line menu → Admin login**, never a standalone public link. Authentication, server-side drafts/private preview/publishing, metadata, dynamic résumés, contact-mail handoff, and domain-registration files are unchanged. No Vercel project settings, domains, redirects, or deployments are modified by this theme.

## Checking changes

```sh
npm run check
npm run build
npm run test:e2e
```

The browser suite checks desktop/mobile layouts, navigation, keyboard interactions, project expansion, published content, theme persistence, motion fallbacks, contact/résumé behavior, and axe accessibility in both palettes. The `studio-theme` browser checks additionally cover narrow/tablet/wide viewport reflow and the editorial typography/paper treatments.
