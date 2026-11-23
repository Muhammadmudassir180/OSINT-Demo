import { useRef, type ChangeEvent } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Divider, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { Add, Download, FileUploadOutlined, Layers } from '@mui/icons-material';
import { EmptyState, Mono, PageHeader, Reveal, StatusTag, useToneColor } from '../components/ui';
import { csvDownload } from '../lib/osint';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { BulkJob, Tone } from '../types';

// Batch timers live outside the component so a batch keeps running when the analyst leaves the page,
// and starting a new batch cancels the old one.
let batchTimers: ReturnType<typeof setTimeout>[] = [];

const tone = (s: BulkJob['status']): Tone => (s === 'Completed' ? 'green' : s === 'Failed' ? 'red' : s === 'Running' ? 'blue' : 'amber');

export default function Bulk() {
  const { bulkJobs, bulkLines } = useAppState();
  const dispatch = useAppDispatch();
  const fileRef = useRef<HTMLInputElement>(null);

  const start = () => {
    const lines = bulkLines.split(/\r?\n/).map((s) => s.split(',')[0].trim()).filter((x) => x && !['entity', 'name'].includes(x.toLowerCase())).slice(0, 100);
    if (!lines.length) return dispatch({ type: 'toast', text: 'Enter at least one entity to start a batch.' });
    batchTimers.forEach(clearTimeout);
    batchTimers = [];
    dispatch({ type: 'setBulkJobs', jobs: lines.map((name) => ({ name, status: 'Queued' })) });
    lines.forEach((_, i) => {
      batchTimers.push(setTimeout(() => dispatch({ type: 'setBulkStatus', index: i, status: 'Running' }), 400 + i * 250));
      batchTimers.push(
        setTimeout(() => {
          dispatch({ type: 'setBulkStatus', index: i, status: i === 3 ? 'Failed' : 'Completed' }); // row 4 fails on purpose to show the error state
          if (i === lines.length - 1) dispatch({ type: 'toast', text: 'Demo batch finished. No external searches were performed.' });
        }, 1350 + i * 350),
      );
    });
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 500_000) return dispatch({ type: 'toast', text: 'Demo import limit is 500 KB.' });
    file.text().then((text) => {
      dispatch({ type: 'setBulkLines', text: text.trim() });
      dispatch({ type: 'toast', text: 'CSV imported into the entry field. Review before running.' });
    });
  };

  const counts: [string, number, Tone][] = (['Queued', 'Running', 'Completed', 'Failed'] as const).map((s) => [s, bulkJobs.filter((x) => x.status === s).length, tone(s)]);

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Bulk Entity Search"
        description="Submit multiple entity queries and monitor batch execution."
        actions={<Button startIcon={<Download />} onClick={() => csvDownload('entity_search_template.csv', [['entity'], ['Helio Freight Group'], ['Mira Solen']])}>Download CSV template</Button>}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Reveal sx={{ height: '100%' }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="New bulk search" subheader="Enter entities or import a CSV file" action={<StatusTag label="Up to 100 entries" />} />
              <CardContent sx={{ pt: 0 }}>
                <Box
                  onClick={() => fileRef.current?.click()}
                  sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 3, textAlign: 'center', bgcolor: 'tokens.surface2', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
                >
                  <FileUploadOutlined sx={{ fontSize: 32, color: 'text.secondary' }} />
                  <Typography variant="h3" sx={{ mt: 1 }}>Import entities from a CSV</Typography>
                  <Typography variant="body2" color="text.secondary">One entity per line, or upload a .csv/.txt file (500 KB max)</Typography>
                  <Button size="small" sx={{ mt: 1.5 }} onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}>Choose file</Button>
                  <input ref={fileRef} type="file" accept=".csv,.txt,text/csv" hidden onChange={onFile} aria-label="Upload CSV" />
                </Box>
                <TextField
                  label="Entity names"
                  multiline
                  minRows={5}
                  fullWidth
                  value={bulkLines}
                  onChange={(e) => dispatch({ type: 'setBulkLines', text: e.target.value })}
                  placeholder={'Helio Freight Group\nMira Solen\nHarborline Consultants'}
                  sx={{ mt: 2.5 }}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2, gap: 2 }}>
                  <Typography variant="body2" color="text.secondary">Each row creates one simulated search job</Typography>
                  <Button variant="contained" startIcon={<Add />} onClick={start}>Start batch</Button>
                </Stack>
              </CardContent>
            </Card>
          </Reveal>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Reveal order={1} sx={{ height: '100%' }}>
            <Card sx={{ height: '100%' }}>
              <CardHeader title="Batch summary" subheader="Live UI simulation, no network jobs" action={<StatusTag label={`${bulkJobs.length} jobs`} tone="blue" />} />
              <CardContent sx={{ pt: 0 }}>
                <Grid container spacing={1.5}>
                  {counts.map(([l, v, t]) => <Grid key={l} size={6}><Count label={l} value={v} tone={t} /></Grid>)}
                </Grid>
                <Divider sx={{ my: 2.5 }} />
                <Typography variant="h3">How this works in production</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
                  A backend service would validate uploaded data, enforce access controls, queue tasks, track each job, and return sourced records and actionable errors. This prototype simulates the workflow locally.
                </Typography>
              </CardContent>
            </Card>
          </Reveal>
        </Grid>
      </Grid>
      <Reveal>
        <Card>
          <CardHeader title="Batch job monitor" subheader="Search jobs queued in this browser session" action={<Button size="small" startIcon={<Download />} onClick={() => csvDownload('demo_bulk_search_results.csv', [['Entity', 'Status'], ...bulkJobs.map((x) => [x.name, x.status])])}>Export results</Button>} />
          {bulkJobs.length ? (
            <TableContainer>
              <Table size="small">
                <TableHead><TableRow><TableCell>Job</TableCell><TableCell>Query</TableCell><TableCell>State</TableCell><TableCell>Result</TableCell></TableRow></TableHead>
                <TableBody>
                  {bulkJobs.map((x, i) => (
                    <TableRow key={i}>
                      <TableCell><Mono>BATCH-{String(i + 1).padStart(3, '0')}</Mono></TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{x.name}</TableCell>
                      <TableCell><StatusTag label={x.status} tone={tone(x.status)} /></TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{x.status === 'Completed' ? 'Demo job finished' : x.status === 'Failed' ? 'Source timed out (simulated)' : 'Awaiting completion'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <EmptyState icon={<Layers />} title="No batch jobs yet">Upload a CSV or enter entity names, then select Start batch.</EmptyState>
          )}
        </Card>
      </Reveal>
    </Stack>
  );
}

function Count({ label, value, tone: t }: { label: string; value: number; tone: Tone }) {
  const color = useToneColor(t);
  return (
    <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'tokens.surface2' }}>
      <Typography variant="overline" color="text.secondary" component="div">{label}</Typography>
      <Typography sx={{ fontFamily: (th) => th.palette.tokens.mono, fontSize: 22, fontWeight: 500, color }}>{value}</Typography>
    </Box>
  );
}
