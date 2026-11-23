export type Platform = 'facebook' | 'instagram' | 'x' | 'tiktok' | 'youtube' | 'linkedin' | 'telegram';
export type Category = 'Users' | 'Groups' | 'Pages' | 'Profile' | 'Channel';
export type FbCategory = 'Users' | 'Groups' | 'Pages';
export type ProfileKind = 'person' | 'group' | 'page';
export type SearchMode = 'name' | 'username';
export type JobStatus = 'In Progress' | 'Completed' | 'Failed';
export type Role = 'Admin' | 'Analyst';
export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'default';

export interface Profile {
  id: string;
  name: string;
  username: string;
  platform: Platform;
  category: Category;
  kind: ProfileKind;
  meta?: string;
  url: string;
}

export interface CrawlJob {
  id: string;
  profileId: string;
  status: JobStatus;
  limit: number;
  collect: string[];
  via: string;
  collected: number;
  startedAt: number;
  duration: number;
  error?: string;
}

export interface Entity {
  id: string;
  name: string;
  type: 'Person' | 'Organization';
}

export interface Case {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'In review' | 'Completed';
  severity: 'Low' | 'Medium' | 'High';
  progress: number;
  owner: string;
  time: string;
}

export interface WorkspaceUser {
  name: string;
  email: string;
  role: 'Admin' | 'Analyst' | 'Viewer';
  status: 'Active' | 'Invited' | 'Inactive';
  last: string;
}

export type AuditRow = [time: string, event: string, actor: string, severity: 'Success' | 'Failed' | 'Info', ref: string];

export interface PeriodStats {
  searches: number;
  cases: number;
  successful: number;
  failed: number;
  progress: number;
  queued: number;
  active: number;
  change: string;
}

export type PeriodKey = 'today' | '7d' | '30d' | 'custom';
export type Granularity = 'Daily' | 'Weekly' | 'Monthly';
export type SeriesKey = 'total' | 'completed' | 'failed';

export interface FeedItem {
  kind: 'Web' | 'News' | 'Social' | 'Registry';
  title: string;
  desc: string;
  time: string;
  source: string;
}

export interface BulkJob {
  name: string;
  status: 'Queued' | 'Running' | 'Completed' | 'Failed';
}
