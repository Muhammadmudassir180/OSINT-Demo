import { Navigate, Link as RouterLink, useParams } from 'react-router-dom';
import { Box, Button, ButtonBase, Link, Stack, Typography } from '@mui/material';
import { Add, ChevronLeft, CreateNewFolderOutlined, FolderOutlined } from '@mui/icons-material';
import { CaseCard } from '../components/CaseCard';
import { EmptyState, Mono, PageHeader, Reveal } from '../components/ui';
import { useAppDispatch, useAppState } from '../state/AppContext';

const backLink = (to: string, label: string) => (
  <Link component={RouterLink} to={to} underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: 14 }}><ChevronLeft fontSize="small" /> {label}</Link>
);

export default function CaseArchive() {
  const { folderId } = useParams();
  return folderId ? <FolderView id={folderId} /> : <Folders />;
}

function Folders() {
  const { folders, cases } = useAppState();
  const dispatch = useAppDispatch();
  const newFolder = () => dispatch({ type: 'openModal', modal: { type: 'folder' } });
  return (
    <Stack spacing={3}>
      <PageHeader
        crumb={backLink('/hub', 'Intelligence Hub')}
        title="Case files"
        description="Closed and reference investigations, filed by country or theme."
        actions={<Button variant="contained" startIcon={<CreateNewFolderOutlined />} onClick={newFolder}>Create folder</Button>}
      />
      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {folders.map((f, i) => {
          const n = cases.filter((c) => c.folderId === f.id).length;
          return (
            <Reveal key={f.id} order={i} sx={{ height: '100%' }}>
              <ButtonBase component={RouterLink} to={`/hub/archive/${f.id}`} sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', textAlign: 'left', borderRadius: 1, border: 1, borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden', transition: 'border-color 110ms, transform 240ms', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' } }}>
                <Box component="img" src={f.image} alt={`${f.name} folder image`} sx={{ width: '100%', aspectRatio: '16 / 9', objectFit: 'cover', bgcolor: 'tokens.surface2', borderBottom: 1, borderColor: 'divider' }} />
                <Stack sx={{ p: 2, flex: 1 }}>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Mono sx={{ color: 'text.secondary', fontSize: 12 }}>{f.id}</Mono>
                    <Typography variant="caption" color="text.secondary">{f.country}</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mt: 1 }}>
                    <FolderOutlined fontSize="small" color="primary" />
                    <Typography variant="h3">{f.name}</Typography>
                  </Stack>
                  <Stack direction="row" sx={{ justifyContent: 'space-between', mt: 'auto', pt: 1.5, color: 'text.secondary' }}>
                    <Typography variant="caption">{n} {n === 1 ? 'case' : 'cases'}</Typography>
                    <Typography variant="caption">{f.updated}</Typography>
                  </Stack>
                </Stack>
              </ButtonBase>
            </Reveal>
          );
        })}
        <Reveal order={folders.length} sx={{ height: '100%' }}>
          <ButtonBase onClick={newFolder} sx={{ width: '100%', height: '100%', minHeight: 240, flexDirection: 'column', gap: 1, borderRadius: 1, border: '1px dashed', borderColor: 'divider', bgcolor: 'tokens.surface2', color: 'text.secondary', '&:hover': { borderColor: 'primary.main', color: 'text.primary' } }}>
            <CreateNewFolderOutlined fontSize="large" />
            <Typography variant="h3" color="text.primary">Create folder</Typography>
            <Typography variant="body2">Group archived cases together</Typography>
          </ButtonBase>
        </Reveal>
      </Box>
    </Stack>
  );
}

function FolderView({ id }: { id: string }) {
  const { folders, cases } = useAppState();
  const dispatch = useAppDispatch();
  const folder = folders.find((f) => f.id === id);
  if (!folder) return <Navigate to="/hub/archive" replace />;
  const newCase = () => dispatch({ type: 'openModal', modal: { type: 'case', prefill: '', folderId: id } });
  // Keep each case's index in the full list: the details dialog looks cases up by it.
  const filed = cases.map((c, i) => [c, i] as const).filter(([c]) => c.folderId === id);
  return (
    <Stack spacing={3}>
      <PageHeader
        crumb={backLink('/hub/archive', 'Case files')}
        title={<Stack component="span" direction="row" spacing={1.5} sx={{ alignItems: 'center' }}><Box component="img" src={folder.image} alt="" sx={{ width: 40, height: 28, objectFit: 'cover', borderRadius: 0.5, border: 1, borderColor: 'divider' }} /><span>{folder.name}</span></Stack>}
        description={`${filed.length} ${filed.length === 1 ? 'case' : 'cases'} filed${folder.country ? ` · ${folder.country}` : ''} · ${folder.updated}`}
        actions={<Button variant="contained" startIcon={<Add />} onClick={newCase}>New investigation</Button>}
      />
      {filed.length ? (
        <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
          {filed.map(([c, i], n) => (
            <Reveal key={c.id} order={n} sx={{ height: '100%' }}>
              <CaseCard c={c} index={i} />
            </Reveal>
          ))}
        </Box>
      ) : (
        <EmptyState icon={<FolderOutlined />} title="No cases in this folder yet" action={<Button startIcon={<Add />} onClick={newCase}>New investigation</Button>}>
          Open an investigation and choose this folder in the case brief.
        </EmptyState>
      )}
    </Stack>
  );
}
