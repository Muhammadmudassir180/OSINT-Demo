import type { AuditRow, BulkJob, Case, Entity, FeedItem, PeriodKey, PeriodStats, WorkspaceUser } from '../types';

// Every record in this file is fictional sample data.

export const entities: Entity[] = [
  { id: 'EN-2048', name: 'Helio Freight Group', type: 'Organization' },
  { id: 'EN-2049', name: 'Mira Solen', type: 'Person' },
  { id: 'EN-2050', name: 'Harborline Consultants', type: 'Organization' },
  { id: 'EN-2051', name: 'Dockside Logistics', type: 'Organization' },
];

export const seedCases: Case[] = [
  { id: 'CASE-0824', title: 'Regional Freight Network Review', description: 'Map potential relationships among simulated regional logistics entities and their public footprints.', status: 'In review', severity: 'Medium', progress: 72, owner: 'Analyst Team', time: 'Updated 18 min ago' },
  { id: 'CASE-0817', title: 'Public Procurement Intelligence', description: 'Review synthetic organization records, partnership mentions and website references.', status: 'Active', severity: 'High', progress: 46, owner: 'Operations Group', time: 'Updated 2 hours ago' },
  { id: 'CASE-0799', title: 'Entity Relationship Mapping', description: 'Organize a demo graph of corporate affiliations with source-level attribution.', status: 'Completed', severity: 'Low', progress: 100, owner: 'Investigations', time: 'Updated yesterday' },
  { id: 'CASE-0831', title: 'Port Labor Sentiment Monitoring', description: 'Track public discussion about dock labor conditions across synthetic community groups and pages.', status: 'Active', severity: 'High', progress: 18, owner: 'Operations Group', time: 'Updated 35 min ago' },
  { id: 'CASE-0829', title: 'Brightwater Shipping Ownership Review', description: 'Compare public registry mentions and social profiles for a fictional shipping company.', status: 'In review', severity: 'Medium', progress: 64, owner: 'Analyst Team', time: 'Updated 1 hour ago' },
  { id: 'CASE-0826', title: 'Harbor Watch Narrative Tracking', description: 'Follow recurring narratives in a demo community group and its linked page.', status: 'Active', severity: 'Medium', progress: 39, owner: 'Investigations', time: 'Updated 3 hours ago' },
  { id: 'CASE-0812', title: 'Kestrel Analytics Source Validation', description: 'Check which simulated sources support claims made by a fictional research firm.', status: 'Completed', severity: 'Low', progress: 100, owner: 'Analyst Team', time: 'Updated 2 days ago' },
  { id: 'CASE-0808', title: 'Lumen Market Vendor Mapping', description: 'Map vendor pages connected to a demo local market and note unverified links.', status: 'In review', severity: 'Low', progress: 81, owner: 'Investigations', time: 'Updated 3 days ago' },
  { id: 'CASE-0790', title: 'Cross-Platform Username Correlation', description: 'Correlate identical usernames across demo platforms and record confidence for each match.', status: 'Completed', severity: 'Medium', progress: 100, owner: 'Operations Group', time: 'Updated last week' },
];

export const seedUsers: WorkspaceUser[] = [
  { name: 'Jordan Vale', email: 'jordan.vale@demo.local', role: 'Admin', status: 'Active', last: 'Now' },
  { name: 'Taylor Quinn', email: 't.quinn@demo.local', role: 'Analyst', status: 'Active', last: '8 min ago' },
  { name: 'Morgan Hale', email: 'morgan.hale@demo.local', role: 'Analyst', status: 'Active', last: '1 hr ago' },
  { name: 'Casey Rowan', email: 'casey.rowan@demo.local', role: 'Viewer', status: 'Invited', last: 'Pending' },
  { name: 'Avery Lane', email: 'avery.lane@demo.local', role: 'Analyst', status: 'Inactive', last: '4 days ago' },
  { name: 'Sam Okafor', email: 'sam.okafor@demo.local', role: 'Analyst', status: 'Active', last: '3 min ago' },
  { name: 'Noor Haddad', email: 'noor.haddad@demo.local', role: 'Analyst', status: 'Active', last: '22 min ago' },
  { name: 'Elliot Park', email: 'elliot.park@demo.local', role: 'Viewer', status: 'Active', last: '2 hrs ago' },
  { name: 'Grace Adeyemi', email: 'grace.adeyemi@demo.local', role: 'Analyst', status: 'Active', last: '5 hrs ago' },
  { name: 'Priya Raman', email: 'priya.raman@demo.local', role: 'Admin', status: 'Active', last: 'Yesterday' },
  { name: 'Dana Whitlock', email: 'dana.whitlock@demo.local', role: 'Analyst', status: 'Invited', last: 'Pending' },
  { name: 'Felix Moreau', email: 'felix.moreau@demo.local', role: 'Viewer', status: 'Inactive', last: '3 weeks ago' },
];

