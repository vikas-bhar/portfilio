import { createContext } from 'react';
import { defaultContent } from '../data/portfolio';
import type { SiteContent } from '../lib/site-schema';

export const SiteContext = createContext<{
  content: SiteContent;
  revision: string;
  previewMode: boolean;
  loadError: string | null;
}>({ content: defaultContent, revision: 'initial', previewMode: false, loadError: null });
