import { useRef, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, alpha, Autocomplete, Avatar, Box, Button, ButtonBase, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, FormHelperText,
  FormLabel, Grid, IconButton, LinearProgress, Link, ListItemIcon, Menu, MenuItem, Stack, TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import { Add, AddToDriveOutlined, Check, CheckCircleOutline, Close, ComputerOutlined, ImageOutlined, NewspaperOutlined, Tag } from '@mui/icons-material';
import { caseTone } from '../components/CaseCard';
import { PlatformLogo, SocialAvatar } from '../components/brand';
import { Mono, PriorityTag, StatusTag } from '../components/ui';
import { demoDriveImages } from '../data/demo';
import { socialPlatforms } from '../data/profiles';
import { CRAWL_COLLECT, findProfile, jobProgress, platformName } from '../lib/osint';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { Modal } from '../state/reducer';
import type { Case, CollectionPlan, NewsChannel, Platform, WorkspaceUser } from '../types';

const FORM_ID = 'dialog-form';

export default function Dialogs() {
  const { modal } = useAppState();
  const dispatch = useAppDispatch();
  const close = () => dispatch({ type: 'closeModal' });
  // Keep the last dialog's content while it animates out.
  const last = useRef<Exclude<Modal, null>>(null);
  if (modal) last.current = modal;
  const m = modal ?? last.current;
  const phone = useMediaQuery(useTheme().breakpoints.down('sm'));
  return (
    <Dialog open={!!modal} onClose={close} fullWidth fullScreen={phone} maxWidth={m?.type === 'case' ? 'md' : 'sm'} aria-labelledby="dialog-title">
      {m?.type === 'crawl' && <CrawlDialog profileId={m.profileId} close={close} />}
      {m?.type === 'case' && <CaseDialog prefill={m.prefill} folderId={m.folderId} close={close} />}
      {m?.type === 'caseview' && <CaseView index={m.index} close={close} />}
      {m?.type === 'folder' && <FolderDialog close={close} />}
      {m?.type === 'invite' && <InviteDialog close={close} />}
      {m?.type === 'forgot' && <ForgotDialog close={close} />}
      {m?.type === 'custom' && <RangeDialog close={close} />}
    </Dialog>
  );
}

const STEPS = ['Case brief', 'Collection plan'];

function Frame({ title, close, children, submit, back, step, id = 'dialog' }: { title: string; close: () => void; children: ReactNode; submit?: string; back?: () => void; step?: number; id?: string }) {
  return (
    <>
      <DialogTitle id={`${id}-title`} component="div" sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, py: 1.75, borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h2" sx={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5 }}>{title}</Typography>
          {step && (
            <>
              <Box component="span" sx={visuallyHidden}>Step {step} of {STEPS.length}: {STEPS[step - 1]}</Box>
              <Stack component="ol" direction="row" spacing={1} aria-hidden="true" sx={{ alignItems: 'center', listStyle: 'none', m: 0, mt: 1, p: 0 }}>
                {STEPS.map((label, i) => {
                  const done = i + 1 < step, now = i + 1 === step;
                  return (
                    <Stack component="li" key={label} direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                      {i > 0 && <Box sx={{ width: 24, height: '1px', bgcolor: done || now ? 'primary.main' : 'divider', mr: 0.25 }} />}
                      <Box sx={{ width: 20, height: 20, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: done || now ? 'primary.contrastText' : 'text.secondary', bgcolor: done || now ? 'primary.main' : 'tokens.surface3' }}>
                        {done ? <Check sx={{ fontSize: 13 }} /> : i + 1}
                      </Box>
                      <Typography variant="caption" sx={{ fontWeight: now ? 600 : 400, color: now ? 'text.primary' : 'text.secondary' }}>{label}</Typography>
                    </Stack>
                  );
                })}
              </Stack>
            </>
          )}
        </Box>
        <IconButton onClick={close} aria-label="Close dialog" size="small" sx={{ mt: 0.25 }}><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important' }}>{children}</DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider', gap: 1 }}>
        {back && <Button onClick={back} sx={{ mr: 'auto' }}>Back</Button>}
        <Button onClick={close}>{submit ? 'Cancel' : 'Close'}</Button>
        {submit && <Button variant="contained" type="submit" form={`${id}-form`}>{submit}</Button>}
      </DialogActions>
    </>
  );
}