export const seedAudit: AuditRow[] = [
  ['09:18', 'Crawl started', 'Sam Okafor', 'Info', 'CRL-DEMO-120'],
  ['09:12', 'Crawl failed: rate limit reached', 'System', 'Failed', 'CRL-DEMO-113'],
  ['09:05', 'Username search completed', 'Noor Haddad', 'Success', 'harbor.watch'],
  ['08:58', 'Case created', 'Grace Adeyemi', 'Success', 'CASE-0831'],
  ['08:51', 'Sign-in failed: wrong verification code', 'Unknown', 'Failed', 'Web session'],
  ['08:47', 'Crawl completed', 'System', 'Success', 'CRL-DEMO-111'],
  ['08:42', 'Entity search completed', 'Taylor Quinn', 'Success', 'EN-2048'],
  ['08:39', 'Case report exported', 'Jordan Vale', 'Success', 'CASE-0824'],
  ['08:35', 'OSINT source batch synced', 'System', 'Info', '8 connectors'],
  ['08:32', 'Entity search timed out', 'Morgan Hale', 'Failed', 'JOB-3891'],
  ['08:28', 'User session started', 'Taylor Quinn', 'Success', 'Web session'],
  ['08:11', 'Case metadata updated', 'Jordan Vale', 'Success', 'CASE-0817'],
  ['Yesterday', 'Bulk search completed', 'Morgan Hale', 'Success', 'BATCH-141'],
  ['Yesterday', 'User invited', 'Jordan Vale', 'Info', 'dana.whitlock@demo.local'],
  ['Yesterday', 'Role changed to Admin', 'Jordan Vale', 'Info', 'priya.raman@demo.local'],
  ['Yesterday', 'Crawl export downloaded', 'Morgan Hale', 'Success', 'CRL-DEMO-109'],
  ['Yesterday', 'Crawl failed: profile became private', 'System', 'Failed', 'CRL-DEMO-114'],
  ['2 days ago', 'Case closed', 'Taylor Quinn', 'Success', 'CASE-0812'],
  ['2 days ago', 'Account deactivated', 'Jordan Vale', 'Info', 'felix.moreau@demo.local'],
  ['3 days ago', 'Source connector reconnected', 'System', 'Info', 'YouTube connector'],
  ['3 days ago', 'Bulk search completed', 'Noor Haddad', 'Success', 'BATCH-139'],
];

export const basePeriod: Record<PeriodKey, PeriodStats> = {
  today: { searches: 486, cases: 12, successful: 413, failed: 21, progress: 27, queued: 25, active: 19, change: '+8.2%' },
  '7d': { searches: 4280, cases: 114, successful: 3634, failed: 171, progress: 228, queued: 247, active: 42, change: '+12.8%' },
  '30d': { searches: 12846, cases: 326, successful: 10936, failed: 523, progress: 683, queued: 704, active: 84, change: '+18.4%' },
  custom: { searches: 7079, cases: 192, successful: 6030, failed: 285, progress: 371, queued: 393, active: 59, change: '+10.4%' },
};

export const seedBulkJobs: BulkJob[] = ['Harbor Watch Collective', 'Brightwater Shipping', 'Kara Vellin', 'Tomas Rennick', 'Lumen Harbor Market', 'Kestrel Analytics', 'Dockside Logistics', 'Atlas Research Circle', 'Helio Freight Group', 'Evan Rowan'].map(
  (name, i) => ({ name, status: i === 6 ? 'Failed' : 'Completed' }),
);

