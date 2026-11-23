import { memo, useDeferredValue, useMemo, useTransition, type ReactNode } from 'react';
import { Navigate, useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import {
  Alert, alpha, Box, Button, ButtonBase, Card, Chip, Grid, InputAdornment, LinearProgress, Link, Stack, TextField, Typography, useTheme,
} from '@mui/material';
import { CalendarTodayOutlined, ChevronLeft, Close, DescriptionOutlined, Download, ManageSearch, OpenInNew, Search } from '@mui/icons-material';
import { PlatformLogo, SocialAvatar } from '../components/brand';
import { ArchiveStats } from '../components/ArchiveStats';
import { EmptyState, Mono, PageHeader, Reveal, StatusTag } from '../components/ui';
import {
  archivePlatforms, archiveTime, csvDownload, findProfile, fmt, jobCount, jobPlatform, jobProgress, platformName, profileType, sampleRecords, shortUrl,
  statusLabel, statusTone,
} from '../lib/osint';
import { useNow } from '../state/clock';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { CrawlJob, JobStatus } from '../types';

const FILTERS: (JobStatus | 'All')[] = ['All', 'In Progress', 'Completed', 'Failed'];

export default function ArchivePlatform() {
  const { platform = '' } = useParams();
  const { social } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [pending, startTransition] = useTransition();
  // Typing stays responsive; the list filters against the deferred copy.
  const query = useDeferredValue(social.archiveQuery);

  const jobs = useMemo(() => social.archive.filter((j) => jobPlatform(j) === platform), [social.archive, platform]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return jobs.filter((j) => {
      if (social.archiveFilter !== 'All' && j.status !== social.archiveFilter) return false;
      if (!q) return true;
      const p = findProfile(j.profileId);
      return [p?.name, p?.username, j.id].join(' ').toLowerCase().includes(q);
    });
  }, [jobs, social.archiveFilter, query]);

  if (!archivePlatforms(social.archive).includes(platform as never)) return <Navigate to="/archive" replace />;

  const open = filtered.find((j) => j.id === social.archiveSelected) ?? filtered[0] ?? null;
  const name = platformName(platform);

  return (
    <Stack spacing={3}>
      <PageHeader
        crumb={<Link component={RouterLink} to="/archive" underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 14 }}><ChevronLeft fontSize="small" /> Entity Archive</Link>}
        title={<Stack component="span" direction="row" spacing={1.5} sx={{ alignItems: 'center' }}><PlatformLogo platform={platform} size={28} /><span>{name} crawls</span></Stack>}
        description={`Crawl jobs and collected data from ${name}.`}
        actions={<Button startIcon={<ManageSearch />} onClick={() => navigate('/entity')}>New crawl</Button>}
      />
      <ArchiveStats jobs={jobs} />
      <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Reveal>
            <Card>
              <Box sx={{ p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant="h3">Crawl jobs</Typography>
                  <Typography variant="caption" color="text.secondary">Newest first</Typography>
                </Stack>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.5 }} role="group" aria-label="Filter by status">
                  {FILTERS.map((f) => {
                    const on = social.archiveFilter === f;
                    return (
                      <Chip
                        key={f}
                        label={<>{statusLabel(f)} <Mono sx={{ ml: 0.5, opacity: 0.8 }}>{f === 'All' ? jobs.length : jobs.filter((j) => j.status === f).length}</Mono></>}
                        onClick={() => startTransition(() => dispatch({ type: 'setArchiveFilter', filter: f }))}
                        color={on ? 'primary' : 'default'}
                        variant={on ? 'filled' : 'outlined'}
                        aria-pressed={on}
                      />
                    );
                  })}
                </Stack>
                <TextField
                  sx={{ mt: 2 }}
                  fullWidth
                  value={social.archiveQuery}
                  onChange={(e) => dispatch({ type: 'setArchiveQuery', query: e.target.value })}
                  placeholder="Find a profile, username or job ID…"
                  slotProps={{ htmlInput: { 'aria-label': 'Filter crawl jobs' }, input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
                />
              </Box>
              <Box sx={{ opacity: pending || query !== social.archiveQuery ? 0.6 : 1, transition: 'opacity 110ms' }}>
                {filtered.length ? (
                  filtered.map((j) => <JobRow key={j.id} job={j} selected={open?.id === j.id} />)
                ) : (
                  <EmptyState icon={<Search />} title={jobs.length ? 'No matching crawl jobs' : `No crawls on ${name} yet`} minHeight={200}>
                    {jobs.length ? 'Try another filter.' : `Select a ${name} profile in Entity Search to start one.`}
                  </EmptyState>
                )}
              </Box>
            </Card>
          </Reveal>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ position: { lg: 'sticky' }, top: { lg: 0 } }}>
          <Reveal order={1}>{open ? <JobDetail job={open} /> : <Card><EmptyState icon={<DescriptionOutlined />} title="Choose an archive job">Detailed status and simulated records will appear here.</EmptyState></Card>}</Reveal>
        </Grid>
      </Grid>
    </Stack>
  );
}

