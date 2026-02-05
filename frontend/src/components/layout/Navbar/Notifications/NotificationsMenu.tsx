import { useRef } from 'react';
import NotificationOptions from '@ui/RequestActions';
import NotificationsItem from './NotificationsItem';
import useClickOutside from '@hooks/useClickOutside';
import getTransitionClasses from '@utils/transitionStyles';
import type { headerMenuProps } from '@utils/types';
import RequestActions from '@ui/RequestActions';

function NotificationsMenu({ isOpen, hide, buttonRef }: headerMenuProps) {
  const notifsMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(isOpen, hide, [buttonRef, notifsMenuRef]);

  return (
    <div
      className={[
        `${getTransitionClasses(isOpen, 'navbar')}`,
        'absolute bg-[#1F2C4A]',
        'rounded-lg border mt-2',
        'border-white/10 right-0',
        'w-96 shadow-lg',
        'transition-all',
      ].join(' ')}
      ref={notifsMenuRef}
    >
      {' '}
      {/* top-full by default */}
      <div className="p-4 border-b border-white/10">
        <h3 className="text-white font-semibold">Notifications</h3>
      </div>
      <div className="p-2 max-h-96 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col gap-1">
          <NotificationsItem
            icon="person_add"
            iconColor="blue"
            label={
              <p className="text-white text-sm">
                You have a new friend request from
                <span className="font-bold">{' ProGamer'}</span>.
              </p>
            }
            actions={<RequestActions section="notification" />}
          />
          <NotificationsItem
            icon="leaderboard"
            iconColor="red"
            label={
              <p className="text-white text-sm">
                You have achieved
                <span className="font-bold">{' Level 22'}</span>.
              </p>
            }
          />
          <NotificationsItem
            icon="leaderboard"
            iconColor="red"
            label={
              <p className="text-white text-sm">
                You have achieved
                <span className="font-bold">{' Level 22'}</span>.
              </p>
            }
          />
          <NotificationsItem
            icon="leaderboard"
            iconColor="red"
            label={
              <p className="text-white text-sm">
                You have achieved
                <span className="font-bold">{' Level 22'}</span>.
              </p>
            }
          />
          <NotificationsItem
            icon="leaderboard"
            iconColor="red"
            label={
              <p className="text-white text-sm">
                You have achieved
                <span className="font-bold">{' Level 22'}</span>.
              </p>
            }
          />{' '}
          <NotificationsItem
            icon="leaderboard"
            iconColor="red"
            label={
              <p className="text-white text-sm">
                You have achieved
                <span className="font-bold">{' Level 22'}</span>.
              </p>
            }
          />{' '}
          <NotificationsItem
            icon="leaderboard"
            iconColor="red"
            label={
              <p className="text-white text-sm">
                You have achieved
                <span className="font-bold">{' Level 22'}</span>.
              </p>
            }
          />{' '}
          <NotificationsItem
            icon="leaderboard"
            iconColor="red"
            label={
              <p className="text-white text-sm">
                You have achieved
                <span className="font-bold">{' Level 22'}</span>.
              </p>
            }
          />{' '}
          <NotificationsItem
            icon="leaderboard"
            iconColor="red"
            label={
              <p className="text-white text-sm">
                You have achieved
                <span className="font-bold">{' Level 22'}</span>.
              </p>
            }
          />{' '}
          {/* added many for scrollbar */}
        </div>
      </div>
      <div className="p-2 border-t border-white/10">
        <button
          className={[
            'text-white/80 text-sm',
            'w-full px-3 py-1.5',
            'rounded-md',
            'hover:bg-white/5',
            'transition-[background-color]',
          ].join(' ')}
        >
          Mark all as read
        </button>
      </div>
    </div>
  );
}

export default NotificationsMenu;