const read = (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  return new FormData(e.currentTarget);
};
const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

function CrawlDialog({ profileId, close }: { profileId: string; close: () => void }) {
  const { social } = useAppState();
  const dispatch = useAppDispatch();
  const [collectError, setCollectError] = useState(false);
  const p = findProfile(profileId);
  if (!p) return null;
  const running = social.archive.find((j) => j.profileId === p.id && j.status === 'In Progress');
  const opts = CRAWL_COLLECT[p.category];
  const submit = (e: FormEvent<HTMLFormElement>) => {
    const f = read(e);
    const collect = f.getAll('collect').map(String);
    if (!collect.length) return setCollectError(true);
    dispatch({ type: 'startCrawl', profile: p, limit: Number(f.get('limit')), collect, now: Date.now() });
  };
  return (
    <Frame title="Set up crawl" close={close} submit="Start crawl">
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', p: 1.5, borderRadius: 1, bgcolor: 'tokens.surface2', mb: 2 }}>
        <SocialAvatar profile={p} size={48} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h4">{p.name}</Typography>
          <Mono sx={{ color: 'text.secondary' }}>@{p.username}</Mono>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 0.5 }}>
            <PlatformLogo platform={p.platform} size={16} />
            <Typography variant="caption" color="text.secondary">{platformName(p.platform)} · {p.meta ?? p.category}</Typography>
          </Stack>
        </Box>
      </Stack>
      {running && (
        <Alert severity="warning" variant="outlined" sx={{ mb: 2 }}>
          {running.id} is {jobProgress(running, Date.now())}% done. Starting another crawl runs a second job.
        </Alert>
      )}
      <Box component="form" id={FORM_ID} onSubmit={submit}>
        <TextField
          name="limit"
          label="Number of items to crawl"
          type="number"
          required
          fullWidth
          autoFocus
          defaultValue={social.limit}
          helperText="Between 1 and 5,000. The crawl stops when it reaches this number."
          onFocus={(e) => e.target.select()}
          slotProps={{ htmlInput: { min: 1, max: 5000, step: 1 } }}
          sx={{ '& input': { fontFamily: (t) => t.palette.tokens.mono } }}
        />
        <FormControl component="fieldset" error={collectError} sx={{ mt: 2.5 }}>
          <FormLabel component="legend" sx={{ fontSize: 13, fontWeight: 600, mb: 0.5 }}>Collect</FormLabel>
          <FormGroup row>
            {opts.map((o, i) => (
              <FormControlLabel key={o} control={<Checkbox name="collect" value={o} defaultChecked={i === 0} onChange={() => setCollectError(false)} />} label={o} />
            ))}
          </FormGroup>
          {collectError && <FormHelperText>Choose at least one type of content to collect.</FormHelperText>}
        </FormControl>
      </Box>
    </Frame>
  );
}

interface Brief { title: string; description: string; severity: Case['severity']; folderId: string; image: string }