const JobRow = memo(function JobRow({ job, selected }: { job: CrawlJob; selected: boolean }) {
  const dispatch = useAppDispatch();
  const t = useTheme();
  const p = findProfile(job.profileId);
  if (!p) return null;
  const type = profileType(p);
  return (
    <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: selected ? alpha(t.palette.primary.main, 0.08) : 'transparent', boxShadow: selected ? `inset 3px 0 0 ${t.palette.primary.main}` : 'none' }}>
      <ButtonBase onClick={() => dispatch({ type: 'selectJob', id: job.id })} aria-pressed={selected} sx={{ display: 'block', width: '100%', textAlign: 'left', px: 2.5, pt: 2, pb: 1 }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
          <SocialAvatar profile={p} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{p.name}</Typography>
              <StatusTag label={type} />
            </Stack>
            <Typography variant="caption" color="text.secondary" noWrap component="div">@{p.username} · {platformName(p.platform)} {type.toLowerCase()}</Typography>
          </Box>
          <StatusTag label={statusLabel(job.status)} tone={statusTone(job.status)} />
        </Stack>
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.25, color: 'text.secondary', '& > span': { display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 12 } }}>
          <span><DescriptionOutlined sx={{ fontSize: 14 }} /> {fmt(job.limit)} limit</span>
          <span><CalendarTodayOutlined sx={{ fontSize: 14 }} /> {archiveTime(job.startedAt)}</span>
          <span><Live job={job}>{(now) => `${fmt(jobCount(job, now))} items`}</Live></span>
          {job.via && <span><Search sx={{ fontSize: 14 }} /> {job.via}</span>}
        </Stack>
        {job.status === 'In Progress' && <Live job={job}>{(now) => <ProgressLine value={jobProgress(job, now)} label="Processing items" />}</Live>}
      </ButtonBase>
      <Link
        href={p.url}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        aria-label={`Open ${p.name} ${type.toLowerCase()} on ${platformName(p.platform)} in a new tab to re-verify`}
        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mx: 2.5, mb: 1.5, fontSize: 12, fontFamily: (th) => th.palette.tokens.mono, maxWidth: 'calc(100% - 40px)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        <OpenInNew sx={{ fontSize: 14 }} /> {shortUrl(p.url)}
      </Link>
    </Box>
  );
});

/** Re-renders its children every second only while the job is running. */
function Live({ job, children }: { job: CrawlJob; children: (now: number) => ReactNode }) {
  return job.status === 'In Progress' ? <Ticking>{children}</Ticking> : <>{children(0)}</>;
}
function Ticking({ children }: { children: (now: number) => ReactNode }) {
  return <>{children(useNow())}</>;
}

function ProgressLine({ value, label }: { value: number; label: string }) {
  return (
    <Box sx={{ mt: 1.25 }}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" color="text.secondary">{label}</Typography>
        <Typography variant="caption" sx={{ fontFamily: (t) => t.palette.tokens.mono }}>{value}%</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={value} color="warning" aria-label={`${label}: ${value}%`} />
    </Box>
  );
}

