import { memo, useMemo, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  alpha, Box, Button, ButtonBase, Card, CardContent, CardHeader, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  ToggleButton, ToggleButtonGroup, Typography, useTheme,
} from '@mui/material';
import { Add, DescriptionOutlined, Download, PeopleOutline, VerifiedUserOutlined, WarningAmberOutlined } from '@mui/icons-material';
import { LineChart } from '@mui/x-charts/LineChart';
import { basePeriod, operationalActivity, recentSearches, type ActivityIcon } from '../data/demo';
import { PageHeader, Reveal, StatCard, StatusTag } from '../components/ui';
import { useOpenNameSearch } from '../hooks/useOpenSearch';
import { fmt } from '../lib/osint';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { Granularity, PeriodKey, PeriodStats, SeriesKey } from '../types';

const PERIODS: [PeriodKey, string][] = [['today', 'Today'], ['7d', '7 days'], ['30d', '30 days'], ['custom', 'Custom']];

export default function Dashboard() {
  const { period } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const p = basePeriod[period];
  const rate = (v: number) => ((v / p.searches) * 100).toFixed(1);
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Dashboard"
        description="Monitor entity investigations, intelligence activities, and system performance."
        actions={
          <>
            <ToggleButtonGroup
              size="small"
              exclusive
              value={period}
              aria-label="Reporting period"
              onChange={(_, v: PeriodKey | null) => v && v !== 'custom' && dispatch({ type: 'setPeriod', period: v })}
            >
              {PERIODS.map(([id, label]) => <ToggleButton key={id} value={id} onClick={id === 'custom' ? () => dispatch({ type: 'openModal', modal: { type: 'custom' } }) : undefined}>{label}</ToggleButton>)}
            </ToggleButtonGroup>
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/entity')}>New Entity Search</Button>
          </>
        }
      />
      <Grid container spacing={2}>
        {[
          ['Entity searches', p.searches, <><b>{p.change}</b> vs. previous period</>, undefined],
          ['Cases created', p.cases, <><b>+9.6%</b> vs. previous period</>, undefined],
          ['Successful', p.successful, <>{rate(p.successful)}% success rate</>, 'green'],
          ['Failed', p.failed, <>{rate(p.failed)}% failure rate</>, 'red'],
          ['In progress', p.progress, <>Processing now</>, 'amber'],
          ['Active analysts', p.active, <>Active in selected period</>, undefined],
        ].map(([label, value, note, tone], i) => (
          <Grid key={label as string} size={{ xs: 6, md: 4, lg: 2 }}>
            <StatCard label={label as string} value={value as number} note={note} tone={tone as 'green' | undefined} order={i} />
          </Grid>
        ))}
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 8 }}><Reveal sx={{ height: '100%' }}><TrendCard /></Reveal></Grid>
        <Grid size={{ xs: 12, lg: 4 }}><Reveal order={1} sx={{ height: '100%' }}><Outcomes p={p} /></Reveal></Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}><Reveal sx={{ height: '100%' }}><RecentSearches /></Reveal></Grid>
        <Grid size={{ xs: 12, lg: 5 }}><Reveal order={1} sx={{ height: '100%' }}><Activity /></Reveal></Grid>
      </Grid>
    </Stack>
  );
}

const TrendCard = memo(function TrendCard() {
  const { granularity, series } = useAppState();
  const dispatch = useAppDispatch();
  const t = useTheme().palette.tokens;
  // Deterministic sample curves, recomputed only when the granularity changes.
  const data = useMemo(() => {
    const n = granularity === 'Daily' ? 14 : granularity === 'Weekly' ? 8 : 12;
    const total = Array.from({ length: n }, (_, i) => Math.round((granularity === 'Monthly' ? 450 : 80) + Math.sin(i * 0.83) * 16 + i * 7 + Math.cos(i * 1.31) * 11));
    const completed = total.map((v, i) => Math.round(v * (0.79 + 0.028 * Math.sin(i))));
    const failed = total.map((v, i) => Math.max(3, Math.round(v * (0.045 + 0.01 * Math.cos(i)))));
    const unit = granularity === 'Daily' ? 'Day' : granularity === 'Weekly' ? 'Week' : 'Month';
    return { total, completed, failed, labels: total.map((_, i) => `${unit} ${i + 1}`) };
  }, [granularity]);
  const defs: [SeriesKey, string, string][] = [['total', 'Total searches', t.data], ['completed', 'Completed', t.green], ['failed', 'Failed', t.red]];
  const first = data.total[0], last = data.total.at(-1)!;
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader
        title="Entity search volume"
        subheader={`Total searches ${last >= first ? 'rose' : 'fell'} from ${first} to ${last} per ${granularity === 'Daily' ? 'day' : granularity === 'Weekly' ? 'week' : 'month'} over this range`}
        action={
          <ToggleButtonGroup size="small" exclusive value={granularity} onChange={(_, v: Granularity | null) => v && dispatch({ type: 'setGranularity', granularity: v })} aria-label="Granularity">
            {(['Daily', 'Weekly', 'Monthly'] as const).map((g) => <ToggleButton key={g} value={g}>{g}</ToggleButton>)}
          </ToggleButtonGroup>
        }
        sx={{ flexWrap: 'wrap' }}
      />
      <Box sx={{ px: 1, height: 260 }}>
        <LineChart
          hideLegend
          height={260}
          margin={{ left: 8, right: 28, top: 12, bottom: 4 }}
          xAxis={[{ scaleType: 'point', data: data.labels, tickLabelStyle: { fontSize: 11, fill: t.soft } }]}
          yAxis={[{ tickLabelStyle: { fontSize: 11, fill: t.soft }, width: 40 }]}
          grid={{ horizontal: true }}
          series={defs.filter(([k]) => series[k]).map(([k, label, color]) => ({ id: k, data: data[k], label, color, area: k === 'total', showMark: true, curve: 'linear' as const }))}
          sx={{
            '& .MuiAreaElement-root': { fillOpacity: 0.12 },
            '& .MuiLineElement-root': { strokeWidth: 2 },
            '& .MuiChartsGrid-line': { stroke: t.stroke },
            '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: t.stroke },
          }}
        />
      </Box>
      <Stack direction="row" spacing={1} useFlexGap sx={{ px: 2.5, pb: 2, pt: 1, alignItems: 'center', flexWrap: 'wrap' }}>
        {defs.map(([k, label, color]) => (
          <ButtonBase
            key={k}
            onClick={() => dispatch({ type: 'toggleSeries', key: k })}
            aria-pressed={series[k]}
            sx={{ gap: 1, px: 1.25, height: 28, borderRadius: 1, fontSize: 13, border: 1, borderColor: 'divider', opacity: series[k] ? 1 : 0.5, '&:hover': { bgcolor: 'tokens.surface2' } }}
          >
            <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: color }} />
            {label}
          </ButtonBase>
        ))}
        <Typography variant="caption" color="tokens.soft" sx={{ ml: 'auto' }}>Hover a point for its count</Typography>
      </Stack>
    </Card>
  );
});

