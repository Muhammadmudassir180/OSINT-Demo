import { seedBulkJobs, seedCases, seedUsers } from '../data/demo';
import { socialPlatforms } from '../data/profiles';
import { crawlDuration, isOverdue, matchProfiles } from '../lib/osint';
import type { AuditRow, BulkJob, Case, CrawlJob, FbCategory, Granularity, JobStatus, PeriodKey, Platform, Profile, Role, SearchMode, SeriesKey, WorkspaceUser } from '../types';

// shortcut: SKIP_LOGIN opens the workspace directly during development; set it to false to show the sign-in screen again.
export const SKIP_LOGIN = true;

export type Modal =
  | { type: 'crawl'; profileId: string }
  | { type: 'case'; prefill: string }
  | { type: 'caseview'; index: number }
  | { type: 'invite' }
  | { type: 'forgot' }
  | { type: 'custom' }
  | null;

export interface SocialState {
  mode: SearchMode;
  terms: Record<SearchMode, string>;
  platforms: Record<SearchMode, Platform[]>;
  searched: Record<SearchMode, boolean>;
  loading: SearchMode | '';
  selected: Record<SearchMode, string | null>;
  fbScope: FbCategory;
  limit: number;
  archive: CrawlJob[];
  archiveSelected: string | null;
  archiveFilter: JobStatus | 'All';
  archiveQuery: string;
}

export interface AppState {
  logged: boolean;
  role: Role;
  compactSidebar: boolean;
  notify: boolean;
  mfaSetting: boolean;
  period: PeriodKey;
  from: string;
  to: string;
  granularity: Granularity;
  series: Record<SeriesKey, boolean>;
  cases: Case[];
  users: WorkspaceUser[];
  bulkJobs: BulkJob[];
  bulkLines: string;
  explorerQuery: string;
  explorerSource: string;
  auditFilter: 'All' | AuditRow[3];
  modal: Modal;
  toast: { id: number; text: string } | null;
  social: SocialState;
}

const ALL_PLATFORMS = socialPlatforms.map((p) => p.id);
const DEFAULT_PLATFORMS: Platform[] = ['facebook', 'instagram', 'x', 'tiktok'];

export function initialState(archive: CrawlJob[]): AppState {
  return {
    logged: SKIP_LOGIN,
    role: 'Admin',
    compactSidebar: false,
    notify: true,
    mfaSetting: false,
    period: '7d',
    from: '2026-11-08',
    to: '2026-11-22',
    granularity: 'Daily',
    series: { total: true, completed: true, failed: false },
    cases: seedCases,
    users: seedUsers,
    bulkJobs: seedBulkJobs,
    bulkLines: '',
    explorerQuery: '',
    explorerSource: 'All sources',
    auditFilter: 'All',
    modal: null,
    toast: null,
    social: {
      mode: 'name',
      terms: { name: 'Mira', username: '' },
      platforms: { name: DEFAULT_PLATFORMS, username: DEFAULT_PLATFORMS },
      searched: { name: true, username: false },
      loading: '',
      selected: { name: 'mira-fb', username: null },
      fbScope: 'Users',
      limit: 100,
      archive,
      archiveSelected: archive[0]?.id ?? null,
      archiveFilter: 'All',
      archiveQuery: '',
    },
  };
}

