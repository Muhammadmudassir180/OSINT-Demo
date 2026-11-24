import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import Dialogs from './dialogs/Dialogs';
import Toast from './components/Toast';
import Login from './pages/Login';
import { useAppState } from './state/AppContext';

// Each page is its own chunk, loaded the first time it is opened.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const EntitySearch = lazy(() => import('./pages/EntitySearch'));
const Archive = lazy(() => import('./pages/Archive'));
const ArchivePlatform = lazy(() => import('./pages/ArchivePlatform'));
const Hub = lazy(() => import('./pages/Hub'));
const CaseArchive = lazy(() => import('./pages/CaseArchive'));
const Explorer = lazy(() => import('./pages/Explorer'));
const Bulk = lazy(() => import('./pages/Bulk'));
const Users = lazy(() => import('./pages/Users'));
const Audit = lazy(() => import('./pages/Audit'));
const Settings = lazy(() => import('./pages/Settings'));

export default function App() {
  const { logged } = useAppState();
  return (
    <>
      {logged ? (
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Dashboard />} />
            <Route path="entity" element={<EntitySearch />} />
            <Route path="archive" element={<Archive />} />
            <Route path="archive/:platform" element={<ArchivePlatform />} />
            <Route path="hub" element={<Hub />} />
            <Route path="hub/archive" element={<CaseArchive />} />
            <Route path="hub/archive/:folderId" element={<CaseArchive />} />
            <Route path="explorer" element={<Explorer />} />
            <Route path="bulk" element={<Bulk />} />
            <Route path="users" element={<Users />} />
            <Route path="audit" element={<Audit />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      ) : (
        <Login />
      )}
      <Dialogs />
      <Toast />
    </>
  );
}
