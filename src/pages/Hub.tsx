import { Box, Button, ButtonBase, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import { Add, Download, PeopleOutline } from '@mui/icons-material';
import { Mono, PageHeader, Reveal, StatCard, StatusTag } from '../components/ui';
import { csvDownload } from '../lib/osint';
import { useAppDispatch, useAppState } from '../state/AppContext';

export default function Hub() {
  const { cases } = useAppState();
  const dispatch = useAppDispatch();
  const newCase = () => dispatch({ type: 'openModal', modal: { type: 'case', prefill: '' } });
  const open = cases.filter((c) => c.status !== 'Completed').length;
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Intelligence Hub"
        description="Organize investigations, build evidence-led cases, and monitor review status."
        actions={
          <>
            <Button startIcon={<Download />} onClick={() => csvDownload('demo_case_list.csv', [['ID', 'Title', 'Status', 'Owner', 'Priority', 'Progress'], ...cases.map((x) => [x.id, x.title, x.status, x.owner, x.severity, x.progress])])}>Export cases</Button>
            <Button variant="contained" startIcon={<Add />} onClick={newCase}>New case</Button>
          </>
        }
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 4 }}><StatCard label="All cases" value={cases.length} note="Across your demo workspace" /></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><StatCard label="Open" value={open} note="Active or in review" tone="amber" order={1} /></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><StatCard label="Completed" value={cases.length - open} note="Reviewed and archived" tone="green" order={2} /></Grid>
      </Grid>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <StatusTag label="Investigations board" tone="blue" />
        <Typography variant="body2" color="text.secondary">Select a case to view its metadata</Typography>
      </Stack>
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {cases.map((c, i) => (
          <Reveal key={c.id} order={i} sx={{ height: '100%' }}>
            <ButtonBase
              onClick={() => dispatch({ type: 'openModal', modal: { type: 'caseview', index: i } })}
              sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', p: 2.5, borderRadius: 1, border: 1, borderColor: 'divider', bgcolor: 'background.paper', transition: 'border-color 110ms, transform 240ms', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' } }}
            >
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Mono sx={{ color: 'text.secondary', fontSize: 12 }}>{c.id}</Mono>
                <StatusTag label={c.status} tone={c.status === 'Completed' ? 'green' : c.status === 'In review' ? 'amber' : 'blue'} />
              </Stack>
              <Typography variant="h3" sx={{ mt: 1.5 }}>{c.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, flex: 1 }}>{c.description}</Typography>
              <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 2, mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary">Review progress</Typography>
                <Mono sx={{ fontSize: 12, fontWeight: 600 }}>{c.progress}%</Mono>
              </Stack>
              <LinearProgress variant="determinate" value={c.progress} color={c.progress === 100 ? 'success' : 'primary'} aria-label={`Review progress ${c.progress}%`} />
              <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider', color: 'text.secondary' }}>
                <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}><PeopleOutline sx={{ fontSize: 16 }} /><Typography variant="caption">{c.owner}</Typography></Stack>
                <Typography variant="caption">{c.time}</Typography>
              </Stack>
            </ButtonBase>
          </Reveal>
        ))}
        <Reveal order={cases.length} sx={{ height: '100%' }}>
          <ButtonBase onClick={newCase} sx={{ width: '100%', height: '100%', minHeight: 230, flexDirection: 'column', gap: 1, borderRadius: 1, border: '1px dashed', borderColor: 'divider', bgcolor: 'tokens.surface2', color: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'text.primary' } }}>
            <Add fontSize="large" />
            <Typography variant="h3" color="text.primary">Create new case</Typography>
            <Typography variant="body2">Start a structured investigation</Typography>
          </ButtonBase>
        </Reveal>
      </Box>
    </Stack>
  );
}
