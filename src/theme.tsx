import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { alpha, createTheme, CssBaseline, ThemeProvider } from '@mui/material';

// Palette: Palantir Blueprint tokens. Motion: IBM Carbon durations and easing curves.
declare module '@mui/material/styles' {
  interface Palette {
    tokens: Tokens;
  }
  interface PaletteOptions {
    tokens?: Tokens;
  }
}

interface Tokens {
  chrome: string;
  surface2: string;
  surface3: string;
  stroke: string;
  soft: string;
  data: string;
  link: string;
  green: string;
  amber: string;
  red: string;
  mono: string;
  condensed: string;
}

export type Mode = 'dark' | 'light';

const SANS = '"IBM Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const MONO = '"IBM Plex Mono", ui-monospace, SFMono-Regular, Menlo, monospace';
const CONDENSED = '"IBM Plex Sans Condensed", "IBM Plex Sans", system-ui, sans-serif';

export const motion = {
  fast: 110,
  moderate: 240,
  slow: 400,
  standard: 'cubic-bezier(.2,0,.38,.9)',
  entrance: 'cubic-bezier(0,0,.38,.9)',
  exit: 'cubic-bezier(.2,0,1,.9)',
};

const PALETTES = {
  dark: {
    bg: '#1C2127', surface: '#252A31', surface2: '#2F343C', surface3: '#383E47', chrome: '#111418',
    text: '#F6F7F9', muted: '#ABB3BF', soft: '#97A1AF', stroke: 'rgba(171,179,191,.18)',
    link: '#8ABBFF', primary: '#2D72D2', data: '#4C90F0', green: '#72CA9B', amber: '#FBB360', red: '#FA999C',
  },
  light: {
    bg: '#F6F7F9', surface: '#FFFFFF', surface2: '#EDEFF2', surface3: '#E5E8EB', chrome: '#FFFFFF',
    text: '#1C2127', muted: '#404854', soft: '#5F6B7C', stroke: 'rgba(17,20,24,.14)',
    link: '#215DB0', primary: '#2D72D2', data: '#2D72D2', green: '#1C6E42', amber: '#935610', red: '#AC2F33',
  },
};

