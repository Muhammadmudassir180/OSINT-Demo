import { Box, ButtonBase, LinearProgress, Stack, Typography } from '@mui/material';
import { PeopleOutline } from '@mui/icons-material';
import { useAppDispatch } from '../state/AppContext';
import type { Case, Tone } from '../types';
import { Mono, PriorityTag, StatusTag } from './ui';

export const caseTone = (s: Case['status']): Tone => (s === 'Completed' ? 'green' : s === 'In review' ? 'amber' : 'blue');

/** A case on a board; `index` is its position in state.cases, which the details dialog reads. */
export function CaseCard({ c, index }: { c: Case; index: number }) {
  const dispatch = useAppDispatch();
  return (
    <ButtonBase
      onClick={() => dispatch({ type: 'openModal', modal: { type: 'caseview', index } })}
      sx={{
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', borderRadius: 1, overflow: 'hidden',
        border: 1, borderColor: 'divider', bgcolor: 'background.paper', transition: 'border-color 110ms', '&:hover': { borderColor: 'primary.main' },
        '&.Mui-focusVisible': { outline: 2, outlineColor: 'primary.main', outlineOffset: 2 },
      }}
    >
      {c.image && <Box component="img" src={c.image} alt="" sx={{ width: '100%', aspectRatio: '16 / 5', objectFit: 'cover', borderBottom: 1, borderColor: 'divider' }} />}
      <Stack sx={{ p: 2.5, flex: 1 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
          <Mono sx={{ color: 'text.secondary', fontSize: 12, lineHeight: '22px' }}>{c.id}</Mono>
          <Stack spacing={1} sx={{ alignItems: 'flex-end' }}>
            <StatusTag label={c.status} tone={caseTone(c.status)} />
            <PriorityTag level={c.severity} />
          </Stack>
        </Stack>
        <Typography variant="h3" sx={{ mt: 1 }}>{c.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{c.description}</Typography>
        <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 'auto', mb: 0.75 }}>
          <Typography variant="caption" color="text.secondary">Review progress</Typography>
          <Mono sx={{ fontSize: 12, fontWeight: 600 }}>{c.progress}%</Mono>
        </Stack>
        <LinearProgress variant="determinate" value={c.progress} color={c.progress === 100 ? 'success' : 'primary'} aria-label={`Review progress ${c.progress}%`} />
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider', color: 'text.secondary' }}>
          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}><PeopleOutline sx={{ fontSize: 16 }} /><Typography variant="caption">{c.owner}</Typography></Stack>
          <Typography variant="caption">{c.time}</Typography>
        </Stack>
      </Stack>
    </ButtonBase>
  );
}
