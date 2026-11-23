import type { ReactNode } from 'react';
import { Box, Button, Card, CardHeader, Grid, MenuItem, Select, Stack, Switch, Typography } from '@mui/material';
import { Refresh, SettingsOutlined, VerifiedUserOutlined } from '@mui/icons-material';
import { PageHeader, Reveal, StatusTag } from '../components/ui';
import { useAppDispatch, useAppState } from '../state/AppContext';
import { useThemeMode } from '../theme';
import type { Role } from '../types';

export default function Settings() {
  const s = useAppState();
  const dispatch = useAppDispatch();
  const { mode, setMode } = useThemeMode();
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Settings"
        description="Manage workspace appearance and demonstration preferences."
        actions={
          <Button
            startIcon={<Refresh />}
            onClick={() => {
              setMode('dark');
              dispatch({ type: 'resetSettings' });
              dispatch({ type: 'toast', text: 'Display settings restored to prototype defaults.' });
            }}
          >
            Restore defaults
          </Button>
        }
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Reveal sx={{ height: '100%' }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Appearance" subheader="Customize your analyst workspace" action={<SettingsOutlined sx={{ color: 'text.secondary' }} />} />
              <Row title="Dark appearance" text="The default analyst console. Turn off for a light workspace.">
                <Switch checked={mode === 'dark'} onChange={(e) => setMode(e.target.checked ? 'dark' : 'light')} slotProps={{ input: { 'aria-label': 'Dark appearance' } }} />
              </Row>
              <Row title="Compact sidebar" text="Show icon-only navigation on desktop">
                <Switch checked={s.compactSidebar} onChange={(e) => dispatch({ type: 'setSetting', key: 'compactSidebar', value: e.target.checked })} slotProps={{ input: { 'aria-label': 'Compact sidebar' } }} />
              </Row>
              <Row title="Notifications" text="Display recent event notices in the header">
                <Switch checked={s.notify} onChange={(e) => dispatch({ type: 'setSetting', key: 'notify', value: e.target.checked })} slotProps={{ input: { 'aria-label': 'Notifications' } }} />
              </Row>
            </Card>
          </Reveal>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Reveal order={1} sx={{ height: '100%' }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Security and workspace" subheader="Demonstration-only controls" action={<VerifiedUserOutlined sx={{ color: 'text.secondary' }} />} />
              <Row title="Require MFA at next login" text="Enforce demonstration code verification">
                <Switch checked={s.mfaSetting} onChange={(e) => dispatch({ type: 'setSetting', key: 'mfaSetting', value: e.target.checked })} slotProps={{ input: { 'aria-label': 'Require MFA at next login' } }} />
              </Row>
              <Row title="Current user role" text="Preview role-aware navigation">
                <Select value={s.role} onChange={(e) => dispatch({ type: 'setRole', role: e.target.value as Role })} sx={{ minWidth: 130 }} inputProps={{ 'aria-label': 'Current user role' }}>
                  <MenuItem value="Admin">Admin</MenuItem>
                  <MenuItem value="Analyst">Analyst</MenuItem>
                </Select>
              </Row>
              <Row title="Platform version" text="Offline interactive UI prototype"><StatusTag label="v1.0.0" tone="blue" /></Row>
              <Row title="Data connection" text="Not connected to production APIs"><StatusTag label="Demo mode" tone="amber" /></Row>
            </Card>
          </Reveal>
        </Grid>
      </Grid>
    </Stack>
  );
}

function Row({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <Stack direction="row" spacing={2} sx={{ px: 2.5, py: 2, borderTop: 1, borderColor: 'divider', alignItems: 'center', justifyContent: 'space-between', minHeight: 72 }}>
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{title}</Typography>
        <Typography variant="caption" color="text.secondary">{text}</Typography>
      </Box>
      {children}
    </Stack>
  );
}
