import { createContext } from 'react';
export interface FieldIssue {
  path: string;
  message: string;
}
export const FieldIssuesContext = createContext<FieldIssue[]>([]);

export const fieldId = (path: string) => `admin-${path.replace(/[^a-zA-Z0-9-]/g, '-')}`;