export const recentSearches: [name: string, type: string, status: 'In progress' | 'Completed' | 'Failed', updated: string][] = [
  ['Harbor Watch Collective', 'Group', 'In progress', '2 min ago'],
  ['Kara Vellin', 'Person', 'Completed', '8 min ago'],
  ['Helio Freight Group', 'Organization', 'Completed', '14 min ago'],
  ['Brightwater Shipping', 'Organization', 'In progress', '21 min ago'],
  ['Mira Solen', 'Person', 'Completed', '26 min ago'],
  ['Kestrel Analytics', 'Organization', 'Completed', '38 min ago'],
  ['Dockside Logistics', 'Organization', 'Failed', '1 hr ago'],
  ['Tomas Rennick', 'Person', 'Completed', '2 hrs ago'],
];

export type ActivityIcon = 'shield' | 'download' | 'alert' | 'report' | 'users';
export const operationalActivity: [icon: ActivityIcon, title: string, desc: string, time: string][] = [
  ['shield', 'Source connector checks completed', 'All simulated sources operational', 'Just now'],
  ['download', 'Crawl started', 'Harbor Watch Collective on Facebook, 600 items', '1 min ago'],
  ['report', 'Case report reviewed', 'CASE-0824 moved to review', '18 min ago'],
  ['users', 'User activity recorded', '3 recent analyst sessions', '28 min ago'],
  ['alert', 'Crawl failed', 'Brightwater Shipping page: rate limit reached', '40 min ago'],
];

export const feed: FeedItem[] = [
  { kind: 'Web', title: 'Public organization profile indexed', desc: 'A fictional organization profile was added to the demo investigation index.', time: '12 min ago', source: 'Website snapshot' },
  { kind: 'News', title: 'Trade partnership mention detected', desc: 'Synthetic article references a demo freight services collaboration.', time: '48 min ago', source: 'News archive' },
  { kind: 'Social', title: 'Public discussion cluster updated', desc: 'Sample aggregate narrative signals assigned to a generic topic cluster.', time: '1 hour ago', source: 'Public social posts' },
  { kind: 'Registry', title: 'Business listing reference refreshed', desc: 'Illustrative business registry fields grouped for analyst review.', time: '2 hours ago', source: 'Demo company registry' },
  { kind: 'Social', title: 'Group membership spike observed', desc: 'A fictional public group gained several hundred members over two days.', time: '2 hours ago', source: 'Public social posts' },
  { kind: 'News', title: 'Shipping route change reported', desc: 'Synthetic news item mentions a demo shipping company changing a coastal route.', time: '3 hours ago', source: 'News archive' },
  { kind: 'Web', title: 'Company website updated', desc: 'A demo research firm added a new team page to its fictional website.', time: '4 hours ago', source: 'Website snapshot' },
  { kind: 'Registry', title: 'New director listed', desc: 'Illustrative registry change: a new director appears on a fictional company record.', time: '5 hours ago', source: 'Demo company registry' },
  { kind: 'Social', title: 'Video channel posted new uploads', desc: 'Three new videos appeared on a demo logistics channel.', time: '6 hours ago', source: 'Public video channels' },
  { kind: 'News', title: 'Market vendor dispute covered', desc: 'Synthetic local news piece about a disagreement between demo market vendors.', time: 'Yesterday', source: 'News archive' },
  { kind: 'Web', title: 'Domain registration renewed', desc: 'Fictional domain linked to a demo community page renewed for one year.', time: 'Yesterday', source: 'Domain records' },
  { kind: 'Registry', title: 'Business address changed', desc: 'Illustrative registry update moves a fictional company to a new port address.', time: '2 days ago', source: 'Demo company registry' },
];

export type NoteIcon = 'done' | 'alert' | 'report' | 'users';
export const NOTES: [icon: NoteIcon, text: string, time: string][] = [
  ['done', 'Crawl completed: Lumen Harbor Market', '12 min ago'],
  ['alert', 'Crawl failed: Brightwater Shipping page', '40 min ago'],
  ['done', 'Entity search completed', '8 min ago'],
  ['report', 'Case review updated: CASE-0829', '1 hour ago'],
  ['users', 'Dana Whitlock has not accepted the invitation', 'Yesterday'],
];
