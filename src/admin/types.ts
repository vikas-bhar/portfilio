import type { SiteContent } from '../lib/site-schema';
export type EditorSection =
  | 'overview'
  | 'profile'
  | 'projects'
  | 'sections'
  | 'capabilities'
  | 'story'
  | 'appearance'
  | 'security';
export interface ContentEditorProps {
  content: SiteContent;
  onChange: (value: SiteContent) => void;
}
