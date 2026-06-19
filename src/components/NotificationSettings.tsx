import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationSettings() {
  const { permission, token, enableNotifications, disableNotifications } =
    useNotifications();

  return (
    <div className="rounded-xl border p-4">
      <h3 className="font-semibold">Notifications</h3>

      <p className="mt-2 text-sm text-muted-foreground">
        Status: {permission}
      </p>

      {permission === 'default' && (
        <Button className="mt-4" onClick={enableNotifications}>
          Enable Notifications
        </Button>
      )}

      {permission === 'granted' && (
        <div className="mt-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            {token ? 'Subscribed to push notifications' : 'Loading token...'}
          </p>
          <Button variant="outline" onClick={disableNotifications}>
            Disable Notifications
          </Button>
        </div>
      )}

      {permission === 'denied' && (
        <p className="mt-2 text-sm text-red-600">
          Notifications blocked. Please enable them in your browser settings.
        </p>
      )}
    </div>
  );
}
