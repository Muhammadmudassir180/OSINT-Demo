import { Box, Button, Card, CardContent, CardHeader, Grid, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { CheckCircleOutline, Download, VerifiedUserOutlined } from '@mui/icons-material';
import { seedAudit } from '../data/demo';
import { Mono, PageHeader, Reveal, StatusTag } from '../components/ui';
import { csvDownload } from '../lib/osint';
import { useAppDispatch, useAppState } from '../state/AppContext';
import type { AppState } from '../state/reducer';

const PRINCIPLES = [['Access tracking', 'Record user and privileged actions'], ['Source traceability', 'Preserve collection and export provenance'], ['Tamper-resistance', 'Store immutable signed audit events'], ['Retention controls', 'Apply organization policies and legal limits']];

export default function Audit() {
  const { auditFilter } = useAppState();
  const dispatch = useAppDispatch();
  const rows = seedAudit.filter((a) => auditFilter === 'All' || a[3] === auditFilter);
  return (
    <Stack spacing={3}>
      <PageHeader
        title="Activity & Audit Logs"
        description="Review example user events, system actions, and operational alerts."
        actions={<Button startIcon={<Download />} onClick={() => csvDownload('demo_audit_log.csv', [['Time', 'Event', 'Actor', 'Severity', 'Reference'], ...seedAudit])}>Export CSV</Button>}
      />
      <Reveal>
        <Card>
          <CardHeader
            title="Audit events"
            subheader={`Read-only demonstration event history · ${rows.length} events`}
            action={
              <ToggleButtonGroup size="small" exclusive value={auditFilter} onChange={(_, v: AppState['auditFilter'] | null) => v && dispatch({ type: 'setAuditFilter', filter: v })} aria-label="Filter by severity">
                {(['All', 'Success', 'Failed', 'Info'] as const).map((x) => <ToggleButton key={x} value={x}>{x}</ToggleButton>)}
              </ToggleButtonGroup>
            }
            sx={{ flexWrap: 'wrap' }}
          />
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow><TableCell>Time</TableCell><TableCell>Event</TableCell><TableCell>Actor</TableCell><TableCell>Severity</TableCell><TableCell>Reference</TableCell></TableRow></TableHead>
              <TableBody>
                {rows.map((x, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}><Mono>{x[0]}</Mono></TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{x[1]}</TableCell>
                    <TableCell sx={{ color: 'text.secondary' }}>{x[2]}</TableCell>
                    <TableCell><StatusTag label={x[3]} tone={x[3] === 'Success' ? 'green' : x[3] === 'Failed' ? 'red' : 'blue'} /></TableCell>
                    <TableCell><Mono sx={{ color: 'text.secondary' }}>{x[4]}</Mono></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Reveal>
      <Reveal>
        <Card>
          <CardHeader title="Audit design principles" subheader="Recommended enterprise deployment controls" action={<VerifiedUserOutlined sx={{ color: 'text.secondary' }} />} />
          <CardContent sx={{ pt: 0 }}>
            <Grid container spacing={1.5}>
              {PRINCIPLES.map(([t, d]) => (
                <Grid key={t} size={{ xs: 12, sm: 6, lg: 3 }}>
                  <Stack direction="row" spacing={1.25} sx={{ p: 1.5, height: '100%', borderRadius: 1, bgcolor: 'tokens.surface2' }}>
                    <CheckCircleOutline fontSize="small" sx={{ color: 'success.main' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{t}</Typography>
                      <Typography variant="caption" color="text.secondary">{d}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Reveal>
    </Stack>
  );
}
