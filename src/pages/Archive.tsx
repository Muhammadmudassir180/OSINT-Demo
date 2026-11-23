import { memo, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, ButtonBase, Card, CardHeader, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight, Insights, ManageSearch, ShieldOutlined } from '@mui/icons-material';
import { PieChart } from '@mui/x-charts/PieChart';
import { PlatformLogo } from '../components/brand';
import { CountUp, EmptyState, PageHeader, Reveal } from '../components/ui';
import { ArchiveStats } from '../components/ArchiveStats';
import { ago, archivePlatforms, fmt, jobCount, jobPlatform, platformName } from '../lib/osint';
import { useNow } from '../state/clock';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { CrawlJob, Platform } from '../types';

export default function Archive() {
  const { social } = useAppState();
  const navigate = useNavigate();
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Entity Archive"
        description="Crawl jobs started from Entity Search, grouped by platform."
        actions={<Button startIcon={<ChevronLeft />} onClick={() => navigate('/entity')}>Entity Search</Button>}
      />
      <ArchiveStats jobs={social.archive} />
      <Reveal><RunningPie /></Reveal>
      <PlatformCards jobs={social.archive} />
      <Stack direction="row" spacing={1} sx={{ color: 'text.secondary', alignItems: 'flex-start' }}>
        <ShieldOutlined fontSize="small" sx={{ mt: '1px' }} />
        <Typography variant="body2">Entity Archive shows simulated crawl state and locally stored sample records. No social media platforms or external APIs are connected.</Typography>
      </Stack>
    </Stack>
  );
}

function useOpenPlatform() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return (id: string) => {
    dispatch({ type: 'openPlatform' });
    navigate(`/archive/${id}`);
  };
}

// One hue in steps of lightness, ordered so neighbouring slices always differ.
// Platform identity comes from the legend table (logo, name, share), never from colour alone.
const RAMP = { dark: ['#4C90F0', '#215DB0', '#8ABBFF', '#184A90', '#2D72D2', '#C0DBFF', '#10336A'], light: ['#2D72D2', '#8ABBFF', '#184A90', '#4C90F0', '#10336A', '#C0DBFF', '#215DB0'] };

function RunningPie() {
  const { social } = useAppState();
  const now = useNow();
  const theme = useTheme();
  const t = theme.palette.tokens;
  const open = useOpenPlatform();
  const [hover, setHover] = useState<number | null>(null);

  const { rows, total, jobs } = useMemo(() => {
    const running = social.archive.filter((j) => j.status === 'In Progress');
    const rows = archivePlatforms(social.archive)
      .map((id) => {
        const js = running.filter((j) => jobPlatform(j) === id);
        return { id, jobs: js.length, items: js.reduce((a, j) => a + jobCount(j, now), 0) };
      })
      .filter((r) => r.jobs)
      .sort((a, b) => b.items - a.items);
    return { rows, total: rows.reduce((a, r) => a + r.items, 0), jobs: running.length };
  }, [social.archive, now]);

  const navigate = useNavigate();
  if (!rows.length)
    return (
      <Card>
        <CardHeader title="Running crawls by platform" subheader="Items processed so far" />
        <EmptyState icon={<Insights />} title="No crawls running" action={<Button startIcon={<ManageSearch />} onClick={() => navigate('/entity')}>Go to Entity Search</Button>}>
          Select a profile in Entity Search to start one.
        </EmptyState>
      </Card>
    );

  const colors = RAMP[theme.palette.mode];
  const share = (v: number) => (total ? Math.round((v / total) * 100) : 0);
  return (
    <Card>
      <CardHeader title="Running crawls by platform" subheader={`${fmt(total)} items processed so far across ${jobs} running crawl${jobs > 1 ? 's' : ''}. Updates live.`} />
      <Grid container spacing={3} sx={{ px: 2.5, pb: 2.5, alignItems: 'center' }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ position: 'relative', height: 260, maxWidth: 320, mx: 'auto' }} role="img" aria-label={`Pie chart of items processed by running crawls: ${rows.map((r) => `${platformName(r.id)} ${r.items}`).join(', ')}`}>
            <PieChart
              hideLegend
              skipAnimation // values change every second; re-animating each tick makes the arcs jump
              height={260}
              margin={{ top: 4, bottom: 4, left: 4, right: 4 }}
              highlightedItem={hover === null ? null : { seriesId: 'running', dataIndex: hover }}
              onHighlightChange={(h) => setHover(h?.dataIndex ?? null)}
              onItemClick={(_, d) => open(rows[d.dataIndex].id)}
              series={[
                {
                  id: 'running',
                  data: rows.map((r, i) => ({ id: r.id, value: r.items, label: platformName(r.id), color: colors[i % colors.length] })),
                  innerRadius: '58%',
                  outerRadius: '96%',
                  paddingAngle: 1.5,
                  cornerRadius: 3,
                  arcLabel: (d) => `${share(d.value)}%`,
                  arcLabelMinAngle: 28,
                  highlightScope: { fade: 'global', highlight: 'item' },
                  faded: { additionalRadius: -4, color: t.surface3 },
                  valueFormatter: (v) => `${fmt(v.value)} items`,
                },
              ]}
              sx={{
                cursor: 'pointer',
                '& .MuiPieArc-root': { stroke: theme.palette.background.paper, strokeWidth: 2 },
                // White label with a dark halo reads on every step of the ramp.
                '& .MuiPieArcLabel-root': { fill: '#fff', fontWeight: 600, fontSize: 13, paintOrder: 'stroke', stroke: 'rgba(17,20,24,.55)', strokeWidth: 3, strokeLinejoin: 'round', pointerEvents: 'none' },
              }}
            />
            <Stack sx={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <Typography sx={{ fontFamily: t.mono, fontSize: 24, fontWeight: 500, lineHeight: 1.1 }}>{fmt(total)}</Typography>
              <Typography variant="caption" color="text.secondary">items processed</Typography>
            </Stack>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <Table size="small" aria-label="Running crawls by platform" sx={{ '& th, & td': { px: { xs: 1, sm: 2.5 } } }}>
            <TableHead>
              <TableRow><TableCell>Platform</TableCell><TableCell align="right">Running</TableCell><TableCell align="right">Items</TableCell><TableCell align="right">Share</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow
                  key={r.id}
                  hover
                  selected={hover === i}
                  tabIndex={0}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  onClick={() => open(r.id)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open(r.id))}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: 0.5, bgcolor: colors[i % colors.length], flexShrink: 0 }} aria-hidden="true" />
                      <PlatformLogo platform={r.id} size={18} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{platformName(r.id)}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: t.mono }}>{r.jobs}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: t.mono, fontWeight: 600 }}>{fmt(r.items)}</TableCell>
                  <TableCell align="right" sx={{ fontFamily: t.mono }}>{share(r.items)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>Select a slice or a row to open that platform’s crawls.</Typography>
        </Grid>
      </Grid>
    </Card>
  );
}