function Outcomes({ p }: { p: PeriodStats }) {
  const t = useTheme().palette.tokens;
  const rows: [string, number, string][] = [['Successful', p.successful, t.green], ['Failed', p.failed, t.red], ['In progress', p.progress, t.amber], ['Queued', p.queued, t.soft]];
  const pct = (v: number) => ((v / p.searches) * 100).toFixed(1);
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Search outcomes" subheader={`${fmt(p.searches)} jobs in the selected period`} />
      <CardContent>
        <Box role="img" aria-label={rows.map(([l, v]) => `${l} ${pct(v)}%`).join(', ')} sx={{ display: 'flex', height: 12, borderRadius: 1, overflow: 'hidden', gap: '2px', mb: 2.5 }}>
          {rows.map(([l, v, c]) => <Box key={l} sx={{ width: `${pct(v)}%`, bgcolor: c }} />)}
        </Box>
        {rows.map(([l, v, c]) => (
          <Stack key={l} direction="row" sx={{ alignItems: 'center', py: 1.25, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: c, mr: 1.25 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>{l}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: t.mono, width: 72, textAlign: 'right' }}>{fmt(v)}</Typography>
            <Typography variant="body2" sx={{ fontFamily: t.mono, fontWeight: 600, width: 64, textAlign: 'right' }}>{pct(v)}%</Typography>
          </Stack>
        ))}
        <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Completion rate</Typography>
          <Typography variant="body2" sx={{ fontFamily: t.mono, fontWeight: 600, color: 'success.main' }}>{pct(p.successful)}%</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function RecentSearches() {
  const navigate = useNavigate();
  const open = useOpenNameSearch();
  return (
    <Card sx={{ height: '100%' }}>
      <CardHeader title="Recent entity searches" subheader="Latest investigation jobs. Select a row to search its profiles." action={<Button size="small" onClick={() => navigate('/entity')}>View all</Button>} />
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow><TableCell>Entity / job</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell><TableCell>Updated</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {recentSearches.map(([name, type, status, updated], i) => (
              <TableRow
                key={name}
                hover
                tabIndex={0}
                onClick={() => open(name)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open(name))}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{name}</Typography>
                  <Typography variant="caption" color="tokens.soft" sx={{ fontFamily: (t) => t.palette.tokens.mono }}>JOB-{3889 + i}</Typography>
                </TableCell>
                <TableCell>{type}</TableCell>
                <TableCell><StatusTag label={status} tone={status === 'Completed' ? 'green' : status === 'Failed' ? 'red' : 'amber'} /></TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary' }}>{updated}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

const ACTIVITY_ICON: Record<ActivityIcon, ReactNode> = {
  shield: <VerifiedUserOutlined fontSize="small" />,
  download: <Download fontSize="small" />,
  alert: <WarningAmberOutlined fontSize="small" />,
  report: <DescriptionOutlined fontSize="small" />,
  users: <PeopleOutline fontSize="small" />,
};

function Activity() {
  const navigate = useNavigate();
  const t = useTheme().palette.tokens;
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader title="Operational activity" subheader="System and workspace events" action={<Button size="small" onClick={() => navigate('/audit')}>Audit logs</Button>} />
      <Box sx={{ flex: 1 }}>
        {operationalActivity.map(([icon, title, desc, time]) => (
          <Stack key={title} direction="row" spacing={1.5} sx={{ px: 2.5, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ width: 32, height: 32, borderRadius: 1, display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: icon === 'alert' ? alpha(t.red, 0.14) : 'tokens.surface2', color: icon === 'alert' ? 'error.main' : 'text.secondary' }}>
              {ACTIVITY_ICON[icon]}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{title}</Typography>
                <Typography variant="caption" color="tokens.soft" sx={{ whiteSpace: 'nowrap' }}>{time}</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">{desc}</Typography>
            </Box>
          </Stack>
        ))}
      </Box>
      <Grid container spacing={1.5} sx={{ p: 2.5, borderTop: 1, borderColor: 'divider' }}>
        {[['99.2%', 'System uptime'], ['08', 'Demo sources'], ['2.4s', 'Median job time']].map(([v, l]) => (
          <Grid key={l} size={4}>
            <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'tokens.surface2', textAlign: 'center' }}>
              <Typography sx={{ fontFamily: t.mono, fontSize: 18, fontWeight: 500 }}>{v}</Typography>
              <Typography variant="caption" color="text.secondary">{l}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Card>
  );
}
