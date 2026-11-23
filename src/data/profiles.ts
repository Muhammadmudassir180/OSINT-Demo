import type { CrawlJob, Platform, Profile } from '../types';

// Every profile is fictional; URLs point to example.com.

export const socialPlatforms: { id: Platform; name: string }[] = [
  { id: 'facebook', name: 'Facebook' },
  { id: 'instagram', name: 'Instagram' },
  { id: 'x', name: 'X (Twitter)' },
  { id: 'tiktok', name: 'TikTok' },
  { id: 'youtube', name: 'YouTube' },
];

const raw: Omit<Profile, 'url'>[] = [
 {id:'mira-fb',name:'Mira Solen',username:'mira.solen',platform:'facebook',category:'Users',kind:'person',meta:'Lydon City · 412 friends'},
 {id:'mira-fb-2',name:'Mira Solenne',username:'mira.solenne.art',platform:'facebook',category:'Users',kind:'person',meta:'Westshore · 1.1k followers'},
 {id:'mira-fb-3',name:'Amira Solak',username:'amira.solak',platform:'facebook',category:'Users',kind:'person',meta:'Northport · mostly private'},
 {id:'mira-fb-group',name:'Mira Community Forum',username:'mira.network',platform:'facebook',category:'Groups',kind:'group',meta:'Public group · 2.4k members'},
 {id:'mira-fb-group-2',name:'Mira Bay Residents',username:'mira.bay.residents',platform:'facebook',category:'Groups',kind:'group',meta:'Private group · 860 members'},
 {id:'mira-fb-page',name:'Mira Solen Studio',username:'mira.studio',platform:'facebook',category:'Pages',kind:'page',meta:'Design studio · 3.2k followers'},
 {id:'mira-fb-page-2',name:'Mira Coastal Freight',username:'mira.coastal',platform:'facebook',category:'Pages',kind:'page',meta:'Logistics company · 940 followers'},
 {id:'mira-ig',name:'Mira Solen',username:'mira.solen',platform:'instagram',category:'Profile',kind:'person'},
 {id:'mira-tiktok',name:'Mira Solen',username:'mira.solen',platform:'tiktok',category:'Profile',kind:'person'},
 {id:'mira-linkedin',name:'Mira Solen',username:'mira-solen',platform:'linkedin',category:'Profile',kind:'person'},
 {id:'mira-x',name:'Mira Solen',username:'mira_solen',platform:'x',category:'Profile',kind:'person'},
 {id:'evan-fb',name:'Evan Rowan',username:'evan.rowan',platform:'facebook',category:'Users',kind:'person'},
 {id:'evan-ig',name:'Evan Rowan',username:'evan.rowan',platform:'instagram',category:'Profile',kind:'person'},
 {id:'helio-fb',name:'Helio Freight Group',username:'heliofreight',platform:'facebook',category:'Pages',kind:'page'},
 {id:'helio-ig',name:'Helio Freight Group',username:'heliofreight',platform:'instagram',category:'Profile',kind:'page'},
 {id:'helio-linkedin',name:'Helio Freight Group',username:'helio-freight',platform:'linkedin',category:'Profile',kind:'page'},
 {id:'helio-youtube',name:'Helio Freight Insights',username:'HelioFreight',platform:'youtube',category:'Channel',kind:'page'},
 {id:'atlas-fb',name:'Atlas Research Circle',username:'atlaswatch',platform:'facebook',category:'Groups',kind:'group'},
 {id:'atlas-x',name:'Atlas Research Updates',username:'atlaswatch',platform:'x',category:'Profile',kind:'page'},
 {id:'atlas-telegram',name:'Atlas Research Updates',username:'atlaswatch',platform:'telegram',category:'Channel',kind:'page'},
 {id:'civic-fb',name:'Civic Discovery Network',username:'civic.discovery',platform:'facebook',category:'Pages',kind:'page'},
 {id:'civic-fb-group',name:'Civic Community Exchange',username:'civic.exchange',platform:'facebook',category:'Groups',kind:'group'},
 {id:'mira-yt',name:'Mira Solen',username:'mirasolen',platform:'youtube',category:'Channel',kind:'person'},
 {id:'kara-fb',name:'Kara Vellin',username:'kara.vellin',platform:'facebook',category:'Users',kind:'person',meta:'Lydon City · 1.3k friends'},
 {id:'kara-ig',name:'Kara Vellin',username:'kara.vellin',platform:'instagram',category:'Profile',kind:'person'},
 {id:'kara-x',name:'Kara Vellin',username:'kara_vellin',platform:'x',category:'Profile',kind:'person'},
 {id:'kara-tiktok',name:'Kara Vellin',username:'kara.vellin',platform:'tiktok',category:'Profile',kind:'person'},
 {id:'kara-yt',name:'Kara Vellin Travels',username:'karavellin',platform:'youtube',category:'Channel',kind:'person'},
 {id:'tomas-fb',name:'Tomas Rennick',username:'tomas.rennick',platform:'facebook',category:'Users',kind:'person',meta:'Northport · 288 friends'},
 {id:'tomas-ig',name:'Tomas Rennick',username:'tomas.rennick',platform:'instagram',category:'Profile',kind:'person'},
 {id:'tomas-x',name:'Tomas Rennick',username:'trennick',platform:'x',category:'Profile',kind:'person'},
 {id:'bw-fb-page',name:'Brightwater Shipping',username:'brightwater.shipping',platform:'facebook',category:'Pages',kind:'page',meta:'Shipping company · 12k followers'},
 {id:'bw-fb-group',name:'Brightwater Crew Network',username:'brightwater.crew',platform:'facebook',category:'Groups',kind:'group',meta:'Private group · 340 members'},
 {id:'bw-ig',name:'Brightwater Shipping',username:'brightwater.shipping',platform:'instagram',category:'Profile',kind:'page'},
 {id:'bw-x',name:'Brightwater Shipping',username:'brightwatership',platform:'x',category:'Profile',kind:'page'},
 {id:'bw-tiktok',name:'Brightwater Shipping',username:'brightwater.shipping',platform:'tiktok',category:'Profile',kind:'page'},
 {id:'bw-yt',name:'Brightwater Shipping',username:'brightwatershipping',platform:'youtube',category:'Channel',kind:'page'},
 {id:'kestrel-fb-page',name:'Kestrel Analytics',username:'kestrel.analytics',platform:'facebook',category:'Pages',kind:'page',meta:'Research firm · 2.1k followers'},
 {id:'kestrel-x',name:'Kestrel Analytics',username:'kestrel_analytics',platform:'x',category:'Profile',kind:'page'},
 {id:'kestrel-yt',name:'Kestrel Analytics Briefings',username:'kestrelanalytics',platform:'youtube',category:'Channel',kind:'page'},
 {id:'harbor-fb-group',name:'Harbor Watch Collective',username:'harbor.watch',platform:'facebook',category:'Groups',kind:'group',meta:'Public group · 5.6k members'},
 {id:'harbor-fb-page',name:'Harbor Watch',username:'harbor.watch',platform:'facebook',category:'Pages',kind:'page',meta:'Community page · 4.4k followers'},
 {id:'harbor-fb-user',name:'Harbor Watch Admin',username:'harbor.watch.admin',platform:'facebook',category:'Users',kind:'person',meta:'Westshore · 96 friends'},
 {id:'harbor-x',name:'Harbor Watch',username:'harbor_watch',platform:'x',category:'Profile',kind:'group'},
 {id:'harbor-tiktok',name:'Harbor Watch',username:'harbor.watch',platform:'tiktok',category:'Profile',kind:'group'},
 {id:'lumen-fb-page',name:'Lumen Harbor Market',username:'lumen.market',platform:'facebook',category:'Pages',kind:'page',meta:'Local market · 7.9k followers'},
 {id:'lumen-fb-group',name:'Lumen Market Vendors',username:'lumen.vendors',platform:'facebook',category:'Groups',kind:'group',meta:'Private group · 210 members'},
 {id:'lumen-ig',name:'Lumen Harbor Market',username:'lumen.market',platform:'instagram',category:'Profile',kind:'page'},
 {id:'atlas-fb-page',name:'Atlas Research Notes',username:'atlaswatch',platform:'facebook',category:'Pages',kind:'page',meta:'Research newsletter · 1.8k followers'},
 {id:'helio-fb-group',name:'Helio Freight Drivers',username:'helio.drivers',platform:'facebook',category:'Groups',kind:'group',meta:'Private group · 1.2k members'},
 {id:'helio-x',name:'Helio Freight Group',username:'helio_freight',platform:'x',category:'Profile',kind:'page'},
 {id:'helio-tiktok',name:'Helio Freight Group',username:'heliofreight',platform:'tiktok',category:'Profile',kind:'page'},
 {id:'dockside-fb-page',name:'Dockside Logistics',username:'dockside.logistics',platform:'facebook',category:'Pages',kind:'page',meta:'Warehouse services · 640 followers'},
 {id:'dockside-x',name:'Dockside Logistics',username:'dockside_log',platform:'x',category:'Profile',kind:'page'},
 {id:'evan-x',name:'Evan Rowan',username:'evan_rowan',platform:'x',category:'Profile',kind:'person'},
 {id:'evan-tiktok',name:'Evan Rowan',username:'evan.rowan',platform:'tiktok',category:'Profile',kind:'person'}
];