export type Action =
  | { type: 'login' }
  | { type: 'logout' }
  | { type: 'setRole'; role: Role }
  | { type: 'setSetting'; key: 'compactSidebar' | 'notify' | 'mfaSetting'; value: boolean }
  | { type: 'resetSettings' }
  | { type: 'setPeriod'; period: PeriodKey }
  | { type: 'setRange'; from: string; to: string }
  | { type: 'setGranularity'; granularity: Granularity }
  | { type: 'toggleSeries'; key: SeriesKey }
  | { type: 'openModal'; modal: Modal }
  | { type: 'closeModal' }
  | { type: 'toast'; text: string }
  | { type: 'clearToast' }
  | { type: 'addCase'; data: Pick<Case, 'title' | 'description' | 'severity' | 'owner'> }
  | { type: 'addUser'; data: Pick<WorkspaceUser, 'name' | 'email' | 'role'> }
  | { type: 'setUserRole'; index: number; role: WorkspaceUser['role'] }
  | { type: 'toggleUser'; index: number }
  | { type: 'setBulkLines'; text: string }
  | { type: 'setBulkJobs'; jobs: BulkJob[] }
  | { type: 'setBulkStatus'; index: number; status: BulkJob['status'] }
  | { type: 'setExplorer'; query: string; source: string }
  | { type: 'setAuditFilter'; filter: AppState['auditFilter'] }
  | { type: 'setMode'; mode: SearchMode }
  | { type: 'setTerm'; term: string }
  | { type: 'togglePlatform'; platform: Platform }
  | { type: 'setAllPlatforms'; all: boolean }
  | { type: 'setFbScope'; scope: FbCategory }
  | { type: 'searchStart' }
  | { type: 'searchDone'; mode: SearchMode }
  | { type: 'resetSearch' }
  | { type: 'nameSearch'; term: string }
  | { type: 'prefillUsername'; username: string }
  | { type: 'chooseProfile'; id: string }
  | { type: 'startCrawl'; profile: Profile; limit: number; collect: string[]; now: number }
  | { type: 'openPlatform' }
  | { type: 'selectJob'; id: string }
  | { type: 'setArchiveFilter'; filter: JobStatus | 'All' }
  | { type: 'setArchiveQuery'; query: string }
  | { type: 'failJob'; id: string }
  | { type: 'completeOverdue'; now: number };

const social = (s: AppState, patch: Partial<SocialState>): AppState => ({ ...s, social: { ...s.social, ...patch } });
const byMode = <T,>(rec: Record<SearchMode, T>, mode: SearchMode, value: T) => ({ ...rec, [mode]: value });

/** After the platform set changes, keep the selection only if it is still in the results. */
function reselect(s: SocialState, platforms: Platform[]): Record<SearchMode, string | null> {
  const m = s.mode;
  if (!s.searched[m]) return s.selected;
  const list = matchProfiles({ mode: m, term: s.terms[m], platforms, fbScope: s.fbScope });
  return byMode(s.selected, m, list.some((p) => p.id === s.selected[m]) ? s.selected[m] : (list[0]?.id ?? null));
}