export function buildTheme(mode: Mode) {
  const c = PALETTES[mode];
  return createTheme({
    palette: {
      mode,
      primary: { main: c.primary, contrastText: '#FFFFFF' },
      success: { main: c.green },
      warning: { main: c.amber },
      error: { main: c.red },
      info: { main: c.link },
      background: { default: c.bg, paper: c.surface },
      text: { primary: c.text, secondary: c.muted },
      divider: c.stroke,
      tokens: {
        chrome: c.chrome, surface2: c.surface2, surface3: c.surface3, stroke: c.stroke, soft: c.soft,
        data: c.data, link: c.link, green: c.green, amber: c.amber, red: c.red, mono: MONO, condensed: CONDENSED,
      },
    },
    shape: { borderRadius: 4 },
    spacing: 8,
    typography: {
      fontFamily: SANS,
      fontSize: 14,
      h1: { fontFamily: CONDENSED, fontSize: 26, fontWeight: 600, letterSpacing: '-.01em', lineHeight: 1.2 },
      h2: { fontFamily: CONDENSED, fontSize: 20, fontWeight: 600, lineHeight: 1.25 },
      h3: { fontSize: 15, fontWeight: 600, lineHeight: 1.35 },
      h4: { fontSize: 14, fontWeight: 600 },
      body1: { fontSize: 14, lineHeight: 1.55 },
      body2: { fontSize: 13, lineHeight: 1.5 },
      caption: { fontSize: 12, lineHeight: 1.45 },
      overline: { fontSize: 11, fontWeight: 600, letterSpacing: '.08em', lineHeight: 1.6 },
      button: { textTransform: 'none', fontWeight: 600, letterSpacing: 0 },
    },
    transitions: {
      duration: { shortest: motion.fast, shorter: motion.fast, short: motion.moderate, standard: motion.moderate, complex: motion.slow, enteringScreen: motion.moderate, leavingScreen: motion.fast },
      easing: { easeInOut: motion.standard, easeOut: motion.entrance, easeIn: motion.exit, sharp: motion.standard },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { backgroundColor: c.bg, color: c.text, WebkitFontSmoothing: 'antialiased' },
          'code, kbd, .mono': { fontFamily: MONO },
          mark: { background: alpha(c.amber, 0.28), color: 'inherit', borderRadius: 2, padding: '0 1px' },
          '@media (prefers-reduced-motion: reduce)': { '*, *::before, *::after': { animationDuration: '1ms !important', transitionDuration: '1ms !important' } },
        },
      },
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: { root: { borderColor: c.stroke, backgroundColor: c.surface } },
      },
      MuiCardHeader: {
        defaultProps: { titleTypographyProps: { variant: 'h3' }, subheaderTypographyProps: { variant: 'body2' } },
        styleOverrides: { root: { padding: '16px 20px', alignItems: 'flex-start', gap: 12 }, action: { margin: 0, alignSelf: 'center' }, avatar: { marginRight: 0 } },
      },
      MuiCardContent: { styleOverrides: { root: { padding: '16px 20px', '&:last-child': { paddingBottom: 20 } } } },
      MuiButton: {
        defaultProps: { disableElevation: true, variant: 'outlined', size: 'medium' },
        styleOverrides: {
          root: { minHeight: 36, whiteSpace: 'nowrap', transition: `background-color ${motion.fast}ms ${motion.standard}, border-color ${motion.fast}ms ${motion.standard}, transform ${motion.fast}ms ${motion.standard}`, '&:active': { transform: 'translateY(1px)' } },
          sizeSmall: { minHeight: 30, fontSize: 13 },
          outlined: { borderColor: c.stroke, color: c.text, backgroundColor: c.surface2, '&:hover': { backgroundColor: c.surface3, borderColor: c.stroke } },
        },
      },
      MuiIconButton: { styleOverrides: { root: { borderRadius: 4 } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 4, fontWeight: 500 } } },
      MuiTextField: { defaultProps: { size: 'small' } },
      MuiSelect: { defaultProps: { size: 'small' } },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { backgroundColor: mode === 'dark' ? c.chrome : c.surface, '& .MuiOutlinedInput-notchedOutline': { borderColor: c.stroke } },
          input: { '&::placeholder': { color: c.soft, opacity: 1 } },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 600, padding: '5px 12px', color: c.muted, borderColor: c.stroke, '&.Mui-selected': { color: c.text, backgroundColor: c.surface3 } },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: c.stroke, padding: '12px 20px' },
          head: { fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: c.soft, backgroundColor: c.surface2 },
        },
      },
      MuiTooltip: { styleOverrides: { tooltip: { fontSize: 12, backgroundColor: mode === 'dark' ? c.surface3 : '#1C2127' } } },
      MuiDialog: { styleOverrides: { paper: { border: `1px solid ${c.stroke}` } } },
      MuiLinearProgress: { styleOverrides: { root: { height: 6, borderRadius: 3, backgroundColor: c.surface3 }, bar: { borderRadius: 3 } } },
      MuiTab: { styleOverrides: { root: { textTransform: 'none', fontWeight: 600, minHeight: 44 } } },
    },
  });
}

const ModeCtx = createContext<{ mode: Mode; setMode: (m: Mode) => void } | null>(null);

export function AppThemeProvider({ children, initial = 'dark' }: { children: ReactNode; initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const theme = useMemo(() => buildTheme(mode), [mode]); // rebuilt only when the mode flips
  const value = useMemo(() => ({ mode, setMode }), [mode]);
  return (
    <ModeCtx.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ModeCtx.Provider>
  );
}

export function useThemeMode() {
  const v = useContext(ModeCtx);
  if (!v) throw new Error('useThemeMode must be used inside AppThemeProvider');
  return v;
}