/** Two steps: the case brief, then the collection plan (what to monitor and where). */
function CaseDialog({ prefill, folderId = '', close }: { prefill: string; folderId?: string; close: () => void }) {
  const { folders } = useAppState();
  const [brief, setBrief] = useState<Brief>({ title: prefill, description: '', severity: 'Medium', folderId, image: '' });
  // Kept here, not in PlanStep, so Back and Next keep what was entered.
  const [plan, setPlan] = useState<CollectionPlan>({ event: '', hashtags: [], keywords: [], platforms: [], newsKeywords: [], channels: [] });
  const [step, setStep] = useState<1 | 2>(1);
  if (step === 2) return <PlanStep brief={brief} plan={plan} setPlan={setPlan} back={() => setStep(1)} close={close} />;
  const submit = (e: FormEvent<HTMLFormElement>) => {
    const f = read(e);
    setBrief((b) => ({ ...b, title: str(f, 'title'), description: str(f, 'description'), severity: str(f, 'severity') as Case['severity'], folderId: str(f, 'folderId') }));
    setStep(2);
  };
  return (
    <Frame title="Open investigation" step={1} close={close} submit="Next">
      <Stack component="form" id={FORM_ID} onSubmit={submit} spacing={2}>
        <ImagePicker value={brief.image} onChange={(image) => setBrief((b) => ({ ...b, image }))} label="Cover image" />
        <TextField name="title" label="Case title" required defaultValue={brief.title} placeholder="e.g. Karachi port strike monitoring" slotProps={{ htmlInput: { minLength: 3 } }} autoFocus />
        <TextField name="description" label="Investigation objective" required multiline minRows={3} defaultValue={brief.description} placeholder="What do you need to find out, and why?" />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 8 }}>
            <TextField select name="folderId" label="Archive folder" required fullWidth defaultValue={brief.folderId} helperText="Where this case is filed in Case files">
              {folders.map((x) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField select name="severity" label="Priority" defaultValue={brief.severity} fullWidth>
              {['Low', 'Medium', 'High'].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Stack>
    </Frame>
  );
}

const MAX_TERMS = 5;

function PlanStep({ brief, plan, setPlan, back, close }: { brief: Brief; plan: CollectionPlan; setPlan: Dispatch<SetStateAction<CollectionPlan>>; back: () => void; close: () => void }) {
  const { folders, channels } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [tried, setTried] = useState(false);
  const [adding, setAdding] = useState(false);
  const set = <K extends keyof CollectionPlan>(k: K, v: CollectionPlan[K]) => setPlan((p) => ({ ...p, [k]: v }));
  const toggle = <T,>(list: T[], x: T) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    read(e);
    setTried(true);
    if (!plan.platforms.length || !plan.channels.length) return;
    const folder = folders.find((x) => x.id === brief.folderId);
    dispatch({ type: 'addCase', data: { title: brief.title, description: brief.description, severity: brief.severity, owner: 'Analyst Team', folderId: brief.folderId, image: brief.image || undefined, plan: { ...plan, event: plan.event.trim() } } });
    dispatch({ type: 'toast', text: `Investigation launched and filed in “${folder?.name}”.` });
    navigate(`/hub/archive/${brief.folderId}`);
  };
  return (
    <Frame title="Open investigation" step={2} close={close} back={back} submit="Launch investigation">
      <Stack component="form" id={FORM_ID} onSubmit={submit} spacing={3}>
        <TextField name="event" label="Event of interest" required autoFocus value={plan.event} onChange={(e) => set('event', e.target.value)} placeholder="e.g. Dockworkers' strike, Port Qasim" helperText="The incident, event or subject this case tracks" />

        <Section icon={<Tag fontSize="small" />} title="Social media" note="Posts that use these hashtags or terms, on the platforms you pick.">
          <TermsInput label="Hashtags" value={plan.hashtags} onChange={(v) => set('hashtags', v)} hash />
          <TermsInput label="Keywords & phrases" value={plan.keywords} onChange={(v) => set('keywords', v)} />
          <TileGroup label="Platforms to monitor" error={tried && !plan.platforms.length ? 'Choose at least one platform.' : ''}
            onAll={(all) => set('platforms', all ? socialPlatforms.map((p) => p.id) : [])} selected={plan.platforms.length}>
            {socialPlatforms.map((p) => (
              <Tile key={p.id} on={plan.platforms.includes(p.id)} onClick={() => set('platforms', toggle<Platform>(plan.platforms, p.id))} icon={<PlatformLogo platform={p.id} />} label={p.name} />
            ))}
          </TileGroup>
        </Section>

        <Section icon={<NewspaperOutlined fontSize="small" />} title="News channels" note="Articles that mention these terms, from the channels you pick.">
          <TermsInput label="News keywords" value={plan.newsKeywords} onChange={(v) => set('newsKeywords', v)} />
          <TileGroup label="Channels to monitor" error={tried && !plan.channels.length ? 'Choose at least one news channel.' : ''}
            onAll={(all) => set('channels', all ? channels.map((c) => c.id) : [])} selected={plan.channels.length}>
            {channels.map((c) => (
              <Tile key={c.id} on={plan.channels.includes(c.id)} onClick={() => set('channels', toggle(plan.channels, c.id))} icon={<ChannelLogo channel={c} />} label={c.name} />
            ))}
            <ButtonBase onClick={() => setAdding(true)} sx={{ height: 44, gap: 1, borderRadius: 1, border: '1px dashed', borderColor: 'divider', color: 'text.secondary', fontSize: 14, fontWeight: 600, '&:hover': { borderColor: 'primary.main', color: 'text.primary' } }}>
              <Add fontSize="small" /> Add channel
            </ButtonBase>
          </TileGroup>
        </Section>
      </Stack>
      {/* Rendered outside the form above: React submit events bubble through portals. */}
      <Dialog open={adding} onClose={() => setAdding(false)} fullWidth maxWidth="xs" aria-labelledby="channel-title">
        <ChannelDialog close={() => setAdding(false)} onAdd={(id) => set('channels', [...plan.channels, id])} />
      </Dialog>
    </Frame>
  );
}