function JobDetail({ job }: { job: CrawlJob }) {
  const p = findProfile(job.profileId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  if (!p) return null;
  const type = profileType(p);
  return (
    <Card>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', p: 2.5, borderBottom: 1, borderColor: 'divider' }}>
        <Box>
          <Typography variant="h3">Crawl details</Typography>
          <Typography variant="body2" color="text.secondary"><Mono>{job.id}</Mono> · {archiveTime(job.startedAt)}</Typography>
        </Box>
        <StatusTag label={statusLabel(job.status)} tone={statusTone(job.status)} />
      </Stack>
      <Stack spacing={2.5} sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <SocialAvatar profile={p} size={56} />
          <Box>
            <Typography variant="h2">{p.name}</Typography>
            <Mono sx={{ color: 'text.secondary' }}>@{p.username}</Mono>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
              <PlatformLogo platform={p.platform} size={16} />
              <Typography variant="caption" color="text.secondary">{platformName(p.platform)}</Typography>
            </Stack>
          </Box>
        </Stack>
        <Live job={job}>
          {(now) => (
            <Grid container spacing={1.5}>
              {([
                ['Type', `${platformName(p.platform)} ${type.toLowerCase()}`],
                job.via ? ['Started from', job.via] : null,
                ['Requested crawl limit', `${fmt(job.limit)} items`, true],
                ['Simulated records', `${fmt(jobCount(job, now))} items`, true],
                ['Job created', archiveTime(job.startedAt)],
                ['Current status', statusLabel(job.status)],
                job.collect.length ? ['Collecting', job.collect.join(', ')] : null,
              ] as ([string, string, boolean?] | null)[])
                .filter((x) => x !== null)
                .map(([k, v, mono]) => (
                  <Grid key={k} size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ p: 1.5, height: '100%', borderRadius: 1, bgcolor: 'tokens.surface2' }}>
                      <Typography variant="overline" color="text.secondary" component="div">{k}</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: (t) => (mono ? t.palette.tokens.mono : undefined) }}>{v}</Typography>
                    </Box>
                  </Grid>
                ))}
            </Grid>
          )}
        </Live>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>Link to re-verify this {type.toLowerCase()}</Typography>
          <Button
            component="a"
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={<OpenInNew />}
            fullWidth
            aria-label={`Open ${p.name} in a new tab to re-verify`}
            sx={{ justifyContent: 'flex-start', fontFamily: (t) => t.palette.tokens.mono, fontWeight: 500, color: 'tokens.link', overflow: 'hidden' }}
          >
            <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.url}</Box>
          </Button>
          <Typography variant="caption" color="tokens.soft">Opens in a new tab. Demo links point to example.com.</Typography>
        </Box>
        {job.status === 'In Progress' && (
          <Box sx={{ p: 2, borderRadius: 1, border: 1, borderColor: (t) => alpha(t.palette.warning.main, 0.35), bgcolor: (t) => alpha(t.palette.warning.main, 0.06) }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'warning.main' }}>Crawling in progress · Demo</Typography>
            <Live job={job}>{(now) => <ProgressLine value={jobProgress(job, now)} label={`${fmt(jobCount(job, now))} items processed`} />}</Live>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25 }}>You can leave this page while the crawl runs.</Typography>
            <Button size="small" startIcon={<Close />} sx={{ mt: 1.5 }} onClick={() => dispatch({ type: 'failJob', id: job.id })}>Demo: simulate failure</Button>
          </Box>
        )}
        {job.status === 'Failed' && (
          <Box>
            <Alert severity="error" variant="outlined"><b>Job failed.</b> {job.error ?? 'Simulation: the crawl could not finish.'}</Alert>
            <Typography variant="body2" color="text.secondary" sx={{ my: 1.5 }}>To try again, find the account and start a new crawl.</Typography>
            <Button startIcon={<Search />} onClick={() => { dispatch({ type: 'prefillUsername', username: p.username }); navigate('/entity'); }}>Go to Username Search</Button>
          </Box>
        )}
        {job.status !== 'Failed' && <Live job={job}>{(now) => <Records job={job} now={now} />}</Live>}
      </Stack>
    </Card>
  );
}

function Records({ job, now }: { job: CrawlJob; now: number }) {
  const dispatch = useAppDispatch();
  const t = useTheme().palette.tokens;
  const n = jobCount(job, now);
  if (!n) return null;
  const rows = sampleRecords(job, now);
  const exportCsv = () => {
    const p = findProfile(job.profileId)!;
    csvDownload(`demo_crawl_${job.id}.csv`, [
      ['Record ID', 'Account', 'Account type', 'Platform', 'Link for re-verification', 'Record type', 'Description'],
      ...rows.map((x) => [x.ref, p.username, profileType(p), platformName(p.platform), p.url, x.kind, x.desc]),
    ]);
    dispatch({ type: 'toast', text: 'Exported simulated sample record preview (CSV).' });
  };
  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1 }}>
        <Box>
          <Typography variant="h4">{job.status === 'Completed' ? 'Collected data' : 'Collected so far'}</Typography>
          <Typography variant="caption" color="text.secondary">{fmt(n)} record{n === 1 ? '' : 's'}, first {Math.min(n, 5)} shown</Typography>
        </Box>
        {job.status === 'Completed' && <Button size="small" startIcon={<Download />} onClick={exportCsv}>Export CSV</Button>}
      </Stack>
      <Stack spacing={1}>
        {rows.map((r) => (
          <Box key={r.ref} component="article" sx={{ p: 1.5, borderRadius: 1, border: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.kind}</Typography>
              <Typography variant="caption" sx={{ fontFamily: t.mono, color: 'tokens.soft' }}>{r.ref}</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">{r.desc}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
