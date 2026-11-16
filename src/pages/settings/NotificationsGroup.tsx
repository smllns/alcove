import { FormError } from '@/shared/ui/FormError';
import { rowLinkClass } from './rowLink';
import { SettingRow } from './SettingRow';
import { SettingsGroup } from './SettingsGroup';
import { usePushSwitch, type PushState } from './usePushSwitch';

// What's said of notifications on this device, as they stand
const said: Record<PushState, string> = {
  checking: '…',
  'off-here': 'Not available yet',
  'home-screen': 'Add alcove to your Home Screen first',
  unsupported: 'This browser can’t show them',
  blocked: 'Blocked in your browser’s settings',
  off: 'Off',
  on: 'On',
};

// Notifications on this device: a heart on the reader's review, a new
// follower, a request to follow them, and alcove's news. On an iPhone
// they come only to alcove opened from the home screen, which is said
// here, with how.
export function NotificationsGroup({ delay }: { delay: number }) {
  const { state, busy, error, turn } = usePushSwitch();
  const switchable = state === 'on' || state === 'off';
  return (
    <SettingsGroup id='notifications' title='Notifications' delay={delay}>
      <SettingRow
        label='This device'
        value={said[state]}
        action={
          switchable && (
            <button
              type='button'
              disabled={busy}
              onClick={() => void turn(state === 'off')}
              className={rowLinkClass}
            >
              {state === 'on' ? 'Turn off' : 'Turn on'}
            </button>
          )
        }
      />
      <p className='border-t border-line/70 px-5 py-4 text-sm leading-relaxed text-muted sm:px-6'>
        {state === 'home-screen'
          ? 'In Safari, tap Share, then Add to Home Screen. Open alcove from there and turn notifications on here.'
          : 'A heart on your review, a new follower, a request to follow you, and news from alcove.'}
      </p>
      <FormError message={error} className='px-5 pb-4 sm:px-6' />
    </SettingsGroup>
  );
}
