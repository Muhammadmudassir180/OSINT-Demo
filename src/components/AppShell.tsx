import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  alpha, AppBar, Avatar, Badge, Box, Button, ButtonBase, Divider, Drawer, IconButton, InputBase, LinearProgress, ListItemIcon, Menu, MenuItem,
  Popover, Stack, Toolbar, Tooltip, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import {
  CheckCircleOutline, DarkModeOutlined, DashboardOutlined, DescriptionOutlined, GroupsOutlined, History, KeyboardArrowDown, LightModeOutlined,
  LogoutOutlined, ManageSearch, Menu as MenuIcon, NotificationsNoneOutlined, PeopleOutline, PsychologyOutlined, Radar, Search, SettingsOutlined,
  ViewSidebarOutlined, WarningAmberOutlined,
} from '@mui/icons-material';
import { NOTES } from '../data/demo';
import { useOpenNameSearch } from '../hooks/useOpenSearch';
import { useNow } from '../state/clock';
import { useAppDispatch, useAppState } from '../state/AppContext';
import { useThemeMode, motion } from '../theme';
import { StatusTag } from './ui';

const SIDEBAR = 248;
const SIDEBAR_COMPACT = 64;

const NAV: { to: string; label: string; icon: ReactNode; admin?: boolean; also?: string }[] = [
  { to: '/', label: 'Dashboard', icon: <DashboardOutlined fontSize="small" /> },
  { to: '/entity', label: 'Entity Search', icon: <ManageSearch fontSize="small" />, also: '/archive' },
  { to: '/hub', label: 'Intelligence Hub', icon: <PsychologyOutlined fontSize="small" /> },
  { to: '/explorer', label: 'OSINT Explorer', icon: <Radar fontSize="small" /> },
  { to: '/bulk', label: 'Bulk Entity Search', icon: <GroupsOutlined fontSize="small" /> },
  { to: '/users', label: 'User Management', icon: <PeopleOutline fontSize="small" />, admin: true },
  { to: '/audit', label: 'Activity & Audit Logs', icon: <History fontSize="small" /> },
  { to: '/settings', label: 'Settings', icon: <SettingsOutlined fontSize="small" /> },
];

export default function AppShell() {
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));
  const { compactSidebar } = useAppState();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  // A new page starts at the top, and the mobile drawer closes after navigating.
  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
    setMobileOpen(false);
  }, [pathname]);

  const width = desktop && compactSidebar ? SIDEBAR_COMPACT : SIDEBAR;

  return (
    <Box sx={{ position: 'fixed', inset: 0, display: 'flex', overflow: 'hidden', bgcolor: 'background.default' }}>
      <Drawer
        variant={desktop ? 'permanent' : 'temporary'}
        open={desktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{ width: desktop ? width : 0, flexShrink: 0, transition: `width ${motion.moderate}ms ${motion.standard}` }}
        slotProps={{ paper: { sx: { width, overflowX: 'hidden', bgcolor: 'tokens.chrome', borderRight: 1, borderColor: 'divider', transition: `width ${motion.moderate}ms ${motion.standard}` } } }}
      >
        <Sidebar compact={desktop && compactSidebar} />
      </Drawer>
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <TopBar scrolled={scrolled} onMenu={() => setMobileOpen(true)} showMenu={!desktop} />
        <Box
          component="main"
          ref={mainRef}
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 4)}
          sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', px: { xs: 2, md: 3 }, py: { xs: 2, md: 3 } }}
        >
          <Box sx={{ maxWidth: 1480, mx: 'auto' }}>
            <Suspense fallback={<LinearProgress sx={{ mt: 1 }} aria-label="Loading page" />}>
              <Outlet />
            </Suspense>
          </Box>
        </Box>
        <StatusBar />
      </Box>
    </Box>
  );
}