function Section({ icon, title, note, children }: { icon: ReactNode; title: string; note: string; children: ReactNode }) {
  return (
    <Box component="section" sx={{ borderRadius: 1, border: 1, borderColor: 'divider', overflow: 'hidden' }}>
      <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', px: 2, py: 1.25, bgcolor: 'tokens.surface2', borderBottom: 1, borderColor: 'divider' }}>
        <Box sx={{ color: 'tokens.link', display: 'flex' }}>{icon}</Box>
        <Box>
          <Typography variant="h4" component="h3">{title}</Typography>
          <Typography variant="caption" color="text.secondary">{note}</Typography>
        </Box>
      </Stack>
      <Stack spacing={2.5} sx={{ p: 2 }}>{children}</Stack>
    </Box>
  );
}

/** Free-text chips: type a term and press Enter (or leave the field). */
function TermsInput({ label, value, onChange, hash }: { label: string; value: string[]; onChange: (v: string[]) => void; hash?: boolean }) {
  const clean = (x: string) => (hash ? '#' + x.trim().replace(/^#+/, '').replace(/\s+/g, '') : x.trim());
  return (
    <Autocomplete
      multiple freeSolo autoSelect options={[]} value={value}
      onChange={(_, v) => onChange([...new Set(v.map(clean).filter((x) => x && x !== '#'))].slice(0, MAX_TERMS))}
      renderInput={(p) => <TextField {...p} label={label} helperText={`Optional. Press Enter after each one. ${value.length} of ${MAX_TERMS} added.`} />}
    />
  );
}

function TileGroup({ label, error, onAll, selected, children }: { label: string; error: string; onAll: (all: boolean) => void; selected: number; children: ReactNode }) {
  const id = label.replace(/\W+/g, '-').toLowerCase();
  return (
    <FormControl component="fieldset" error={!!error}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'baseline', mb: 1 }}>
        <FormLabel id={id} sx={{ fontSize: 13, fontWeight: 600 }}>{label}</FormLabel>
        <Typography variant="caption" color={error ? 'error' : 'text.secondary'} sx={{ mr: 'auto !important' }}>{selected} selected</Typography>
        <Link component="button" type="button" variant="body2" onClick={() => onAll(true)}>Select all</Link>
        <Link component="button" type="button" variant="body2" onClick={() => onAll(false)}>Clear</Link>
      </Stack>
      <Box role="group" aria-labelledby={id} sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>{children}</Box>
      {error && <FormHelperText sx={{ mx: 0 }}>{error}</FormHelperText>}
    </FormControl>
  );
}

