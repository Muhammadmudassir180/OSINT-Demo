import { useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, FormHelperText,
  FormLabel, Grid, IconButton, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { PlatformLogo, SocialAvatar } from '../components/brand';
import { Mono, StatusTag } from '../components/ui';
import { CRAWL_COLLECT, findProfile, jobProgress, platformName } from '../lib/osint';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { Modal } from '../state/reducer';
import type { Case, WorkspaceUser } from '../types';

const FORM_ID = 'dialog-form';

export default function Dialogs() {
  const { modal } = useAppState();
  const dispatch = useAppDispatch();
  const close = () => dispatch({ type: 'closeModal' });
  // Keep the last dialog's content while it animates out.
  const last = useRef<Exclude<Modal, null>>(null);
  if (modal) last.current = modal;
  const m = modal ?? last.current;
  return (
    <Dialog open={!!modal} onClose={close} fullWidth maxWidth="sm" aria-labelledby="dialog-title">
      {m?.type === 'crawl' && <CrawlDialog profileId={m.profileId} close={close} />}
      {m?.type === 'case' && <CaseDialog prefill={m.prefill} close={close} />}
      {m?.type === 'caseview' && <CaseView index={m.index} close={close} />}
      {m?.type === 'invite' && <InviteDialog close={close} />}
      {m?.type === 'forgot' && <ForgotDialog close={close} />}
      {m?.type === 'custom' && <RangeDialog close={close} />}
    </Dialog>
  );
}

function Frame({ title, close, children, submit }: { title: string; close: () => void; children: ReactNode; submit?: string }) {
  return (
    <>
      <DialogTitle id="dialog-title" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, py: 1.75, fontSize: 16, fontWeight: 600, borderBottom: 1, borderColor: 'divider' }}>
        {title}
        <IconButton onClick={close} aria-label="Close dialog" size="small"><Close fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: '20px !important' }}>{children}</DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider', gap: 1 }}>
        <Button onClick={close}>{submit ? 'Cancel' : 'Close'}</Button>
        {submit && <Button variant="contained" type="submit" form={FORM_ID}>{submit}</Button>}
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

function CaseDialog({ prefill, close }: { prefill: string; close: () => void }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const submit = (e: FormEvent<HTMLFormElement>) => {
    const f = read(e);
    dispatch({ type: 'addCase', data: { title: str(f, 'title'), description: str(f, 'description'), severity: str(f, 'severity') as Case['severity'], owner: str(f, 'owner') } });
    dispatch({ type: 'toast', text: 'Demo case created in the Intelligence Hub.' });
    navigate('/hub');
  };
  return (
    <Frame title="Create investigation case" close={close} submit="Create case">
      <Stack component="form" id={FORM_ID} onSubmit={submit} spacing={2}>
        <TextField name="title" label="Case title" required defaultValue={prefill} placeholder="e.g. Entity network assessment" slotProps={{ htmlInput: { minLength: 3 } }} autoFocus />
        <TextField name="description" label="Investigation objective" required multiline minRows={3} placeholder="Describe the scope and analyst objective…" />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select name="severity" label="Priority" defaultValue="Medium" fullWidth>
              {['Low', 'Medium', 'High'].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField select name="owner" label="Assigned team" defaultValue="Analyst Team" fullWidth>
              {['Analyst Team', 'Investigations', 'Operations Group'].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Stack>
    </Frame>
  );
}

function CaseView({ index, close }: { index: number; close: () => void }) {
  const c = useAppState().cases[index];
  if (!c) return null;
  return (
    <Frame title="Case information" close={close}>
      <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 2 }}>
        <StatusTag label={c.id} tone="blue" />
        <StatusTag label={c.status} tone={c.status === 'Completed' ? 'green' : c.status === 'In review' ? 'amber' : 'blue'} />
      </Stack>
      <Typography variant="h2">{c.title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{c.description}</Typography>
      <Grid container spacing={1.5} sx={{ mt: 2 }}>
        {[['Owner', c.owner], ['Priority', c.severity], ['Progress', `${c.progress}%`], ['Last update', c.time]].map(([k, v]) => (
          <Grid key={k} size={6}>
            <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'tokens.surface2' }}>
              <Typography variant="overline" color="text.secondary" component="div">{k}</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{v}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Frame>
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
