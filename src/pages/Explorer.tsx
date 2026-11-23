import { useDeferredValue, useMemo, type KeyboardEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, CardHeader, Grid, InputAdornment, LinearProgress, MenuItem, Stack, TextField, Typography, useTheme } from '@mui/material';
import { ArticleOutlined, Download, FolderOutlined, PeopleOutline, PublicOutlined, Search, StorageOutlined, VerifiedUserOutlined } from '@mui/icons-material';
import { entities, feed } from '../data/demo';
import { EmptyState, PageHeader, Reveal, StatusTag } from '../components/ui';
import { useOpenNameSearch } from '../hooks/useOpenSearch';
import { csvDownload } from '../lib/osint';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { FeedItem } from '../types';

type Icon = 'org' | 'person' | 'doc' | 'web';
// [x, y, label, reference, icon, entity index to search, or -1]
const NODES: [number, number, string, string, Icon, number][] = [
  [380, 170, 'Helio Freight Group', 'EN-2048', 'org', 0],
  [120, 56, 'Mira Solen', 'EN-2049', 'person', 1],
  [640, 56, 'Harborline Consultants', 'EN-2050', 'org', 2],
  [120, 290, 'Dockside Logistics', 'EN-2051', 'org', 3],
  [640, 290, 'Public news archive', 'SRC-114', 'doc', -1],
  [380, 296, '@heliofreight', 'Facebook page', 'web', -1],
];
// [from, to, relationship, backed by a cited source?]
const EDGES: [number, number, string, boolean][] = [[1, 0, 'Representative of', true], [2, 0, 'Advises', false], [3, 0, 'Logistics partner', false], [4, 0, 'Mentions', true], [0, 5, 'Operates account', true], [1, 2, 'Listed with', false]];
const NODE_ICON: Record<Icon, ReactNode> = {
  org: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18" /></>,
  person: <><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  doc: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
  web: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
};