function Tile({ on, onClick, icon, label }: { on: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <ButtonBase
      aria-pressed={on}
      onClick={onClick}
      title={label}
      sx={{
        width: '100%', height: 44, px: 1.5, gap: 1.25, justifyContent: 'flex-start', borderRadius: 1, border: 1, fontSize: 14, fontWeight: 500,
        borderColor: on ? 'primary.main' : 'divider', bgcolor: (t) => (on ? alpha(t.palette.primary.main, 0.1) : 'transparent'),
        color: on ? 'text.primary' : 'text.secondary', '&:hover': { borderColor: on ? 'primary.main' : 'text.secondary' },
      }}
    >
      {icon}
      <Box component="span" sx={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</Box>
      {on && <CheckCircleOutline fontSize="small" sx={{ color: 'tokens.link' }} />}
    </ButtonBase>
  );
}

function ChannelLogo({ channel, size = 22 }: { channel: NewsChannel; size?: number }) {
  return <Avatar variant="rounded" src={channel.logo || undefined} alt="" sx={{ width: size, height: size, fontSize: size * 0.45, fontWeight: 700 }}>{channel.name.slice(0, 2).toUpperCase()}</Avatar>;
}

function ChannelDialog({ close, onAdd }: { close: () => void; onAdd: (id: string) => void }) {
  const dispatch = useAppDispatch();
  const [logo, setLogo] = useState('');
  const [urlError, setUrlError] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => {
    const f = read(e);
    const url = str(f, 'url');
    // Only web links: a typed "javascript:" URL would pass the browser's own url check.
    if (!URL.canParse(url) || !/^https?:$/.test(new URL(url).protocol)) return setUrlError('Use a web address starting with http:// or https://');
    const id = 'ch-' + Date.now();
    dispatch({ type: 'addChannel', channel: { id, name: str(f, 'name'), url, logo } });
    onAdd(id);
    close();
  };
  return (
    <Frame id="channel" title="Add news channel" close={close} submit="Add channel">
      <Stack component="form" id="channel-form" onSubmit={submit} spacing={2}>
        <ImagePicker value={logo} onChange={setLogo} label="Channel logo" />
        <TextField name="name" label="Channel name" required autoFocus slotProps={{ htmlInput: { minLength: 2 } }} />
        <TextField name="url" label="Website URL" type="url" required placeholder="https://" error={!!urlError} helperText={urlError} onChange={() => setUrlError('')} />
      </Stack>
    </Frame>
  );
}

function CaseView({ index, close }: { index: number; close: () => void }) {
  const { cases, folders, channels } = useAppState();
  const c = cases[index];
  if (!c) return null;
  const p = c.plan;
  const folder = folders.find((f) => f.id === c.folderId);
  return (
    <Frame title="Case information" close={close}>
      {c.image && <Box component="img" src={c.image} alt="" sx={{ display: 'block', width: '100%', aspectRatio: '16 / 5', objectFit: 'cover', borderRadius: 1, border: 1, borderColor: 'divider', mb: 2 }} />}
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
        <Mono sx={{ color: 'text.secondary', fontSize: 12 }}>{c.id}</Mono>
        <StatusTag label={c.status} tone={caseTone(c.status)} />
        <PriorityTag level={c.severity} />
      </Stack>
      <Typography variant="h2" sx={{ mt: 1.25 }}>{c.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>{c.description}</Typography>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mt: 2 }}>
        <LinearProgress variant="determinate" value={c.progress} color={c.progress === 100 ? 'success' : 'primary'} sx={{ flex: 1 }} aria-label={`Review progress ${c.progress}%`} />
        <Mono sx={{ fontSize: 12, fontWeight: 600 }}>{c.progress}%</Mono>
      </Stack>
      <Grid container spacing={1.5} sx={{ mt: 2 }}>
        {[['Owner', c.owner], ['Archive folder', folder?.name ?? 'Not filed'], ['Last update', c.time]].map(([k, v]) => (
          <Grid key={k} size={{ xs: 12, sm: 4 }}>
            <Box sx={{ p: 1.5, height: '100%', borderRadius: 1, bgcolor: 'tokens.surface2' }}>
              <Typography variant="caption" color="text.secondary" component="div">{k}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{v}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      {p && (
        <Box sx={{ mt: 2.5, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="h4" component="h3">Collection plan</Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}><Box component="span" sx={{ color: 'text.secondary' }}>Event of interest: </Box>{p.event}</Typography>
          <Stack spacing={1.25} sx={{ mt: 1.5 }}>
            <PlanRow label="Hashtags" items={p.hashtags} />
            <PlanRow label="Keywords" items={p.keywords} />
            <PlanRow label="Platforms" items={p.platforms.map((id) => <><PlatformLogo platform={id} size={14} />{platformName(id)}</>)} />
            <PlanRow label="News keywords" items={p.newsKeywords} />
            <PlanRow label="News channels" items={p.channels.map((id) => channels.find((x) => x.id === id)).filter(Boolean).map((ch) => <><ChannelLogo channel={ch!} size={16} />{ch!.name}</>)} />
          </Stack>
        </Box>
      )}
    </Frame>
  );
}

function PlanRow({ label, items }: { label: string; items: ReactNode[] }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 1.5 }}>
      <Typography variant="caption" color="text.secondary" sx={{ width: { sm: 110 }, flexShrink: 0, lineHeight: '24px' }}>{label}</Typography>
      <Stack direction="row" useFlexGap spacing={0.75} sx={{ flexWrap: 'wrap', alignItems: 'center', minHeight: 24 }}>
        {items.length ? items.map((x, i) => (
          <Box key={i} component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, height: 24, px: 1, borderRadius: 1, fontSize: 12, bgcolor: 'tokens.surface2', border: 1, borderColor: 'divider' }}>{x}</Box>
        )) : <Typography variant="body2" color="text.secondary">None</Typography>}
      </Stack>
    </Stack>
  );
}