function Sidebar({ compact }: { compact: boolean }) {
  const { role } = useAppState();
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const items = NAV.filter((n) => !n.admin || role === 'Admin');
  return (
    <Stack sx={{ height: '100%' }}>
      <Stack direction="row" spacing={1.5} sx={{ height: 50, px: 2, alignItems: 'center', borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Box component="img" src="/logo.png" alt="" sx={{ width: 28, height: 28, borderRadius: 1, flexShrink: 0 }} />
        {!compact && (
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontFamily: (t) => t.palette.tokens.condensed, fontWeight: 600, fontSize: 14, lineHeight: 1.2 }} noWrap>Intelligence &amp; OSINT</Typography>
            <Typography variant="caption" color="text.secondary" noWrap component="div">Analyst workspace</Typography>
          </Box>
        )}
      </Stack>
      <Box component="nav" aria-label="Main" sx={{ flex: 1, overflowY: 'auto', px: 1, py: 1.5 }}>
        {!compact && <NavCaption>Workspace</NavCaption>}
        {items.map((n) => {
          const active = n.to === '/' ? pathname === '/' : pathname.startsWith(n.to) || (!!n.also && pathname.startsWith(n.also));
          return (
            <Box key={n.to}>
              {n.admin && !compact && <NavCaption sx={{ mt: 2 }}>Administration</NavCaption>}
              <Tooltip title={compact ? n.label : ''} placement="right">
                <ButtonBase
                  component={NavLink}
                  to={n.to}
                  aria-current={active ? 'page' : undefined}
                  sx={{
                    width: '100%', justifyContent: compact ? 'center' : 'flex-start', gap: 1.5, height: 38, px: 1.5, mb: 0.25, borderRadius: 1,
                    color: active ? 'text.primary' : 'text.secondary', fontSize: 14, fontWeight: active ? 600 : 500, position: 'relative',
                    bgcolor: active ? (t) => alpha(t.palette.primary.main, 0.16) : 'transparent',
                    transition: `background-color ${motion.fast}ms ${motion.standard}, color ${motion.fast}ms ${motion.standard}`,
                    '&:hover': { bgcolor: (t) => (active ? alpha(t.palette.primary.main, 0.2) : t.palette.tokens.surface2), color: 'text.primary' },
                    '&::before': active ? { content: '""', position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, bgcolor: 'primary.main' } : undefined,
                  }}
                >
                  <Box component="span" sx={{ display: 'inline-flex', color: active ? 'tokens.link' : 'inherit' }}>{n.icon}</Box>
                  {!compact && <Box component="span" sx={{ whiteSpace: 'nowrap' }}>{n.label}</Box>}
                </ButtonBase>
              </Tooltip>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ borderTop: 1, borderColor: 'divider', p: 1.5 }}>
        {!compact && (
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', px: 0.5, mb: 1 }}>
            <Avatar sx={{ width: 30, height: 30, fontSize: 12, bgcolor: 'primary.main', color: '#fff' }}>JV</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>Jordan Vale</Typography>
              <Typography variant="caption" color="text.secondary" noWrap component="div">{role} · Demo workspace</Typography>
            </Box>
          </Stack>
        )}
        <Button
          variant="text"
          fullWidth
          size="small"
          onClick={() => dispatch({ type: 'setSetting', key: 'compactSidebar', value: !compact })}
          sx={{ color: 'text.secondary', justifyContent: compact ? 'center' : 'flex-start', display: { xs: 'none', md: 'flex' }, minWidth: 0 }}
          startIcon={compact ? undefined : <ViewSidebarOutlined fontSize="small" />}
          aria-label={compact ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {compact ? <ViewSidebarOutlined fontSize="small" /> : 'Collapse sidebar'}
        </Button>
      </Box>
    </Stack>
  );
}

function NavCaption({ children, sx }: { children: ReactNode; sx?: object }) {
  return <Typography variant="overline" component="div" sx={{ color: 'tokens.soft', px: 1.5, mb: 0.5, ...sx }}>{children}</Typography>;
}

function TopBar({ scrolled, onMenu, showMenu }: { scrolled: boolean; onMenu: () => void; showMenu: boolean }) {
  const { mode, setMode } = useThemeMode();
  const { notify, role } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const openNameSearch = useOpenNameSearch();
  const searchRef = useRef<HTMLInputElement>(null);
  const [anchor, setAnchor] = useState<{ el: HTMLElement; kind: 'demo' | 'notes' | 'profile' } | null>(null);
  const close = useCallback(() => setAnchor(null), []);

  // Press "/" anywhere outside a field to jump to the search box.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '/' && !(e.target as HTMLElement).closest('input,textarea,select,[contenteditable]')) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{ bgcolor: 'tokens.chrome', color: 'text.primary', borderBottom: 1, borderColor: 'divider', boxShadow: scrolled ? '0 4px 12px rgba(0,0,0,.18)' : 'none', transition: `box-shadow ${motion.moderate}ms ${motion.standard}`, zIndex: 2 }}
    >
      <Toolbar disableGutters sx={{ minHeight: '50px !important', px: { xs: 1, md: 2 }, gap: 1 }}>
        {showMenu && (
          <IconButton onClick={onMenu} aria-label="Open navigation"><MenuIcon /></IconButton>
        )}
        <Box
          component="form"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            const term = searchRef.current?.value.trim() ?? '';
            if (term) openNameSearch(term);
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 440, height: 34, px: 1.25, borderRadius: 1, border: 1, borderColor: 'divider', bgcolor: 'background.default', '&:focus-within': { borderColor: 'primary.main' } }}
        >
          <Search fontSize="small" sx={{ color: 'tokens.soft' }} />
          <InputBase inputRef={searchRef} placeholder="Search names or usernames" inputProps={{ 'aria-label': 'Search profiles by name' }} sx={{ flex: 1, fontSize: 14 }} />
          <Box component="kbd" title="Press / to search" sx={{ display: { xs: 'none', sm: 'inline-flex' }, px: 0.75, fontSize: 11, lineHeight: '18px', borderRadius: 0.5, border: 1, borderColor: 'divider', color: 'tokens.soft' }}>/</Box>
        </Box>
        <Box sx={{ flex: 1, display: { xs: 'none', md: 'block' } }} />
        <Button size="small" variant="text" onClick={(e) => setAnchor({ el: e.currentTarget, kind: 'demo' })} sx={{ display: { xs: 'none', sm: 'inline-flex' }, color: 'warning.main', border: 1, borderColor: (t) => alpha(t.palette.warning.main, 0.35), borderRadius: 4, px: 1.5 }} aria-haspopup="dialog">
          Sample data
        </Button>
        <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`}>
          <IconButton onClick={() => setMode(mode === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${mode === 'dark' ? 'light' : 'dark'} theme`}>
            {mode === 'dark' ? <LightModeOutlined fontSize="small" /> : <DarkModeOutlined fontSize="small" />}
          </IconButton>
        </Tooltip>
        <IconButton
          aria-label="Notifications"
          onClick={(e) => (notify ? setAnchor({ el: e.currentTarget, kind: 'notes' }) : dispatch({ type: 'toast', text: 'Enable notifications in Settings to preview alerts.' }))}
        >
          <Badge badgeContent={notify ? NOTES.length : 0} color="error" overlap="circular">
            <NotificationsNoneOutlined fontSize="small" />
          </Badge>
        </IconButton>
        <ButtonBase onClick={(e) => setAnchor({ el: e.currentTarget, kind: 'profile' })} aria-label="Account menu" sx={{ gap: 1, px: 1, height: 36, borderRadius: 1, '&:hover': { bgcolor: 'tokens.surface2' } }}>
          <Avatar sx={{ width: 28, height: 28, fontSize: 12, bgcolor: 'primary.main', color: '#fff' }}>JV</Avatar>
          <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', md: 'block' } }}>Jordan Vale</Typography>
          <KeyboardArrowDown fontSize="small" sx={{ color: 'text.secondary' }} />
        </ButtonBase>
      </Toolbar>

      <Popover open={anchor?.kind === 'demo'} anchorEl={anchor?.el} onClose={close} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { width: 320, p: 2, mt: 1 } } }}>
        <Typography variant="h4">Demonstration workspace</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Every person, organization, case, metric and activity shown is fictional. No backend, live search or identity verification is connected, and crawl jobs are simulated in this browser.
        </Typography>
      </Popover>

      <Popover open={anchor?.kind === 'notes'} anchorEl={anchor?.el} onClose={close} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { width: 340, mt: 1 } } }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="h4">Notifications</Typography>
          <Typography variant="caption" color="text.secondary">{NOTES.length} demo notifications</Typography>
        </Box>
        <Divider />
        {NOTES.map(([icon, text, time]) => (
          <Stack key={text} direction="row" spacing={1.5} sx={{ px: 2, py: 1.25, alignItems: 'flex-start' }}>
            <Box sx={{ color: icon === 'alert' ? 'error.main' : icon === 'done' ? 'success.main' : 'text.secondary', pt: 0.25 }}>
              {icon === 'alert' ? <WarningAmberOutlined fontSize="small" /> : icon === 'done' ? <CheckCircleOutline fontSize="small" /> : icon === 'users' ? <PeopleOutline fontSize="small" /> : <DescriptionOutlined fontSize="small" />}
            </Box>
            <Box>
              <Typography variant="body2">{text}</Typography>
              <Typography variant="caption" color="tokens.soft">{time}</Typography>
            </Box>
          </Stack>
        ))}
        <Divider />
        <MenuItem onClick={() => { close(); navigate('/audit'); }} sx={{ py: 1.25 }}>
          <ListItemIcon><History fontSize="small" /></ListItemIcon>View activity logs
        </MenuItem>
      </Popover>

      <Menu open={anchor?.kind === 'profile'} anchorEl={anchor?.el} onClose={close} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { sx: { width: 260, mt: 1 } } }}>
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>Jordan Vale</Typography>
          <Typography variant="caption" color="text.secondary">jordan.vale@demo.local · {role}</Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { close(); navigate('/settings'); }}><ListItemIcon><SettingsOutlined fontSize="small" /></ListItemIcon>Account settings</MenuItem>
        <MenuItem
          onClick={() => {
            close();
            const next = role === 'Admin' ? 'Analyst' : 'Admin';
            dispatch({ type: 'setRole', role: next });
            dispatch({ type: 'toast', text: `Now previewing ${next} permissions.` });
          }}
        >
          <ListItemIcon><PeopleOutline fontSize="small" /></ListItemIcon>Preview as {role === 'Admin' ? 'Analyst' : 'Admin'}
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { close(); dispatch({ type: 'logout' }); navigate('/'); }} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'inherit' }}><LogoutOutlined fontSize="small" /></ListItemIcon>Sign out
        </MenuItem>
      </Menu>
    </AppBar>
  );
}

