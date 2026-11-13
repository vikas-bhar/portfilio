// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface RegistryEntry {
  owner: { username: string };
  records: {
    A?: string[];
    MX?: { target: string; priority: number }[];
    TXT?: string | string[];
    CNAME?: string;
  };
}

const readRecord = (filename: string) =>
  JSON.parse(
    readFileSync(new URL(`../../docs/is-a-dev/domains/${filename}`, import.meta.url), 'utf8'),
  ) as RegistryEntry;

describe('vikas.is-a.dev connection package', () => {
  it('prepares the owner-supplied A routing without a CNAME that would conflict with existing mail records', () => {
    const entry = readRecord('vikas.json');
    expect(entry.records.A).toEqual(['216.198.79.1']);
    expect(entry.records).not.toHaveProperty('CNAME');
  });

  it('preserves the confirmed registered owner and every existing Zoho/mail/verification record', () => {
    const entry = readRecord('vikas.json');
    expect(entry.owner).toEqual({ username: 'vikki-k-s' });
    expect(entry.records.MX).toEqual([
      { target: 'mx.zoho.in', priority: 10 },
      { target: 'mx2.zoho.in', priority: 20 },
      { target: 'mx3.zoho.in', priority: 50 },
    ]);
    expect(entry.records.TXT).toEqual([
      'a7f49a87d1377abd3a39adcd784305',
      'zoho-verification=zb60958690.zmverify.zoho.in',
      'v=spf1 include:zoho.in ~all',
    ]);
  });

  it('keeps pending Vercel verification in a clearly unfinished, separate-host example', () => {
    const example = readRecord('_vercel.vikas.json.example');
    expect(example.owner).toEqual({ username: 'vikki-k-s' });
    expect(example.records).toEqual({
      TXT: 'REPLACE_WITH_THE_EXACT_VERIFICATION_TXT_VALUE_FROM_VERCEL',
    });
    expect(readRecord('vikas.json').records.TXT).not.toContain(example.records.TXT);
  });
});
