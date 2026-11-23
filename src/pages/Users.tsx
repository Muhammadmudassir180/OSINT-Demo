import { Box, Button, Card, CardHeader, Grid, MenuItem, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from '@mui/material';
import { Add, Lock } from '@mui/icons-material';
import { EmptyState, PageHeader, Reveal, StatCard, StatusTag } from '../components/ui';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { WorkspaceUser } from '../types';

export default function Users() {
  const { users, role } = useAppState();
  const dispatch = useAppDispatch();
  if (role !== 'Admin')
    return (
      <Card>
        <EmptyState icon={<Lock />} title="Administrator access required" minHeight={360}>
          User management is restricted to administrators. Switch to Admin in the account menu to preview this page.
        </EmptyState>
      </Card>
    );
  return (
    <Stack spacing={3}>
      <PageHeader
        title="User Management"
        description="Control access, permissions, and invitations across the workspace."
        actions={<Button variant="contained" startIcon={<Add />} onClick={() => dispatch({ type: 'openModal', modal: { type: 'invite' } })}>Invite user</Button>}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}><StatCard label="Total accounts" value={users.length} note="All demo identities" /></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><StatCard label="Active accounts" value={users.filter((u) => u.status === 'Active').length} note="Enabled workspace access" tone="green" order={1} /></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><StatCard label="Pending invites" value={users.filter((u) => u.status === 'Invited').length} note="Awaiting acceptance" tone="amber" order={2} /></Grid>
      </Grid>
      <Reveal>
        <Card>
          <CardHeader title="Workspace accounts" subheader="Adjust roles and account status for demo users" action={<StatusTag label="Admin only" tone="blue" />} />
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow><TableCell>User</TableCell><TableCell>Role</TableCell><TableCell>Status</TableCell><TableCell>Last access</TableCell><TableCell align="right">Action</TableCell></TableRow></TableHead>
              <TableBody>
                {users.map((u, i) => (
                  <TableRow key={u.email} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{u.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onChange={(e) => {
                          dispatch({ type: 'setUserRole', index: i, role: e.target.value as WorkspaceUser['role'] });
                          dispatch({ type: 'toast', text: 'Demo user role updated.' });
                        }}
                        sx={{ minWidth: 120, height: 32 }}
                        inputProps={{ 'aria-label': `Role for ${u.name}` }}
                      >
                        {['Admin', 'Analyst', 'Viewer'].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
                      </Select>
                    </TableCell>
                    <TableCell><StatusTag label={u.status} tone={u.status === 'Active' ? 'green' : u.status === 'Invited' ? 'amber' : 'red'} /></TableCell>
                    <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>{u.last}</TableCell>
                    <TableCell align="right">
                      <Tooltip title={i === 0 ? 'Cannot disable the demo administrator' : ''}>
                        <Box component="span">
                          <Button
                            size="small"
                            disabled={i === 0}
                            sx={{ minWidth: 104 }}
                            onClick={() => {
                              dispatch({ type: 'toggleUser', index: i });
                              dispatch({ type: 'toast', text: 'Demo account status updated.' });
                            }}
                          >
                            {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                          </Button>
                        </Box>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Reveal>
    </Stack>
  );
}