function PlatformCards({ jobs }: { jobs: CrawlJob[] }) {
  const ids = useMemo(() => archivePlatforms(jobs), [jobs]);
  return (
    <Box component="section" aria-labelledby="platforms-title">
      <Reveal>
        <Typography id="platforms-title" variant="h2">Platforms</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>Select a platform to see its crawls and collected data.</Typography>
      </Reveal>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
        {ids.map((id, i) => <PlatformCard key={id} id={id} jobs={jobs} order={i} />)}
      </Box>
    </Box>
  );
}

const PlatformCard = memo(function PlatformCard({ id, jobs, order }: { id: Platform; jobs: CrawlJob[]; order: number }) {
  const now = useNow();
  const open = useOpenPlatform();
  const t = useTheme().palette.tokens;
  const js = jobs.filter((j) => jobPlatform(j) === id);
  const run = js.filter((j) => j.status === 'In Progress').length;
  const items = js.reduce((a, j) => a + jobCount(j, now), 0);
  const last = js.reduce((a, j) => Math.max(a, j.startedAt), 0);
  const figs: [string, number, boolean][] = [['Crawls', js.length, false], ['Running', run, run > 0], ['Items', items, false]];
  return (
    <Reveal order={order} sx={{ height: '100%' }}>
      <ButtonBase
        onClick={() => open(id)}
        aria-label={`${platformName(id)}: ${js.length} crawls, ${run} running, ${items} items collected`}
        sx={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', borderRadius: 1, border: 1, borderColor: 'divider',
          bgcolor: 'background.paper', transition: 'border-color 110ms, transform 240ms cubic-bezier(.2,0,.38,.9)',
          '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
        }}
      >
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', px: 2, pt: 2 }}>
          <PlatformLogo platform={id} size={24} />
          <Typography variant="h3">{platformName(id)}</Typography>
        </Stack>
        <Grid container sx={{ px: 2, py: 2 }}>
          {figs.map(([label, v, hot]) => (
            <Grid key={label} size={4}>
              <Typography variant="overline" color="text.secondary" component="div">{label}</Typography>
              <Typography sx={{ fontFamily: t.mono, fontSize: 20, fontWeight: 500, color: hot ? 'warning.main' : 'text.primary' }}><CountUp value={v} /></Typography>
            </Grid>
          ))}
        </Grid>
        <Stack direction="row" sx={{ mt: 'auto', px: 2, py: 1.25, borderTop: 1, borderColor: 'divider', justifyContent: 'space-between', alignItems: 'center', color: 'text.secondary' }}>
          <Typography variant="caption">{last ? `Last crawl ${ago(last, now)}` : 'No crawls yet'}</Typography>
          <ChevronRight fontSize="small" />
        </Stack>
      </ButtonBase>
    </Reveal>
  );
});
