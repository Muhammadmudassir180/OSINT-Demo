import { memo, type ReactNode } from 'react';
import { alpha, Box, Stack, Typography, useTheme, type SxProps, type Theme } from '@mui/material';
import { keyframes } from '@mui/system';
import { useCountUp, useInView } from '../hooks/motion';
import { motion } from '../theme';
import { fmt } from '../lib/osint';
import type { Tone } from '../types';

const pulse = keyframes`0%,100%{opacity:1}50%{opacity:.45}`;
const rise = keyframes`from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}`;

export function useToneColor(tone: Tone) {
  const t = useTheme().palette.tokens;
  return { green: t.green, amber: t.amber, red: t.red, blue: t.link, default: t.soft }[tone];
}

/** Status is carried by shape and text as well as colour: ● done, ◐ in progress, ⊘ failed. */
function Mark({ tone }: { tone: Tone }) {
  if (tone === 'green') return <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4" fill="currentColor" /></svg>;
  if (tone === 'amber')
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M5 1.4a3.6 3.6 0 0 1 0 7.2Z" fill="currentColor" />
      </svg>
    );
  if (tone === 'red')
    return (
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <circle cx="5" cy="5" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M2.5 7.5 7.5 2.5" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  return null;
}

export const StatusTag = memo(function StatusTag({ label, tone = 'default' }: { label: string; tone?: Tone }) {
  const color = useToneColor(tone);
  const live = tone === 'amber' && /^(crawling|in progress)|running/i.test(label);
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', gap: 0.75, height: 22, px: 1, borderRadius: 1, flexShrink: 0,
        fontSize: 12, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', color,
        bgcolor: alpha(color, 0.12), border: `1px solid ${alpha(color, 0.28)}`,
        '& svg': live ? { animation: `${pulse} 1.6s ${motion.standard} infinite` } : undefined,
      }}
    >
      <Mark tone={tone} />
      {label}
    </Box>
  );
});

export function PageHeader({ title, description, actions, crumb }: { title: ReactNode; description: ReactNode; actions?: ReactNode; crumb?: ReactNode }) {
  return (
    <Reveal>
      {crumb && <Box sx={{ mb: 1 }}>{crumb}</Box>}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h1" component="h1">{title}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>{description}</Typography>
        </Box>
        {actions && <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', flexShrink: 0 }}>{actions}</Stack>}
      </Stack>
    </Reveal>
  );
}

/** Fades content up once it scrolls into view. `order` staggers siblings. */
export function Reveal({ children, order = 0, sx }: { children: ReactNode; order?: number; sx?: SxProps<Theme> }) {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <Box
      ref={ref}
      sx={[
        { opacity: seen ? 1 : 0, animation: seen ? `${rise} ${motion.slow}ms ${motion.entrance} both` : 'none', animationDelay: `${Math.min(order, 10) * 45}ms`, minWidth: 0 },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}

export function CountUp({ value }: { value: number }) {
  return <>{fmt(useCountUp(value))}</>;
}

export function StatCard({ label, value, note, tone, order }: { label: string; value: number; note: ReactNode; tone?: Tone; order?: number }) {
  const color = useToneColor(tone ?? 'default');
  return (
    <Reveal order={order} sx={{ height: '100%' }}>
      <Box sx={{ height: '100%', p: 2.5, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper', position: 'relative', overflow: 'hidden' }}>
        {tone && <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: color }} />}
        <Typography variant="overline" color="text.secondary" component="div">{label}</Typography>
        <Typography sx={{ fontFamily: (t) => t.palette.tokens.mono, fontSize: 28, fontWeight: 500, lineHeight: 1.2, my: 0.5, color: tone ? color : 'text.primary' }}>
          <CountUp value={value} />
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div">{note}</Typography>
      </Box>
    </Reveal>
  );
}

export function EmptyState({ icon, title, children, action, minHeight = 240 }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode; minHeight?: number }) {
  return (
    <Stack spacing={1} sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', px: 3, py: 5, minHeight }}>
      <Box sx={{ width: 48, height: 48, borderRadius: 1, display: 'grid', placeItems: 'center', bgcolor: 'tokens.surface2', color: 'text.secondary', mb: 0.5 }}>{icon}</Box>
      <Typography variant="h3">{title}</Typography>
      {children && <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>{children}</Typography>}
      {action && <Box sx={{ pt: 1 }}>{action}</Box>}
    </Stack>
  );
}

export function Mono({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return <Box component="span" sx={[{ fontFamily: (t) => t.palette.tokens.mono, fontSize: '0.92em' }, ...(Array.isArray(sx) ? sx : [sx])]}>{children}</Box>;
}

export function Highlight({ text, term }: { text: string; term: string }) {
  const t = term.trim().replace(/^@/, '');
  const i = t ? text.toLowerCase().indexOf(t.toLowerCase()) : -1;
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + t.length)}</mark>
      {text.slice(i + t.length)}
    </>
  );
}
