import { Grid } from '@mui/material';
import { StatCard } from './ui';
import type { CrawlJob } from '../types';

export function ArchiveStats({ jobs }: { jobs: CrawlJob[] }) {
  const count = (s: CrawlJob['status']) => jobs.filter((j) => j.status === s).length;
  const cells = [
    { label: 'Total crawls', value: jobs.length, note: 'All crawl jobs' },
    { label: 'In progress', value: count('In Progress'), note: 'Collecting now', tone: 'amber' as const },
    { label: 'Completed', value: count('Completed'), note: 'Records available', tone: 'green' as const },
    { label: 'Failed', value: count('Failed'), note: 'Need a new crawl', tone: 'red' as const },
  ];
  return (
    <Grid container spacing={2}>
      {cells.map((c, i) => (
        <Grid key={c.label} size={{ xs: 6, md: 3 }}>
          <StatCard {...c} order={i} />
        </Grid>
      ))}
    </Grid>
  );
}