export function reducer(s: AppState, a: Action): AppState {
  const so = s.social;
  switch (a.type) {
    case 'login':
      return { ...s, logged: true };
    case 'logout':
      return { ...s, logged: false };
    case 'setRole':
      return { ...s, role: a.role };
    case 'setSetting':
      return { ...s, [a.key]: a.value };
    case 'resetSettings':
      return { ...s, compactSidebar: false, notify: true, mfaSetting: false, role: 'Admin' };
    case 'setPeriod':
      return { ...s, period: a.period };
    case 'setRange':
      return { ...s, from: a.from, to: a.to, period: 'custom', modal: null };
    case 'setGranularity':
      return { ...s, granularity: a.granularity };
    case 'toggleSeries': {
      const series = { ...s.series, [a.key]: !s.series[a.key] };
      return Object.values(series).some(Boolean) ? { ...s, series } : s; // one series always stays visible
    }
    case 'openModal':
      return { ...s, modal: a.modal };
    case 'closeModal':
      return { ...s, modal: null };
    case 'toast':
      return { ...s, toast: { id: Date.now(), text: a.text } };
    case 'clearToast':
      return { ...s, toast: null };
    case 'addCase':
      return {
        ...s,
        modal: null,
        cases: [{ id: 'CASE-' + (900 + s.cases.length), status: 'Active', progress: 0, time: 'Created just now', ...a.data }, ...s.cases],
      };
    case 'addUser':
      return { ...s, modal: null, users: [...s.users, { ...a.data, status: 'Invited', last: 'Pending' }] };
    case 'setUserRole':
      return { ...s, users: s.users.map((u, i) => (i === a.index ? { ...u, role: a.role } : u)) };
    case 'toggleUser':
      if (a.index === 0) return s; // the demo administrator cannot be disabled
      return { ...s, users: s.users.map((u, i) => (i === a.index ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u)) };
    case 'setBulkLines':
      return { ...s, bulkLines: a.text };
    case 'setBulkJobs':
      return { ...s, bulkJobs: a.jobs };
    case 'setBulkStatus':
      return { ...s, bulkJobs: s.bulkJobs.map((j, i) => (i === a.index ? { ...j, status: a.status } : j)) };

    case 'setExplorer':
      return { ...s, explorerQuery: a.query, explorerSource: a.source };
    case 'setAuditFilter':
      return { ...s, auditFilter: a.filter };

    case 'setMode':
      return social(s, { mode: a.mode });
    case 'setTerm':
      return social(s, { terms: byMode(so.terms, so.mode, a.term) });
    case 'togglePlatform': {
      const cur = so.platforms[so.mode];
      const next = cur.includes(a.platform) ? cur.filter((x) => x !== a.platform) : [...cur, a.platform];
      return social(s, { platforms: byMode(so.platforms, so.mode, next), selected: reselect(so, next) });
    }
    case 'setAllPlatforms': {
      const next = a.all ? ALL_PLATFORMS : [];
      return social(s, { platforms: byMode(so.platforms, so.mode, next), selected: reselect(so, next) });
    }
    case 'setFbScope':
      return social(s, { fbScope: a.scope });
    case 'searchStart':
      return social(s, { loading: so.mode, searched: byMode(so.searched, so.mode, false), selected: byMode(so.selected, so.mode, null) });
    case 'searchDone': {
      const m = a.mode;
      const results = matchProfiles({ mode: m, term: so.terms[m], platforms: so.platforms[m], fbScope: so.fbScope });
      const target = results.find((p) => p.platform === 'facebook' && p.category === 'Users') ?? results[0];
      return social(s, { loading: '', searched: byMode(so.searched, m, true), selected: byMode(so.selected, m, target?.id ?? null) });
    }
    case 'resetSearch':
      return social(s, { loading: '', terms: byMode(so.terms, so.mode, ''), searched: byMode(so.searched, so.mode, false), selected: byMode(so.selected, so.mode, null) });
    case 'nameSearch': {
      const first = matchProfiles({ mode: 'name', term: a.term, platforms: so.platforms.name, fbScope: so.fbScope })[0];
      return social(s, { mode: 'name', terms: byMode(so.terms, 'name', a.term), searched: byMode(so.searched, 'name', true), selected: byMode(so.selected, 'name', first?.id ?? null) });
    }
    case 'prefillUsername':
      return social(s, { mode: 'username', terms: byMode(so.terms, 'username', a.username), searched: byMode(so.searched, 'username', false), selected: byMode(so.selected, 'username', null) });
    case 'chooseProfile':
      return { ...social(s, { selected: byMode(so.selected, so.mode, a.id) }), modal: { type: 'crawl', profileId: a.id } };
    case 'startCrawl': {
      const id = 'CRL-' + String(a.now).slice(-7);
      const job: CrawlJob = {
        id,
        profileId: a.profile.id,
        status: 'In Progress',
        limit: a.limit,
        collect: a.collect,
        via: so.mode === 'username' ? 'Username search' : 'Name search',
        collected: 0,
        startedAt: a.now,
        duration: crawlDuration(a.limit),
      };
      return {
        ...social(s, { limit: a.limit, archive: [job, ...so.archive], archiveSelected: id, archiveFilter: 'All', archiveQuery: '' }),
        modal: null,
        toast: { id: a.now, text: `Crawl ${id} started for ${a.profile.name}. Track it on the result or in Entity Archive.` },
      };
    }
    case 'openPlatform':
      return social(s, { archiveFilter: 'All', archiveQuery: '', archiveSelected: null });
    case 'selectJob':
      return social(s, { archiveSelected: a.id });
    case 'setArchiveFilter':
      return social(s, { archiveFilter: a.filter });
    case 'setArchiveQuery':
      return social(s, { archiveQuery: a.query });
    case 'failJob':
      return {
        ...social(s, {
          archive: so.archive.map((j) =>
            j.id === a.id && j.status === 'In Progress' ? { ...j, status: 'Failed', collected: 0, error: 'Failure deliberately simulated for prototype testing. No external collection occurred.' } : j,
          ),
        }),
        toast: { id: Date.now(), text: 'Demo crawl marked Failed.' },
      };
    case 'completeOverdue': {
      if (!so.archive.some((j) => isOverdue(j, a.now))) return s;
      return social(s, { archive: so.archive.map((j) => (isOverdue(j, a.now) ? { ...j, status: 'Completed', collected: j.limit } : j)) });
    }
  }
}

