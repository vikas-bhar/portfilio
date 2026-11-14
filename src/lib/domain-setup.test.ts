// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { profile } from '../data/portfolio';

interface RegistryEntry {
  owner: { username: string };
  records: Record<string, unknown>;
}

const directory = new URL('../../docs/is-a-dev/domains/', import.meta.url);
const readRecord = (filename: string) =>
  JSON.parse(readFileSync(new URL(filename, directory), 'utf8')) as RegistryEntry;

describe('vikas-portfolio.is-a.dev registration package', () => {
  it('uses the exact approved free subdomain, GitHub owner, and Vercel-recommended A record', () => {
    expect(profile.website).toBe('https://vikas-portfolio.is-a.dev');
    expect(readRecord('vikas-portfolio.json')).toEqual({
      owner: { username: new URL(profile.github).pathname.slice(1) },
      records: { A: ['216.198.79.1'] },
    });
  });

  it('uses the real Vercel-issued TXT value for this exact hostname, not a placeholder or typo', () => {
    expect(readRecord('_vercel.vikas-portfolio.json')).toEqual({
      owner: { username: 'vikas-bhar' },
      records: {
        TXT: 'vc-domain-verify=vikas-portfolio.is-a.dev,ad8f84217bc43c92f33f',
      },
    });
  });

  it('keeps only the selected domain records active and preserves old mail data in the archive', () => {
    expect(readdirSync(directory).sort()).toEqual([
      '_vercel.vikas-portfolio.json',
      'vikas-portfolio.json',
    ]);
    const archived = JSON.parse(
      readFileSync(
        new URL('../../docs/archive/is-a-dev/domains/vikas.json', import.meta.url),
        'utf8',
      ),
    ) as RegistryEntry;
    expect(archived.owner).toEqual({ username: 'vikki-k-s' });
    expect(archived.records.MX).toEqual([
      { target: 'mx.zoho.in', priority: 10 },
      { target: 'mx2.zoho.in', priority: 20 },
      { target: 'mx3.zoho.in', priority: 50 },
    ]);
    expect(archived.records.TXT).toEqual([
      'a7f49a87d1377abd3a39adcd784305',
      'zoho-verification=zb60958690.zmverify.zoho.in',
      'v=spf1 include:zoho.in ~all',
    ]);
  });
});
