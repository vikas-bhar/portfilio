import { useContext } from 'react';
import { SiteContext } from '../context/site-context';

export function useSiteContent() {
  return useContext(SiteContext);
}
