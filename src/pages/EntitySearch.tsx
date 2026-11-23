import { memo, useCallback, useEffect, useMemo, useRef, useState, useTransition, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  alpha, Box, Button, ButtonBase, Card, CardHeader, FormControlLabel, Grid, IconButton, Link, Radio, RadioGroup, Skeleton, Stack, TextField,
  Tooltip, Typography,
} from '@mui/material';
import { ArticleOutlined, CheckCircleOutline, ChevronRight, History, InfoOutlined, ManageSearch, OpenInNew, PeopleOutline, PersonOutline, Refresh, Search, ShieldOutlined, TravelExploreOutlined } from '@mui/icons-material';
import { socialPlatforms } from '../data/profiles';
import { PlatformLogo, SocialAvatar } from '../components/brand';
import { EmptyState, Highlight, Mono, PageHeader, Reveal, StatusTag } from '../components/ui';
import { FB_CATS, FB_SCOPE_EXAMPLE, jobProgress, matchProfiles, platformName } from '../lib/osint';
import { useNow } from '../state/clock';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { CrawlJob, FbCategory, Profile, SearchMode } from '../types';

const FB_ICON: Record<FbCategory, ReactNode> = { Users: <PersonOutline fontSize="small" />, Groups: <PeopleOutline fontSize="small" />, Pages: <ArticleOutlined fontSize="small" /> };

export default function EntitySearch() {
  const { social } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const mode = social.mode;
  const running = social.archive.filter((j) => j.status === 'In Progress').length;
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Entity Search"
        description="Find social media profiles by name or exact username, then select a profile to crawl it."
        actions={
          <Button startIcon={<History />} onClick={() => navigate('/archive')} sx={{ gap: 0.5 }}>
            Entity Archive
            {running > 0 && <Box component="span" sx={{ ml: 1, display: 'inline-flex' }}><StatusTag label={`${running} running`} tone="amber" /></Box>}
          </Button>
        }
      />
      <Grid container spacing={2} role="radiogroup" aria-label="Search type">
        <Grid size={{ xs: 12, sm: 6 }}>
          <ModeCard active={mode === 'name'} onClick={() => dispatch({ type: 'setMode', mode: 'name' })} icon={<ManageSearch />} title="Entity Name Search" text="Discover matching names, pages and groups across platforms" order={0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <ModeCard active={mode === 'username'} onClick={() => dispatch({ type: 'setMode', mode: 'username' })} icon={<PeopleOutline />} title="Username Search" text="Find accounts that use this exact username" order={1} />
        </Grid>
      </Grid>
      <Reveal order={2}>
        {/* keyed by mode so each mode keeps its own draft term */}
        <SearchConfig key={mode} mode={mode} />
      </Reveal>
      <Reveal order={3}>
        <Results mode={mode} />
      </Reveal>
      <Stack direction="row" spacing={1} sx={{ color: 'text.secondary', alignItems: 'flex-start' }}>
        <ShieldOutlined fontSize="small" sx={{ mt: '1px' }} />
        <Typography variant="body2">
          Prototype behavior: profiles are synthetic, URLs point to example.com, and no live platform search or collection is performed. Crawl jobs are simulated and saved locally in this browser.
        </Typography>
      </Stack>
    </Stack>
  );
}

function ModeCard({ active, onClick, icon, title, text, order }: { active: boolean; onClick: () => void; icon: ReactNode; title: string; text: string; order: number }) {
  return (
    <Reveal order={order} sx={{ height: '100%' }}>
      <ButtonBase
        role="radio"
        aria-checked={active}
        onClick={onClick}
        sx={{
          width: '100%', height: '100%', p: 2, gap: 2, justifyContent: 'flex-start', textAlign: 'left', borderRadius: 1, border: 1,
          borderColor: active ? 'primary.main' : 'divider', bgcolor: (t) => (active ? alpha(t.palette.primary.main, 0.1) : t.palette.background.paper),
          boxShadow: (t) => (active ? `inset 0 0 0 1px ${t.palette.primary.main}` : 'none'),
          transition: 'border-color 110ms, background-color 110ms', '&:hover': { borderColor: active ? 'primary.main' : 'text.secondary' },
        }}
      >
        <Box sx={{ width: 44, height: 44, borderRadius: 1, display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: active ? 'primary.main' : 'tokens.surface2', color: active ? '#fff' : 'text.secondary' }}>{icon}</Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h3">{title}</Typography>
          <Typography variant="body2" color="text.secondary">{text}</Typography>
        </Box>
        {active ? <CheckCircleOutline sx={{ color: 'tokens.link' }} /> : <ChevronRight sx={{ color: 'text.secondary' }} />}
      </ButtonBase>
    </Reveal>
  );
}

