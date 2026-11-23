import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, Checkbox, FormControlLabel, IconButton, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Mono, StatusTag } from '../components/ui';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { Tone } from '../types';

const TRACE: [string, string, string, Tone][] = [
  ['SRC-101', 'Corporate registry', 'Verified', 'green'],
  ['SRC-102', 'Professional directory', 'In review', 'amber'],
  ['SRC-103', 'Website cache', 'Source unavailable', 'red'],
];

export default function Login() {
  const { mfaSetting } = useAppState();
  const dispatch = useAppDispatch();
  const [stage, setStage] = useState<'login' | 'mfa'>('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const proceed = (mfa: boolean) => {
    setLoading(true);
    setError('');
    setTimeout(() => {
      setLoading(false);
      if (mfa) setStage('mfa');
      else dispatch({ type: 'login' });
    }, 550);
  };

  const onLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get('email') ?? '').toLowerCase();
    const password = String(f.get('password') ?? '');
    if (!email.includes('@') || password.length < 6) return setError('Enter a valid email and a password of at least 6 characters.');
    if (email === 'network@demo.local') return setError('Simulated network error. Check your connection and try again.');
    if (email === 'invalid@demo.local') return setError('Simulated invalid credentials. Use another demo email.');
    proceed(f.has('useMfa') || mfaSetting);
  };

  const onMfa = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (new FormData(e.currentTarget).get('code') !== '123456') return setError('Incorrect demo verification code. Try 123456.');
    dispatch({ type: 'login' });
  };

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' }, bgcolor: 'background.default' }}>
      <Stack sx={{ display: { xs: 'none', md: 'flex' }, bgcolor: '#111418', color: '#F6F7F9', p: 6, justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Box component="img" src="/logo.png" alt="" sx={{ width: 32, height: 32, borderRadius: 1 }} />
          <Typography sx={{ fontFamily: (t) => t.palette.tokens.condensed, fontWeight: 600 }}>Intelligence &amp; OSINT Platform</Typography>
        </Stack>
        <Box sx={{ maxWidth: 520 }}>
          <Typography variant="h1" sx={{ fontSize: 40, lineHeight: 1.1 }}>
            Every finding, traced back to <Box component="span" sx={{ color: '#8ABBFF' }}>its source.</Box>
          </Typography>
          <Typography sx={{ color: '#ABB3BF', mt: 2, fontSize: 16 }}>
            Search people and organizations across public sources, keep the evidence trail intact, and mark what has been verified before it becomes a finding.
          </Typography>
          <Box component="figure" sx={{ m: 0, mt: 4, p: 2.5, borderRadius: 1, border: '1px solid rgba(171,179,191,.18)', bgcolor: '#1C2127' }}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap', rowGap: 1 }}>
              <Mono sx={{ color: '#8ABBFF' }}>FND-0193</Mono>
              <Typography variant="caption" sx={{ color: '#ABB3BF' }}>Finding · Medium confidence</Typography>
              <StatusTag label="In review" tone="amber" />
            </Stack>
            <Typography sx={{ mt: 1.5, fontWeight: 500 }}>Mira Solen is listed as a corporate representative of Helio Freight Group.</Typography>
            <Stack component="ol" aria-label="Sources behind this finding" sx={{ listStyle: 'none', p: 0, m: 0, mt: 2 }} spacing={1}>
              {TRACE.map(([ref, name, label, tone]) => (
                <Stack component="li" key={ref} direction="row" spacing={1.5} sx={{ alignItems: 'center', py: 1, borderTop: '1px solid rgba(171,179,191,.12)' }}>
                  <Mono sx={{ color: '#97A1AF', width: 64 }}>{ref}</Mono>
                  <Typography variant="body2" sx={{ flex: 1, fontWeight: 600 }}>{name}</Typography>
                  <StatusTag label={label} tone={tone} />
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>
        <Typography variant="caption" sx={{ color: '#97A1AF' }}>Records shown are fictional sample data.</Typography>
      </Stack>

      <Stack sx={{ alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 4 } }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          {stage === 'mfa' ? (
            <>
              <Typography variant="h1">Verify your sign-in</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Enter the demo verification code to continue. This is an illustrative MFA screen, not real authentication.</Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Stack component="form" onSubmit={onMfa} spacing={2}>
                <TextField name="code" label="Verification code" required autoFocus autoComplete="one-time-code" placeholder="6-digit code" slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 6 } }} />
                <Button type="submit" variant="contained" size="large">Verify &amp; enter workspace</Button>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 3, p: 2, borderRadius: 1, bgcolor: 'tokens.surface2' }}>
                <Typography variant="body2">Demo code: <b>123456</b></Typography>
                <Button size="small" variant="text" onClick={() => { setStage('login'); setError(''); }}>Back</Button>
              </Stack>
            </>
          ) : (
            <>
              <Typography variant="h1">Welcome back</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>Sign in to your secure intelligence workspace.</Typography>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              <Stack component="form" onSubmit={onLogin} spacing={2}>
                <TextField name="email" label="Work email" type="email" required autoComplete="username" placeholder="name@organization.com" />
                <TextField
                  name="password"
                  label="Password"
                  type={show ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  slotProps={{
                    htmlInput: { minLength: 6 },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShow((v) => !v)} aria-label={show ? 'Hide password' : 'Show password'} edge="end" size="small">
                            {show ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel control={<Checkbox name="remember" defaultChecked size="small" />} label="Remember me" />
                  <Link component="button" type="button" variant="body2" onClick={() => dispatch({ type: 'openModal', modal: { type: 'forgot' } })}>Forgot password?</Link>
                </Stack>
                <FormControlLabel control={<Checkbox name="useMfa" size="small" />} label="Ask for a verification code (demo)" />
                <Button type="submit" variant="contained" size="large" disabled={loading}>{loading ? 'Authenticating…' : 'Sign in to workspace'}</Button>
              </Stack>
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 3, p: 2, borderRadius: 1, bgcolor: 'tokens.surface2' }}>
                <Typography variant="body2"><b>Prototype access</b><br />No real credentials needed</Typography>
                <Button size="small" onClick={() => proceed(mfaSetting)}>Enter demo</Button>
              </Stack>
            </>
          )}
          <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 4 }}>
            <Typography variant="caption" color="tokens.soft">© 2026 · Intelligence &amp; OSINT Platform</Typography>
            <Typography variant="caption" color="tokens.soft">Prototype v1.0</Typography>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
