import { describe, it, expect } from 'vitest';
import { filterDrafts } from '../src/draftFilter';

const drafts = [
  { filename: 'deploy-prod-2026.md', sessionId: '1', type: 'runbook' },
  { filename: 'db-migration.md', sessionId: '2', type: 'runbook' },
  { filename: 'PROD-incident.md', sessionId: '3', type: 'incident' },
];

describe('filterDrafts', () => {
  it('returns all drafts for an empty query', () => {
    expect(filterDrafts(drafts, '')).toHaveLength(3);
    expect(filterDrafts(drafts, '   ')).toHaveLength(3);
  });

  it('filters case-insensitively by substring', () => {
    expect(filterDrafts(drafts, 'prod').map((d) => d.filename)).toEqual([
      'deploy-prod-2026.md',
      'PROD-incident.md',
    ]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterDrafts(drafts, 'zzz')).toHaveLength(0);
  });
});