function SearchConfig({ mode }: { mode: SearchMode }) {
  const { social } = useAppState();
  const dispatch = useAppDispatch();
  const committed = social.terms[mode];
  const [draft, setDraft] = useState(committed);
  // Follow searches started elsewhere (top-bar search, "Clear search"); after a normal submit this is a no-op.
  useEffect(() => setDraft(committed), [committed]);
  const [, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const selected = social.platforms[mode];
  const loading = social.loading === mode;
  const name = mode === 'name';

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = draft.trim();
    if (!term) return dispatch({ type: 'toast', text: 'Enter a name or username to search.' });
    if (!selected.length) return dispatch({ type: 'toast', text: 'Choose at least one social media platform.' });
    dispatch({ type: 'setTerm', term });
    dispatch({ type: 'searchStart' });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => dispatch({ type: 'searchDone', mode }), 650);
  };

  const reset = () => {
    clearTimeout(timer.current);
    setDraft('');
    dispatch({ type: 'resetSearch' });
    inputRef.current?.focus();
  };

  return (
    <Card>
      <CardHeader
        title={name ? 'Find profiles by entity name' : 'Find accounts by exact username'}
        subheader={name ? 'Search for matching or similar display names across selected sources' : 'Look up the same username across selected social platforms'}
        action={<StatusTag label={name ? 'Similar names' : 'Exact match'} tone="blue" />}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      />
      <Stack spacing={2.5} sx={{ p: 2.5 }}>
        <Stack component="form" onSubmit={submit} direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'flex-end' } }}>
          <TextField
            label={name ? 'Person or entity name' : 'Social media username'}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={name ? 'e.g. Mira Solen or Helio Freight' : 'e.g. mira.solen (without @)'}
            fullWidth
            autoComplete="off"
            inputRef={inputRef}
            slotProps={{ htmlInput: { maxLength: 120 }, inputLabel: { shrink: true } }}
          />
          <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
            <Button type="submit" variant="contained" startIcon={<Search />} disabled={loading} sx={{ height: 40 }}>{loading ? 'Searching…' : 'Search profiles'}</Button>
            <Button type="button" startIcon={<Refresh />} onClick={reset} sx={{ height: 40 }}>Reset</Button>
          </Stack>
        </Stack>

        <Box>
          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} id="platforms-label">Choose platforms · {selected.length} selected</Typography>
            <Stack direction="row" spacing={2}>
              <Link component="button" type="button" variant="body2" onClick={() => startTransition(() => dispatch({ type: 'setAllPlatforms', all: true }))}>Select all</Link>
              <Link component="button" type="button" variant="body2" onClick={() => startTransition(() => dispatch({ type: 'setAllPlatforms', all: false }))}>Clear</Link>
            </Stack>
          </Stack>
          <Grid container spacing={1} role="group" aria-labelledby="platforms-label">
            {socialPlatforms.map((p) => {
              const on = selected.includes(p.id);
              return (
                <Grid key={p.id} size={{ xs: 6, sm: 4, md: 'grow' }}>
                  <ButtonBase
                    aria-pressed={on}
                    onClick={() => startTransition(() => dispatch({ type: 'togglePlatform', platform: p.id }))}
                    sx={{
                      width: '100%', height: 44, px: 1.5, gap: 1.25, justifyContent: 'flex-start', borderRadius: 1, border: 1, fontSize: 14, fontWeight: 500,
                      borderColor: on ? 'primary.main' : 'divider', bgcolor: (t) => (on ? alpha(t.palette.primary.main, 0.1) : 'transparent'),
                      color: on ? 'text.primary' : 'text.secondary', '&:hover': { borderColor: on ? 'primary.main' : 'text.secondary' },
                    }}
                  >
                    <PlatformLogo platform={p.id} />
                    <Box component="span" sx={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</Box>
                    {on && <CheckCircleOutline fontSize="small" sx={{ color: 'tokens.link' }} />}
                  </ButtonBase>
                </Grid>
              );
            })}
          </Grid>
        </Box>

        {mode === 'username' && selected.includes('facebook') && <FbScopeField />}

        <Stack direction="row" spacing={1.25} sx={{ p: 1.5, borderRadius: 1, bgcolor: 'tokens.surface2', alignItems: 'flex-start' }}>
          <InfoOutlined fontSize="small" sx={{ color: 'tokens.link', mt: '1px' }} />
          <Typography variant="body2" color="text.secondary">
            {name ? 'Facebook results appear as Users, Groups and Pages side by side. Select any profile to set up a crawl.' : 'Username matching is exact. Select any account to set up a crawl, just as in Name Search.'}{' '}
            <b>Demo examples:</b> {name ? 'Mira, Kara, Brightwater, Harbor, Helio, Atlas' : 'mira.solen, kara.vellin, harbor.watch, brightwater.shipping, heliofreight'}.
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

function FbScopeField() {
  const { social } = useAppState();
  const dispatch = useAppDispatch();
  return (
    <Box component="fieldset" sx={{ border: 0, p: 0, m: 0 }}>
      <Typography component="legend" variant="body2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
        <PlatformLogo platform="facebook" size={16} /> Search Facebook for
      </Typography>
      <RadioGroup row name="fbScope" value={social.fbScope} onChange={(e) => dispatch({ type: 'setFbScope', scope: e.target.value as FbCategory })} sx={{ gap: 1 }}>
        {FB_CATS.map((c) => (
          <FormControlLabel
            key={c}
            value={c}
            control={<Radio size="small" />}
            label={<Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>{FB_ICON[c]}<span>{c}</span></Stack>}
            sx={{
              m: 0, pr: 1.5, pl: 0.5, height: 40, borderRadius: 1, border: 1,
              borderColor: social.fbScope === c ? 'primary.main' : 'divider', bgcolor: (t) => (social.fbScope === c ? alpha(t.palette.primary.main, 0.1) : 'transparent'),
            }}
          />
        ))}
      </RadioGroup>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Other platforms are searched as usual. Try <Mono sx={{ color: 'tokens.link' }}>{FB_SCOPE_EXAMPLE[social.fbScope]}</Mono> for Facebook {social.fbScope.toLowerCase()}.
      </Typography>
    </Box>
  );
}

function Results({ mode }: { mode: SearchMode }) {
  const { social } = useAppState();
  const dispatch = useAppDispatch();
  const term = social.terms[mode];
  const platforms = social.platforms[mode];
  const searched = social.searched[mode];

  const rows = useMemo(
    () => (searched ? matchProfiles({ mode, term, platforms, fbScope: social.fbScope }) : []),
    [searched, mode, term, platforms, social.fbScope],
  );
  // Latest job per profile, so each result can show its crawl state.
  const latest = useMemo(() => {
    const m = new Map<string, CrawlJob>();
    for (const j of social.archive) if (!m.has(j.profileId)) m.set(j.profileId, j);
    return m;
  }, [social.archive]);
  const choose = useCallback((id: string) => dispatch({ type: 'chooseProfile', id }), [dispatch]);

  if (social.loading === mode)
    return (
      <Card aria-busy="true">
        <CardHeader title="Searching demonstration index" subheader="Matching fictional profiles on selected platforms…" action={<StatusTag label="Searching" tone="blue" />} />
        <Grid container spacing={1.5} sx={{ p: 2.5, pt: 0 }}>
          {[0, 1, 2].map((i) => <Grid key={i} size={{ xs: 12, md: 4 }}><Skeleton variant="rounded" height={76} /></Grid>)}
        </Grid>
      </Card>
    );

  if (!searched)
    return (
      <Card>
        <CardHeader title="Search results" subheader="Profiles from the selected social media platforms" action={<StatusTag label="Ready" />} />
        <EmptyState icon={<TravelExploreOutlined />} title="Ready to discover profiles">
          Enter a {mode === 'name' ? 'person or entity name' : 'specific username'}, choose your platforms, and select Search. Try {mode === 'name' ? '“Mira”, “Helio” or “Atlas”' : '“mira.solen”, “heliofreight” or “atlaswatch”'}.
        </EmptyState>
      </Card>
    );

  if (!rows.length)
    return (
      <Card>
        <CardHeader title="Search results" subheader="Search completed in the local demonstration index" action={<StatusTag label="0 matches" />} />
        <EmptyState icon={<Search />} title="No matching demo profiles" action={<Button startIcon={<Refresh />} onClick={() => dispatch({ type: 'resetSearch' })}>Clear search</Button>}>
          Try a different {mode === 'name' ? 'name' : 'exact username'} or select more platforms. This prototype does not query live social media.
        </EmptyState>
      </Card>
    );

  const fbOn = platforms.includes('facebook');
  const fb = rows.filter((p) => p.platform === 'facebook');
  const others = rows.filter((p) => p.platform !== 'facebook');
  const cats = FB_CATS.filter((c) => mode !== 'username' || c === social.fbScope);
  const item = (p: Profile) => <ResultItem key={p.id} profile={p} term={term} chosen={social.selected[mode] === p.id} job={latest.get(p.id)} onChoose={choose} />;

  return (
    <Card>
      <CardHeader
        title="Matching profiles"
        subheader={`${mode === 'name' ? 'Name-based discovery' : 'Exact username match'} · ${term}`}
        action={<StatusTag label={`${rows.length} sample match${rows.length === 1 ? '' : 'es'}`} tone="blue" />}
      />
      {fbOn && (
        <Box component="section" aria-label="Facebook results" sx={{ px: 2.5, pb: 2.5 }}>
          <SectionTitle title={<><PlatformLogo platform="facebook" size={18} /> Facebook</>} count={`${fb.length} match${fb.length === 1 ? '' : 'es'}`} />
          <Grid container spacing={2}>
            {cats.map((cat) => {
              const list = fb.filter((p) => p.category === cat);
              return (
                <Grid key={cat} size={{ xs: 12, md: cats.length === 1 ? 12 : 4 }}>
                  <Box role="group" aria-label={`Facebook ${cat.toLowerCase()}`} sx={{ height: '100%', borderRadius: 1, border: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 1.5, height: 44, borderBottom: 1, borderColor: 'divider', color: 'text.secondary' }}>
                      {FB_ICON[cat]}
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', flex: 1 }}>{cat}</Typography>
                      <Mono sx={{ color: 'tokens.soft' }}>{list.length}</Mono>
                    </Stack>
                    {list.length ? (
                      <Grid container spacing={1} sx={{ p: 1 }}>
                        {list.map((p) => <Grid key={p.id} size={{ xs: 12, sm: cats.length === 1 ? 6 : 12, lg: cats.length === 1 ? 4 : 12 }}>{item(p)}</Grid>)}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="tokens.soft" sx={{ p: 2, textAlign: 'center' }}>No matching {cat.toLowerCase()}</Typography>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}
      {others.length > 0 && (
        <Box component="section" aria-label="Other platforms" sx={{ px: 2.5, pb: 2.5, pt: fbOn ? 2.5 : 0, borderTop: fbOn ? 1 : 0, borderColor: 'divider' }}>
          <SectionTitle title="Other platforms" count={`${others.length} profile${others.length === 1 ? '' : 's'}`} />
          <Grid container spacing={1}>
            {others.map((p) => <Grid key={p.id} size={{ xs: 12, sm: 6, lg: 4 }}>{item(p)}</Grid>)}
          </Grid>
        </Box>
      )}
    </Card>
  );
}

function SectionTitle({ title, count }: { title: ReactNode; count: string }) {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
      <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>{title}</Typography>
      <Typography variant="caption" color="text.secondary">{count}</Typography>
    </Stack>
  );
}

/** One result card. Memoised: the list re-renders on every search, the cards only when their own data changes. */
const ResultItem = memo(function ResultItem({ profile: p, term, chosen, job, onChoose }: { profile: Profile; term: string; chosen: boolean; job?: CrawlJob; onChoose: (id: string) => void }) {
  return (
    <Stack
      direction="row"
      sx={{
        height: '100%', borderRadius: 1, border: 1, overflow: 'hidden', bgcolor: 'background.paper',
        borderColor: chosen ? 'primary.main' : 'divider', boxShadow: (t) => (chosen ? `inset 3px 0 0 ${t.palette.primary.main}` : 'none'),
        transition: 'border-color 110ms', '&:hover': { borderColor: chosen ? 'primary.main' : 'text.secondary' },
      }}
    >
      <ButtonBase
        onClick={() => onChoose(p.id)}
        aria-haspopup="dialog"
        aria-label={`Set up crawl for ${p.name}, ${platformName(p.platform)} ${p.category}`}
        sx={{ flex: 1, minWidth: 0, gap: 1.5, p: 1.25, justifyContent: 'flex-start', alignItems: 'flex-start', textAlign: 'left' }}
      >
        <SocialAvatar profile={p} />
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap><Highlight text={p.name} term={term} /></Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div" sx={{ fontFamily: (t) => t.palette.tokens.mono }}>@<Highlight text={p.username} term={term} /></Typography>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.5, minWidth: 0 }}>
            {p.platform !== 'facebook' && <PlatformLogo platform={p.platform} size={14} />}
            <Typography variant="caption" color="tokens.soft" noWrap>{p.meta ?? `${platformName(p.platform)} · ${p.category}`}</Typography>
          </Stack>
          {job && <Box sx={{ mt: 0.75 }}><CrawlState job={job} /></Box>}
        </Box>
      </ButtonBase>
      <Tooltip title="Open fictional profile URL (example.com)">
        <IconButton
          component="a"
          href={p.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${p.name} profile in a new tab`}
          sx={{ borderRadius: 0, borderLeft: 1, borderColor: 'divider', width: 40, color: 'text.secondary' }}
        >
          <OpenInNew sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
});

function CrawlState({ job }: { job: CrawlJob }) {
  if (job.status === 'Completed') return <StatusTag label="Crawled" tone="green" />;
  if (job.status === 'Failed') return <StatusTag label="Crawl failed" tone="red" />;
  return <LiveProgress job={job} />;
}

/** Only running crawls subscribe to the clock. */
function LiveProgress({ job }: { job: CrawlJob }) {
  const now = useNow();
  return <StatusTag label={`Crawling ${jobProgress(job, now)}%`} tone="amber" />;
}