export const demoProfiles: Profile[] = raw.map((p) => ({ ...p, url: 'https://example.com/demo-profiles/' + encodeURIComponent(p.id) }));

const F = 'Simulated connector timeout. No records collected.';
const RATE = 'Rate limit reached on the platform connector (simulated). Try again later.';

export function seedJobs(now: number): CrawlJob[] {
  const m = 60000, h = 60 * m;
  const rows: Omit<CrawlJob, 'via'>[] = [
 {id:'CRL-DEMO-120',profileId:'harbor-fb-group',status:'In Progress',limit:600,collect:['Posts','Member list'],collected:0,startedAt:now-1*m,duration:35*m},
 {id:'CRL-DEMO-119',profileId:'kara-ig',status:'In Progress',limit:220,collect:['Posts'],collected:0,startedAt:now-5*m,duration:22*m},
 {id:'CRL-DEMO-118',profileId:'mira-fb-group',status:'In Progress',limit:400,collect:['Posts','Member list'],collected:0,startedAt:now-6*m,duration:30*m},
 {id:'CRL-DEMO-117',profileId:'mira-fb',status:'In Progress',limit:250,collect:['Posts'],collected:0,startedAt:now-2*m,duration:20*m},
 {id:'CRL-DEMO-116',profileId:'mira-ig',status:'In Progress',limit:300,collect:['Posts'],collected:0,startedAt:now-9*m,duration:25*m},
 {id:'CRL-DEMO-115',profileId:'atlas-x',status:'In Progress',limit:500,collect:['Posts'],collected:0,startedAt:now-4*m,duration:40*m},
 {id:'CRL-DEMO-110',profileId:'bw-tiktok',status:'In Progress',limit:150,collect:['Posts'],collected:0,startedAt:now-1*m,duration:15*m},
 {id:'CRL-DEMO-108',profileId:'kestrel-yt',status:'In Progress',limit:120,collect:['Posts'],collected:0,startedAt:now-3*m,duration:12*m},
 {id:'CRL-DEMO-113',profileId:'bw-fb-page',status:'Failed',limit:500,collect:['Posts','Reviews'],collected:0,startedAt:now-40*m,duration:16000,error:RATE},
 {id:'CRL-DEMO-111',profileId:'lumen-fb-page',status:'Completed',limit:300,collect:['Posts','Reviews'],collected:300,startedAt:now-75*m,duration:16000},
 {id:'CRL-DEMO-109',profileId:'mira-fb-page',status:'Completed',limit:200,collect:['Posts','Reviews'],collected:200,startedAt:now-3*h,duration:16000},
 {id:'CRL-DEMO-107',profileId:'kara-x',status:'Completed',limit:400,collect:['Posts'],collected:312,startedAt:now-4*h,duration:16000},
 {id:'CRL-DEMO-106',profileId:'helio-fb',status:'Failed',limit:100,collect:['Posts','Reviews'],collected:0,startedAt:now-5*h,duration:16000,error:F},
 {id:'CRL-DEMO-105',profileId:'tomas-fb',status:'Completed',limit:150,collect:['Posts'],collected:84,startedAt:now-7*h,duration:16000},
 {id:'CRL-DEMO-114',profileId:'tomas-ig',status:'Failed',limit:200,collect:['Posts'],collected:0,startedAt:now-20*h,duration:16000,error:'Profile became private during the crawl (simulated). No records collected.'},
 {id:'CRL-DEMO-104',profileId:'helio-ig',status:'Completed',limit:150,collect:['Posts'],collected:150,startedAt:now-26*h,duration:16000},
 {id:'CRL-DEMO-103',profileId:'bw-yt',status:'Completed',limit:80,collect:['Posts'],collected:46,startedAt:now-30*h,duration:16000},
 {id:'CRL-DEMO-102',profileId:'harbor-tiktok',status:'Completed',limit:250,collect:['Posts'],collected:250,startedAt:now-2*24*h,duration:16000},
 {id:'CRL-DEMO-101',profileId:'evan-x',status:'Failed',limit:300,collect:['Posts'],collected:0,startedAt:now-2*24*h-3*h,duration:16000,error:'Account not found. It may have been renamed or removed (simulated).'},
 {id:'CRL-DEMO-100',profileId:'kestrel-fb-page',status:'Completed',limit:500,collect:['Posts','Reviews'],collected:500,startedAt:now-3*24*h,duration:16000},
 {id:'CRL-DEMO-099',profileId:'lumen-fb-group',status:'Completed',limit:200,collect:['Posts','Member list'],collected:200,startedAt:now-4*24*h,duration:16000},
 {id:'CRL-DEMO-098',profileId:'dockside-x',status:'Failed',limit:100,collect:['Posts'],collected:0,startedAt:now-5*24*h,duration:16000,error:F},
 {id:'CRL-DEMO-097',profileId:'mira-yt',status:'Completed',limit:60,collect:['Posts'],collected:60,startedAt:now-6*24*h,duration:16000},
 {id:'CRL-DEMO-096',profileId:'atlas-fb',status:'Failed',limit:400,collect:['Posts','Member list'],collected:0,startedAt:now-7*24*h,duration:16000,error:RATE}
  ];
  return rows.map((j, i) => ({ ...j, via: i % 3 === 1 ? 'Username search' : 'Name search' }));
}