export default function Explorer() {
  const { explorerQuery: query, explorerSource: source } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const deferred = useDeferredValue(query);
  const rows = useMemo(() => {
    const q = deferred.toLowerCase();
    return feed.filter((x) => (source === 'All sources' || source === x.kind) && (!q || [x.title, x.desc, x.kind].join(' ').toLowerCase().includes(q)));
  }, [deferred, source]);
  return (
    <Stack spacing={3}>
      <PageHeader
        title="OSINT Explorer"
        description="Explore source coverage, public narratives, and entity relationship signals."
        actions={<Button startIcon={<Download />} onClick={() => csvDownload('demo_source_feed.csv', [['Type', 'Title', 'Description', 'Time'], ...feed.map((x) => [x.kind, x.title, x.desc, x.time])])}>Export feed</Button>}
      />
      <Reveal><LinkChart /></Reveal>
      <Grid container spacing={2} sx={{ alignItems: 'flex-start' }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Reveal>
            <Card>
              <CardHeader title="Source activity" subheader="Public-source events in the demo index" action={<Typography variant="caption" color="text.secondary">{rows.length} events</Typography>} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ px: 2.5, pb: 2 }}>
                <TextField
                  fullWidth
                  value={query}
                  onChange={(e) => dispatch({ type: 'setExplorer', query: e.target.value, source })}
                  placeholder="Filter source events…"
                  slotProps={{ htmlInput: { 'aria-label': 'Filter source events' }, input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
                />
                <TextField select value={source} onChange={(e) => dispatch({ type: 'setExplorer', query, source: e.target.value })} sx={{ minWidth: 170 }} slotProps={{ htmlInput: { 'aria-label': 'Source type' } }}>
                  {['All sources', 'Web', 'News', 'Social', 'Registry'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              </Stack>
              {rows.length ? rows.map((v) => <FeedRow key={v.title} item={v} />) : <EmptyState icon={<Search />} title="No matching source events" minHeight={180}>Clear filters to display the synthetic activity feed.</EmptyState>}
            </Card>
          </Reveal>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2}>
            <Reveal order={1}><CollectionMix /></Reveal>
            <Reveal order={2}>
              <Card>
                <CardHeader title="Analyst notes" subheader="Evidence quality guidance" action={<VerifiedUserOutlined sx={{ color: 'text.secondary' }} />} />
                <CardContent sx={{ pt: 0 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    The demo network represents claims and associations, not proof of affiliation. A production implementation should show source URLs, collection times, verification level, and analyst decisions before promoting any link to a finding.
                  </Typography>
                  <Button size="small" startIcon={<FolderOutlined />} sx={{ mt: 2 }} onClick={() => navigate('/hub')}>Open Intelligence Hub</Button>
                </CardContent>
              </Card>
            </Reveal>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}

function FeedRow({ item: v }: { item: FeedItem }) {
  const icon = v.kind === 'Social' ? <PeopleOutline fontSize="small" /> : v.kind === 'News' ? <ArticleOutlined fontSize="small" /> : v.kind === 'Registry' ? <StorageOutlined fontSize="small" /> : <PublicOutlined fontSize="small" />;
  return (
    <Stack direction="row" spacing={1.5} sx={{ px: 2.5, py: 2, borderTop: 1, borderColor: 'divider' }}>
      <Box sx={{ width: 32, height: 32, borderRadius: 1, display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: 'tokens.surface2', color: 'text.secondary' }}>{icon}</Box>
      <Box sx={{ minWidth: 0 }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 0.75 }}>
          <StatusTag label={v.kind} tone="blue" />
          <Typography variant="caption" color="tokens.soft">{v.time}</Typography>
        </Stack>
        <Typography variant="h4">{v.title}</Typography>
        <Typography variant="body2" color="text.secondary">{v.desc}</Typography>
        <Typography variant="caption" color="tokens.soft">Source: {v.source} · Demo-only reference</Typography>
      </Box>
    </Stack>
  );
}

function CollectionMix() {
  const t = useTheme().palette.tokens;
  const rows: [string, number, string][] = [['Web & domains', 38, t.data], ['News & articles', 30, t.green], ['Public social', 22, t.amber], ['Registry records', 10, t.soft]];
  return (
    <Card>
      <CardHeader title="Collection mix" subheader="Example source mix" action={<StorageOutlined sx={{ color: 'text.secondary' }} />} />
      <CardContent sx={{ pt: 0 }}>
        {rows.map(([l, v, c]) => (
          <Box key={l} sx={{ mb: 2 }}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.75 }}>
              <Typography variant="body2">{l}</Typography>
              <Typography variant="body2" sx={{ fontFamily: t.mono, fontWeight: 600 }}>{v}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={v} aria-label={`${l} ${v}%`} sx={{ '& .MuiLinearProgress-bar': { bgcolor: c } }} />
          </Box>
        ))}
        <Typography variant="caption" color="text.secondary">Source distribution is illustrative, not measured platform coverage.</Typography>
      </CardContent>
    </Card>
  );
}

function LinkChart() {
  const theme = useTheme();
  const t = theme.palette.tokens;
  const open = useOpenNameSearch();
  const W = 184, H = 46;
  return (
    <Card>
      <CardHeader
        title="Link analysis"
        subheader="Relationships around Helio Freight Group. Select an entity to search its profiles."
        action={
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', color: 'text.secondary', fontSize: 12 }} aria-hidden="true">
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}><Box sx={{ width: 22, borderTop: `2px solid ${t.link}` }} />Sourced</Stack>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}><Box sx={{ width: 22, borderTop: `2px dashed ${t.soft}` }} />Unverified</Stack>
          </Stack>
        }
        sx={{ flexWrap: 'wrap' }}
      />
      <Box sx={{ overflowX: 'auto', px: 2.5, pb: 2.5 }} tabIndex={0} aria-label="Link chart, scrolls sideways on small screens">
        <Box
          component="svg"
          viewBox="0 0 760 340"
          role="img"
          aria-label="Link chart: Helio Freight Group linked to Mira Solen, Harborline Consultants, Dockside Logistics, a news archive and a Facebook page. Three links are sourced, three unverified."
          sx={{
            display: 'block', width: '100%', minWidth: 640, height: 'auto', borderRadius: 1, bgcolor: 'background.default',
            '& .node rect': { fill: t.surface2, stroke: t.stroke, strokeWidth: 1, transition: 'stroke 110ms, fill 110ms' },
            '& .node.focus rect': { stroke: theme.palette.primary.main, strokeWidth: 2 },
            '& .node.link': { cursor: 'pointer', outline: 'none' },
            '& .node.link:hover rect, & .node.link:focus-visible rect': { stroke: t.link, strokeWidth: 2, fill: t.surface3 },
          }}
        >
          <defs>
            <pattern id="lcgrid" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill={t.stroke} /></pattern>
          </defs>
          <rect width="760" height="340" fill="url(#lcgrid)" />
          {EDGES.map(([a, b, label, ok]) => {
            const [x1, y1] = NODES[a], [x2, y2] = NODES[b];
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, lw = label.length * 6.4 + 14;
            return (
              <g key={label}>
                <title>{`${label}: ${ok ? 'supported by a cited source' : 'not yet verified'}`}</title>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={ok ? t.link : t.soft} strokeWidth={ok ? 1.6 : 1.3} strokeDasharray={ok ? undefined : '5 4'} />
                <rect x={mx - lw / 2} y={my - 10} width={lw} height={20} rx={3} fill={theme.palette.background.paper} stroke={t.stroke} />
                <text x={mx} y={my + 4} textAnchor="middle" fontSize="11" fill={ok ? t.link : theme.palette.text.secondary}>{label}</text>
              </g>
            );
          })}
          {NODES.map(([x, y, label, ref, icon, idx], i) => {
            const go = () => open(entities[idx].name);
            return (
              <g
                key={label}
                className={`node${i === 0 ? ' focus' : ''}${idx >= 0 ? ' link' : ''}`}
                {...(idx >= 0 && { tabIndex: 0, role: 'link', 'aria-label': `Search profiles for ${label}`, onClick: go, onKeyDown: (e: KeyboardEvent) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), go()) })}
              >
                <title>{`${label} (${ref})${idx >= 0 ? ' · select to search profiles' : ''}`}</title>
                <rect x={x - W / 2} y={y - H / 2} width={W} height={H} rx={5} />
                <g transform={`translate(${x - W / 2 + 10} ${y - 9}) scale(.75)`} fill="none" stroke={t.link} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{NODE_ICON[icon]}</g>
                <text x={x - W / 2 + 34} y={y - 2} fontSize="12.5" fontWeight="600" fill={theme.palette.text.primary}>{label}</text>
                <text x={x - W / 2 + 34} y={y + 13} fontSize="11" fontFamily={t.mono} fill={t.soft}>{ref}</text>
              </g>
            );
          })}
        </Box>
      </Box>
    </Card>
  );
}
