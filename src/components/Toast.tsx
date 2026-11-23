import { Alert, Snackbar } from '@mui/material';
import { useAppDispatch, useAppState } from '../state/AppContext';

export default function Toast() {
  const { toast } = useAppState();
  const dispatch = useAppDispatch();
  const close = () => dispatch({ type: 'clearToast' });
  return (
    <Snackbar key={toast?.id} open={!!toast} autoHideDuration={3800} onClose={(_, reason) => reason !== 'clickaway' && close()} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} sx={{ mb: 4 }}>
      <Alert onClose={close} severity="success" variant="filled" sx={{ minWidth: 300, bgcolor: 'tokens.surface3', color: 'text.primary', border: 1, borderColor: 'divider', '& .MuiAlert-icon': { color: 'success.main' } }}>
        {toast?.text}
      </Alert>
    </Snackbar>
  );
}
