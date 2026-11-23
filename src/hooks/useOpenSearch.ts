import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../state/AppContext';

/** Runs a Name Search for a term and opens Entity Search, from anywhere in the app. */
export function useOpenNameSearch() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  return useCallback(
    (term: string) => {
      dispatch({ type: 'nameSearch', term });
      navigate('/entity');
    },
    [dispatch, navigate],
  );
}
