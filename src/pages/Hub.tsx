import { useState } from 'react';
import { Box, Button, ButtonBase, Grid, InputAdornment, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { Add, FolderOutlined, Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { CaseCard } from '../components/CaseCard';
import { EmptyState, Mono, PageHeader, Reveal, StatCard } from '../components/ui';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { Case } from '../types';

const FILTERS = ['All', 'Active', 'In review', 'Completed'] as const;

export default function Hub() {
  const { cases } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'All' | Case['status']>('All');
  const [query, setQuery] = useState('');
  const newCase = () => dispatch({ type: 'openModal', modal: { type: 'case', prefill: '' } });
  const open = cases.filter((c) => c.status !== 'Completed');
  const count = (f: (typeof FILTERS)[number]) => (f === 'All' ? cases.length : cases.filter((c) => c.status === f).length);
  const q = query.trim().toLowerCase();
  // Keep each case's index in the full list: the details dialog looks cases up by it.
  const shown = cases.map((c, i) => [c, i] as const).filter(([c]) => (filter === 'All' || c.status === filter) && (!q || `${c.id} ${c.title} ${c.description}`.toLowerCase().includes(q)));
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Intelligence Hub"
        description="Open investigations, track what each one monitors, and file finished work in Case files."
        actions={
          <>
            <Button startIcon={<FolderOutlined />} onClick={() => navigate('/hub/archive')}>Case files</Button>
            <Button variant="contained" startIcon={<Add />} onClick={newCase}>New investigation</Button>
          </>
        }
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 6, md: 3 }}><StatCard label="All cases" value={cases.length} note="Across your demo workspace" /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><StatCard label="Open" value={open.length} note="Active or in review" tone="blue" order={1} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><StatCard label="High priority" value={open.filter((c) => c.severity === 'High').length} note="Open cases marked High" tone="red" order={2} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><StatCard label="Completed" value={cases.length - open.length} note="Reviewed and closed" tone="green" order={3} /></Grid>
      </Grid>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
        <ToggleButtonGroup size="small" exclusive value={filter} onChange={(_, v: typeof filter | null) => v && setFilter(v)} aria-label="Filter cases by status" sx={{ flexWrap: 'wrap' }}>
          {FILTERS.map((f) => (
            <ToggleButton key={f} value={f}>{f}<Mono sx={{ ml: 1, fontSize: 12, color: 'text.secondary' }}>{count(f)}</Mono></ToggleButton>
          ))}
        </ToggleButtonGroup>
        <TextField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, ID or objective"
          sx={{ width: { xs: '100%', sm: 300 } }}
          slotProps={{ htmlInput: { 'aria-label': 'Search cases' }, input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
        />
      </Stack>
      {shown.length ? (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {shown.map(([c, i], n) => (
            <Reveal key={c.id} order={n} sx={{ height: '100%' }}>
              <CaseCard c={c} index={i} />
            </Reveal>
          ))}
          {filter === 'All' && !q && (
            <Reveal order={shown.length} sx={{ height: '100%' }}>
              <ButtonBase onClick={newCase} sx={{ width: '100%', height: '100%', minHeight: 230, flexDirection: 'column', gap: 1, borderRadius: 1, border: '1px dashed', borderColor: 'divider', bgcolor: 'tokens.surface2', color: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'text.primary' } }}>
                <Add fontSize="large" />
                <Typography variant="h3" color="text.primary">New investigation</Typography>
                <Typography variant="body2">Write a brief, then choose what to monitor</Typography>
              </ButtonBase>
            </Reveal>
          )}
        </Box>
      ) : (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
          <EmptyState icon={<Search />} title="No cases match" action={<Button onClick={() => { setFilter('All'); setQuery(''); }}>Clear filters</Button>}>
            Try another status or search term.
          </EmptyState>
        </Box>
      )}
    </Stack>
  );
}
