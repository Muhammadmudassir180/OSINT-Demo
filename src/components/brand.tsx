import { memo, useId } from 'react';
import { Box } from '@mui/material';
import { platformName } from '../lib/osint';
import type { Profile } from '../types';

/** Platform marks drawn as simple vector badges. */
export const PlatformLogo = memo(function PlatformLogo({ platform, size = 20 }: { platform: string; size?: number }) {
  const gid = useId();
  let body;
  switch (platform) {
    case 'facebook':
      body = (
        <>
          <rect width="24" height="24" rx="6" fill="#237DE6" />
          <path d="M14.6 21v-7.5h2.5l.4-3h-2.9V8.7c0-.9.25-1.5 1.55-1.5H17V4.5c-.55-.08-1.2-.15-2.25-.15-2.25 0-3.8 1.37-3.8 3.9v2.25H8.4v3h2.55V21Z" fill="#fff" />
        </>
      );
      break;
    case 'instagram':
      body = (
        <>
          <defs>
            <linearGradient id={gid} x1="0" y1="24" x2="24" y2="0">
              <stop stopColor="#FFC15D" />
              <stop offset=".55" stopColor="#D34487" />
              <stop offset="1" stopColor="#8540BA" />
            </linearGradient>
          </defs>
          <rect width="24" height="24" rx="6" fill={`url(#${gid})`} />
          <rect x="5" y="5" width="14" height="14" rx="4.5" fill="none" stroke="#fff" strokeWidth="1.85" />
          <circle cx="12" cy="12" r="3.2" stroke="#fff" strokeWidth="1.8" fill="none" />
          <circle cx="16.65" cy="7.5" r="1.1" fill="#fff" />
        </>
      );
      break;
    case 'tiktok':
      body = (
        <>
          <path d="M14 3.2v11.5a4.5 4.5 0 1 1-4.7-4.5" fill="none" stroke="#4cdee3" strokeWidth="3.2" />
          <path d="M14 3c1 3.1 2.9 4.5 6 4.7" fill="none" stroke="#ff5c7a" strokeWidth="3.2" />
          <path d="M13.1 3v11.7a3.65 3.65 0 1 1-4-3.6M13.1 3c1 3.1 2.9 4.5 6.05 4.7" stroke="currentColor" strokeWidth="2.3" fill="none" />
        </>
      );
      break;
    case 'linkedin':
      body = (
        <>
          <rect width="24" height="24" rx="5" fill="#1878B7" />
          <circle cx="6.2" cy="7.2" r="1.4" fill="#fff" />
          <path d="M5 10h2.5v9H5zm5 0h2.4v1.2c.7-1.05 1.6-1.5 2.95-1.5 2.5 0 3.5 1.5 3.5 4v5.3h-2.6v-4.9c0-1.3-.4-2-1.6-2-1.4 0-2 1-2 2.2V19H10Z" fill="#fff" />
        </>
      );
      break;
    case 'youtube':
      body = (
        <>
          <rect x="1" y="4" width="22" height="16" rx="5" fill="#F04352" />
          <path d="m10 8 7 4-7 4Z" fill="#fff" />
        </>
      );
      break;
    case 'telegram':
      body = (
        <>
          <circle cx="12" cy="12" r="11" fill="#36A4DF" />
          <path d="m5 11.7 13-5.2c.8-.32 1.1.1.9.9l-2.2 10c-.12.6-.55.77-1 .48l-3.4-2.55-1.9 1.75.35-3.2L17.3 8l-8.1 5.1-3.3-1c-.7-.2-.9-.25-.9-.4Z" fill="#fff" />
        </>
      );
      break;
    default:
      body = (
        <>
          <path d="M3 3h5l13 18h-5Z" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3.5 21 11 12.5M13 10.8 20.5 3" stroke="currentColor" strokeWidth="1.8" />
        </>
      );
  }
  return (
    <Box component="span" role="img" aria-label={platformName(platform)} sx={{ display: 'inline-flex', flexShrink: 0, width: size, height: size, color: 'text.primary' }}>
      <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true">{body}</svg>
    </Box>
  );
});

const AVATAR_PALETTE = [['#24668b', '#76c1f1'], ['#5a4b8f', '#b7a3ee'], ['#8f5a52', '#ffba91'], ['#246b70', '#8be5da'], ['#54749d', '#d7e7ff'], ['#74617b', '#eac5ea']];

/** Illustrated placeholder: fictional profiles never carry real photos. */
export const SocialAvatar = memo(function SocialAvatar({ profile, size = 40 }: { profile: Profile; size?: number }) {
  const idx = [...profile.id].reduce((a, ch) => a + ch.charCodeAt(0), 0) % AVATAR_PALETTE.length;
  const [base, accent] = AVATAR_PALETTE[idx];
  return (
    <Box component="span" role="img" aria-label="Fictional profile illustration" sx={{ display: 'inline-flex', flexShrink: 0, width: size, height: size, borderRadius: 1, overflow: 'hidden' }}>
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true">
        <rect width="64" height="64" fill={base} />
        <circle cx="59" cy="5" r="23" fill={accent} opacity=".12" />
        {profile.kind === 'person' ? (
          <>
            <ellipse cx="32" cy="57" rx="25" ry="21" fill={accent} opacity=".89" />
            <circle cx="32" cy="26" r="13.5" fill="#ecc8aa" />
            <path d="M18 26q-2-16 12-17 15-2 17 13-5-7-12-6-11 8-17 10Z" fill={base} />
          </>
        ) : profile.kind === 'group' ? (
          <>
            <circle cx="22" cy="27" r="8" fill={accent} />
            <circle cx="42" cy="27" r="8" fill="#e7d7c2" />
            <path d="M5 53c1-11 8-17 17-17 7 0 12 3 14 7 3-4 8-7 13-7 8 0 13 7 14 17Z" fill={accent} opacity=".83" />
          </>
        ) : (
          <>
            <rect x="15" y="14" width="34" height="40" rx="6" fill={accent} opacity=".83" />
            <path d="M23 24h18M23 31h18M23 38h12" stroke={base} strokeWidth="3" strokeLinecap="round" />
            <path d="M19 54h26" stroke="#ffffff88" strokeWidth="3" />
          </>
        )}
      </svg>
    </Box>
  );
});
