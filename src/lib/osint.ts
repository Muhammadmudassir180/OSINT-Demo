import { demoProfiles, seedJobs, socialPlatforms } from '../data/profiles';
import type { Category, CrawlJob, FbCategory, JobStatus, Platform, Profile, SearchMode, Tone } from '../types';

export const STORAGE_KEY = 'osint_entity_archive_demo_v6';

export const fmt = (n: number) => Number(n).toLocaleString('en-US');

const profileIndex = new Map(demoProfiles.map((p) => [p.id, p]));
export const findProfile = (id: string | null | undefined): Profile | undefined => (id ? profileIndex.get(id) : undefined);

const PLATFORM_NAMES: Record<Platform, string> = { facebook: 'Facebook', instagram: 'Instagram', x: 'X (Twitter)', tiktok: 'TikTok', youtube: 'YouTube', linkedin: 'LinkedIn', telegram: 'Telegram' };
export const platformName = (id: string) => PLATFORM_NAMES[id as Platform] ?? id;

export const FB_CATS: FbCategory[] = ['Users', 'Groups', 'Pages'];
export const FB_SCOPE_EXAMPLE: Record<FbCategory, string> = { Users: 'kara.vellin', Groups: 'harbor.watch', Pages: 'harbor.watch' };
export const CRAWL_COLLECT: Record<Category, string[]> = { Users: ['Posts'], Profile: ['Posts'], Channel: ['Posts'], Pages: ['Posts', 'Reviews'], Groups: ['Posts', 'Member list'] };

export interface MatchQuery {
  mode: SearchMode;
  term: string;
  platforms: Platform[];
  fbScope: FbCategory;
}

/** Name mode matches part of a name or username; username mode is exact, and Facebook is narrowed to one category. */
export function matchProfiles({ mode, term, platforms, fbScope }: MatchQuery): Profile[] {
  const t = term.trim().toLowerCase().replace(/^@/, '');
  if (!t) return [];
  return demoProfiles.filter(
    (p) =>
      platforms.includes(p.platform) &&
      (mode === 'name' ? p.name.toLowerCase().includes(t) || p.username.toLowerCase().includes(t) : p.username.toLowerCase() === t) &&
      (mode !== 'username' || p.platform !== 'facebook' || p.category === fbScope),
  );
}

export const statusLabel = (s: JobStatus | 'All') => (s === 'In Progress' ? 'In progress' : s);
export const statusTone = (s: JobStatus): Tone => (s === 'Completed' ? 'green' : s === 'Failed' ? 'red' : 'amber');

export function jobProgress(job: CrawlJob, now: number): number {
  if (job.status === 'Completed') return 100;
  if (job.status === 'Failed') return 0;
  return Math.min(98, Math.max(2, Math.floor(((now - job.startedAt) / job.duration) * 100)));
}

export function jobCount(job: CrawlJob, now: number): number {
  if (job.status === 'Completed') return job.collected;
  return job.status === 'Failed' ? 0 : Math.floor((jobProgress(job, now) / 100) * job.limit);
}

export const isOverdue = (job: CrawlJob, now: number) => job.status === 'In Progress' && now - job.startedAt >= job.duration;

export const profileType = (p: Profile) => (p.category === 'Channel' ? 'Channel' : { person: 'User', group: 'Group', page: 'Page' }[p.kind]);
export const shortUrl = (u: string) => u.replace(/^https?:\/\//, '');
export const jobPlatform = (job: CrawlJob): Platform | '' => findProfile(job.profileId)?.platform ?? '';

export function ago(ts: number, now: number): string {
  const m = Math.round((now - ts) / 60000);
  return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`;
}

export const archiveTime = (ts: number) => new Date(ts).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

/** The five search platforms, plus any other platform an archived job came from. */
export function archivePlatforms(jobs: CrawlJob[]): Platform[] {
  const ids: Platform[] = socialPlatforms.map((p) => p.id);
  for (const j of jobs) {
    const pl = jobPlatform(j);
    if (pl && !ids.includes(pl)) ids.push(pl);
  }
  return ids;
}

const RECORD_TEXT: Record<string, string[]> = {
  Posts: ['Post', 'Shared a public update about a community event', 'Posted photos from a local market visit', 'Reposted an article about regional freight routes', 'Announced new opening hours', 'Replied to a public thread about shipping delays'],
  'Member list': ['Member', 'Member profile reference, joined 2024', 'Admin account reference', 'Member profile reference, joined 2025', 'Moderator account reference', 'Member profile reference, joined 2023'],
  Reviews: ['Review', '4-star review mentioning delivery times', '2-star review about response time', '5-star review praising service', '3-star review about pricing', '4-star review mentioning staff'],
};

export interface SampleRecord { ref: string; kind: string; desc: string }

export function sampleRecords(job: CrawlJob, now: number): SampleRecord[] {
  const kinds = job.collect.length ? job.collect : ['Posts'];
  return Array.from({ length: Math.min(jobCount(job, now), 5) }, (_, i) => {
    const t = RECORD_TEXT[kinds[i % kinds.length]] ?? RECORD_TEXT.Posts;
    return { ref: `DEMO-${job.id}-${String(i + 1).padStart(3, '0')}`, kind: t[0], desc: t[1 + (Math.floor(i / kinds.length) % 5)] };
  });
}

export const crawlDuration = (limit: number) => Math.min(30 * 60000, Math.max(45000, limit * 600));

const isJob = (x: unknown): x is CrawlJob => {
  const j = x as CrawlJob;
  return !!j && typeof j.id === 'string' && typeof j.profileId === 'string' && Number.isInteger(j.limit) && typeof j.startedAt === 'number' && ['In Progress', 'Completed', 'Failed'].includes(j.status);
};

/** Saved jobs come from browser storage, so their shape is checked before use; anything odd falls back to the seed. */
export function loadArchive(storage: Pick<Storage, 'getItem'> | undefined, now: number): CrawlJob[] {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (raw) {
      const rows: unknown = JSON.parse(raw);
      if (Array.isArray(rows) && rows.length && rows.every(isJob)) return rows.map((r) => ({ ...r, collect: Array.isArray(r.collect) ? r.collect : [], via: r.via ?? '' }));
    }
  } catch {
    /* corrupted storage: use the seed */
  }
  return seedJobs(now);
}

export function saveArchive(jobs: CrawlJob[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
  } catch {
    /* private mode or quota: keep working in memory */
  }
}

export function csvDownload(filename: string, rows: (string | number)[][]) {
  const csv = rows.map((row) => row.map((x) => '"' + String(x ?? '').replace(/"/g, '""') + '"').join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
