import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react';
import { loadArchive, saveArchive, isOverdue } from '../lib/osint';
import { useNow } from './clock';
import { initialState, reducer, type Action, type AppState } from './reducer';

const StateCtx = createContext<AppState | null>(null);
const DispatchCtx = createContext<Dispatch<Action> | null>(null);

export function AppProvider({ children, seed }: { children: ReactNode; seed?: AppState }) {
  const [state, dispatch] = useReducer(reducer, seed, (s) => s ?? initialState(loadArchive(typeof localStorage === 'undefined' ? undefined : localStorage, Date.now())));

  useEffect(() => saveArchive(state.social.archive), [state.social.archive]);

  return (
    <DispatchCtx.Provider value={dispatch}>
      <StateCtx.Provider value={state}>
        <ArchiveSync />
        {children}
      </StateCtx.Provider>
    </DispatchCtx.Provider>
  );
}

/** Marks crawls Completed once their simulated duration has passed. */
function ArchiveSync() {
  const now = useNow();
  const dispatch = useAppDispatch();
  const archive = useAppState().social.archive;
  const overdue = useMemo(() => archive.some((j) => isOverdue(j, now)), [archive, now]);
  useEffect(() => {
    if (overdue) dispatch({ type: 'completeOverdue', now });
  }, [overdue, now, dispatch]);
  return null;
}

export function useAppState() {
  const s = useContext(StateCtx);
  if (!s) throw new Error('useAppState must be used inside AppProvider');
  return s;
}

/** Dispatch lives in its own context so components that only send actions never re-render on state changes. */
export function useAppDispatch() {
  const d = useContext(DispatchCtx);
  if (!d) throw new Error('useAppDispatch must be used inside AppProvider');
  return d;
}
