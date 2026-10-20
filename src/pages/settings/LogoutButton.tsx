import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth, useLeaveForHome } from '@/features/auth';
import { Button } from '@/shared/ui/Button';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

// Logging out, after a quick "are you sure"
export function LogoutButton() {
  const { logout } = useAuth();
  const leaveForHome = useLeaveForHome();
  const [asking, setAsking] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // If the request fails the reader stays signed in, and the landing header shows it
  const onLogout = async () => {
    setLeaving(true);
    await leaveForHome(() => logout().catch(() => {}));
  };

  return (
    <>
      <Button variant='pill' onClick={() => setAsking(true)}>
        <LogOut size={14} />
        Log out
      </Button>
      <ConfirmDialog
        open={asking}
        title='Log out?'
        confirmLabel='Log out'
        tone='default'
        onConfirm={onLogout}
        onCancel={() => setAsking(false)}
        busy={leaving}
      >
        Your library stays just as it is. Log back in any time to pick up where
        you left off.
      </ConfirmDialog>
    </>
  );
}