function FolderDialog({ close }: { close: () => void }) {
  const dispatch = useAppDispatch();
  const [image, setImage] = useState('');
  const [error, setError] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => {
    const f = read(e);
    if (!image) return setError('Upload an image for this folder.');
    dispatch({ type: 'addFolder', name: str(f, 'name'), image });
    dispatch({ type: 'toast', text: 'Folder created in Case files.' });
  };
  return (
    <Frame title="Create folder" close={close} submit="Create folder">
      <Stack component="form" id={FORM_ID} onSubmit={submit} spacing={2}>
        <ImagePicker value={image} onChange={(src) => { setImage(src); setError(''); }} error={error} label="Folder image" />
        <TextField name="name" label="Folder name" required autoFocus placeholder="e.g. Pakistan maritime cases" slotProps={{ htmlInput: { minLength: 2 } }} />
      </Stack>
    </Frame>
  );
}

/** Image from this device, or from Drive. */
function ImagePicker({ value, onChange, error, label = 'Image' }: { value: string; onChange: (src: string) => void; error?: string; label?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [drive, setDrive] = useState(false);
  const [typeError, setTypeError] = useState('');
  const shown = typeError || error;
  const pickFile = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return setTypeError('Choose an image file (PNG, JPG, WebP…).');
    setTypeError('');
    onChange(URL.createObjectURL(file));
  };
  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Box sx={{ width: 112, height: 63, flexShrink: 0, borderRadius: 1, border: 1, borderStyle: value ? 'solid' : 'dashed', borderColor: shown ? 'error.main' : 'divider', bgcolor: 'tokens.surface2', display: 'grid', placeItems: 'center', overflow: 'hidden', color: 'text.secondary' }}>
          {value ? <Box component="img" src={value} alt={`Selected ${label.toLowerCase()}`} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageOutlined />}
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
          <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 0.75 }}>From this device or Drive</Typography>
          <Button size="small" startIcon={<ImageOutlined />} onClick={(e) => setMenu(e.currentTarget)} aria-haspopup="menu">{value ? 'Change image' : 'Upload image'}</Button>
        </Box>
      </Stack>
      {shown && <FormHelperText error sx={{ mx: 0 }}>{shown}</FormHelperText>}
      <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}>
        <MenuItem onClick={() => { setMenu(null); setDrive(false); fileRef.current?.click(); }}><ListItemIcon><ComputerOutlined fontSize="small" /></ListItemIcon>From this device</MenuItem>
        <MenuItem onClick={() => { setMenu(null); setDrive(true); }}><ListItemIcon><AddToDriveOutlined fontSize="small" /></ListItemIcon>From Drive</MenuItem>
      </Menu>
      <input ref={fileRef} type="file" accept="image/*" hidden aria-label="Image file" onChange={(e) => pickFile(e.target.files?.[0])} />
      {drive && (
        <Box sx={{ p: 1.5, mt: 1.5, borderRadius: 1, bgcolor: 'tokens.surface2' }}>
          {/* shortcut: Drive is a demo picker of sample images; a real one needs the Google Picker API and an OAuth client. */}
          <Typography variant="caption" color="text.secondary" component="div">Drive (demo images)</Typography>
          <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(3, 1fr)', mt: 1 }}>
            {demoDriveImages.map((src, i) => (
              <Box key={src} component="button" type="button" aria-label={`Drive image ${i + 1}`} onClick={() => { onChange(src); setTypeError(''); setDrive(false); }}
                sx={{ p: 0, aspectRatio: '16 / 9', borderRadius: 1, border: 2, borderColor: value === src ? 'primary.main' : 'transparent', overflow: 'hidden', cursor: 'pointer', bgcolor: 'background.paper', '&:hover, &:focus-visible': { borderColor: 'primary.main' } }}>
                <Box component="img" src={src} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

function InviteDialog({ close }: { close: () => void }) {
  const dispatch = useAppDispatch();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    const f = read(e);
    dispatch({ type: 'addUser', data: { name: str(f, 'name'), email: str(f, 'email'), role: str(f, 'role') as WorkspaceUser['role'] } });
    dispatch({ type: 'toast', text: 'Demo invitation added. No email was sent.' });
  };
  return (
    <Frame title="Invite workspace user" close={close} submit="Send invitation">
      <Stack component="form" id={FORM_ID} onSubmit={submit} spacing={2}>
        <TextField name="name" label="Full name" required autoFocus slotProps={{ htmlInput: { minLength: 2 } }} />
        <TextField name="email" label="Work email" type="email" required placeholder="name@organization.com" />
        <TextField select name="role" label="Role" defaultValue="Analyst">
          {['Analyst', 'Viewer', 'Admin'].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
        </TextField>
      </Stack>
    </Frame>
  );
}

function ForgotDialog({ close }: { close: () => void }) {
  const dispatch = useAppDispatch();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    read(e);
    close();
    dispatch({ type: 'toast', text: 'Password reset flow demonstrated. No email was sent.' });
  };
  return (
    <Frame title="Reset password" close={close} submit="Continue">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Password recovery is shown for design completeness. No reset email will be sent from this prototype.</Typography>
      <Box component="form" id={FORM_ID} onSubmit={submit}>
        <TextField name="email" label="Work email" type="email" required fullWidth autoFocus placeholder="name@organization.com" />
      </Box>
    </Frame>
  );
}

function RangeDialog({ close }: { close: () => void }) {
  const { from, to } = useAppState();
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');
  const submit = (e: FormEvent<HTMLFormElement>) => {
    const f = read(e);
    const a = str(f, 'from'), b = str(f, 'to');
    if (a > b) return setError('Start date must be on or before the end date.');
    dispatch({ type: 'setRange', from: a, to: b });
    dispatch({ type: 'toast', text: 'Custom range applied to the prototype view.' });
  };
  return (
    <Frame title="Select custom date range" close={close} submit="Apply range">
      <Box component="form" id={FORM_ID} onSubmit={submit}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}><TextField name="from" label="From" type="date" required fullWidth defaultValue={from} onChange={() => setError('')} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField name="to" label="To" type="date" required fullWidth defaultValue={to} onChange={() => setError('')} slotProps={{ inputLabel: { shrink: true } }} /></Grid>
        </Grid>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Prototype values remain illustrative. Production charts should query this selected range from backend APIs.</Typography>
      </Box>
    </Frame>
  );
}