function StatusBar() {
  const { social, cases, role } = useAppState();
  const now = useNow();
  const running = social.archive.filter((j) => j.status === 'In Progress').length;
  const c = cases.find((x) => x.status !== 'Completed') ?? cases[0];
  const item = { display: 'inline-flex', alignItems: 'center', gap: 1, px: 1.5, height: '100%', fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' } as const;
  return (
    <Box component="footer" aria-label="Workspace status" sx={{ height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', bgcolor: 'tokens.chrome', borderTop: 1, borderColor: 'divider', overflow: 'hidden' }}>
      <Box sx={{ ...item, display: { xs: 'none', sm: 'inline-flex' } }}><StatusTag label="8 sources connected" tone="green" /></Box>
      <ButtonBase component={NavLink} to="/archive" sx={{ ...item, '&:hover': { bgcolor: 'tokens.surface2' } }}>
        {running ? <StatusTag label={`${running} crawl${running > 1 ? 's' : ''} running`} tone="amber" /> : 'No crawls running'}
      </ButtonBase>
      {c && (
        <ButtonBase component={NavLink} to="/hub" sx={{ ...item, display: { xs: 'none', md: 'inline-flex' }, '&:hover': { bgcolor: 'tokens.surface2' } }}>
          Active case <Box component="span" sx={{ fontFamily: (t) => t.palette.tokens.mono, color: 'tokens.link' }}>{c.id}</Box>
          <Box component="span" sx={{ color: 'text.primary', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</Box>
        </ButtonBase>
      )}
      <Box sx={{ flex: 1 }} />
      <Box sx={{ ...item, display: { xs: 'none', sm: 'inline-flex' } }}>Role: {role}</Box>
      <Box sx={{ ...item, fontFamily: (t) => t.palette.tokens.mono }} aria-label="Current time (UTC)">{new Date(now).toISOString().slice(11, 16)} UTC</Box>
    </Box>
  );
}
