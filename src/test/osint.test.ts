import { describe, expect, it } from 'vitest';
import { seedJobs } from '../data/profiles';
import { archivePlatforms, crawlDuration, isOverdue, jobCount, jobProgress, loadArchive, matchProfiles, STORAGE_KEY } from '../lib/osint';
import { initialState, reducer } from '../state/reducer';
import type { CrawlJob } from '../types';

const ALL = ['facebook', 'instagram', 'x', 'tiktok', 'youtube'] as const;

describe('matchProfiles', () => {
  it('name mode matches part of a name or username', () => {
    const ids = matchProfiles({ mode: 'name', term: 'mira', platforms: [...ALL], fbScope: 'Users' }).map((p) => p.id);
    expect(ids).toContain('mira-fb-group');
    expect(ids).toContain('mira-fb-3'); // Amira
  });
  it('username mode is exact and narrows Facebook to the chosen category', () => {
    const q = { mode: 'username' as const, term: '@harbor.watch', platforms: [...ALL] };
    expect(matchProfiles({ ...q, fbScope: 'Groups' }).map((p) => p.id)).toEqual(['harbor-fb-group', 'harbor-tiktok']);
    expect(matchProfiles({ ...q, fbScope: 'Pages' }).map((p) => p.id)).toEqual(['harbor-fb-page', 'harbor-tiktok']);
    expect(matchProfiles({ ...q, term: 'harbor', fbScope: 'Groups' })).toEqual([]);
  });
  it('blank terms match nothing', () => {
    expect(matchProfiles({ mode: 'name', term: '  ', platforms: [...ALL], fbScope: 'Users' })).toEqual([]);
  });
});

describe('crawl progress', () => {
  const job: CrawlJob = { id: 'J', profileId: 'mira-fb', status: 'In Progress', limit: 200, collect: ['Posts'], via: '', collected: 0, startedAt: 0, duration: 100_000 };
  it('runs between 2% and 98% while in progress and counts items from it', () => {
    expect(jobProgress(job, 0)).toBe(2);
    expect(jobProgress(job, 50_000)).toBe(50);
    expect(jobCount(job, 50_000)).toBe(100);
    expect(jobProgress(job, 999_999)).toBe(98);
  });
  it('completed and failed jobs report fixed values', () => {
    expect(jobCount({ ...job, status: 'Completed', collected: 77 }, 0)).toBe(77);
    expect(jobProgress({ ...job, status: 'Failed' }, 50_000)).toBe(0);
  });
  it('duration is clamped between 45 s and 30 min', () => {
    expect(crawlDuration(1)).toBe(45_000);
    expect(crawlDuration(5000)).toBe(30 * 60_000);
  });
  it('completeOverdue finishes only overdue running jobs', () => {
    const s = initialState([job, { ...job, id: 'K', startedAt: 90_000 }]);
    expect(isOverdue(job, 100_000)).toBe(true);
    const next = reducer(s, { type: 'completeOverdue', now: 100_000 });
    expect(next.social.archive.map((j) => [j.status, j.collected])).toEqual([['Completed', 200], ['In Progress', 0]]);
  });
});

describe('loadArchive', () => {
  const store = (v: string | null) => ({ getItem: (k: string) => (k === STORAGE_KEY ? v : null) });
  it('falls back to the seed for missing, corrupt or malformed data', () => {
    expect(loadArchive(store(null), 0)).toHaveLength(24);
    expect(loadArchive(store('{nope'), 0)).toHaveLength(24);
    expect(loadArchive(store(JSON.stringify([{ id: 1 }])), 0)).toHaveLength(24);
  });
  it('keeps valid saved jobs', () => {
    const saved = seedJobs(0).slice(0, 2);
    expect(loadArchive(store(JSON.stringify(saved)), 0)).toEqual(saved);
  });
  it('lists jobs from platforms outside the search list', () => {
    expect(archivePlatforms([{ ...seedJobs(0)[0], profileId: 'atlas-telegram' }])).toContain('telegram');
  });
});
