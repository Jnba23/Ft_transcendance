import { friendsApi } from '@api/friends.api';
import useClickOutside from '@hooks/useClickOutside';
import { useFriendsStore } from '@stores/Friends.store';
import getTransitionClasses from '@utils/transitionStyles';
import { useRef } from 'react';

function ConfirmationModal() {
  const modalRef = useRef(null);
  const isOpen = useFriendsStore((state) => state.isConfirmOpen);
  const hide = useFriendsStore((state) => state.hideConfirmation);
  const { awaitingConfirmId, awaitingConfirmName } = useFriendsStore(
    (state) => state
  );
  const handleConfirm = () => {
    if (awaitingConfirmId) {
      friendsApi.updateFriendRequestStatus({
        request_id: awaitingConfirmId,
        action: 'remove',
      });
    }

    hide();
  };

  const username = awaitingConfirmName;

  useClickOutside(isOpen, hide, [modalRef]);

  return (
    <>
      <div
        className={[
          `${getTransitionClasses(isOpen, 'overlay')}`,
          'transition-opacity',
          'fixed inset-0 bg-black/50 z-[40]',
        ].join(' ')}
      ></div>

      <div
        className={[
          `${getTransitionClasses(isOpen, 'confirmationModal')}`,
          'bg-[#1F2C4A] border border-white/10 rounded-lg',
          'shadow-2xl w-full max-w-sm p-6 text-center',
          'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          'z-[50]',
        ].join(' ')}
        ref={modalRef}
      >
        <h3 className="text-xl text-white font-bold mb-2">Unfriend?</h3>
        <p className="text-white/70 text-sm mb-6">
          Are you sure you want to unfriend
          <span className="font-semibold text-white">{` ${username} `}</span>?
        </p>
        <div className="flex gap-3 items-center justify-center">
          <button
            className={[
              'flex-1 text-white px-4 py-2 text-sm font-semibold',
              'bg-white/10 rounded-lg hover:bg-white/20 transition-colors',
            ].join(' ')}
            onClick={hide}
          >
            Cancel
          </button>
          <button
            className={[
              'flex-1 text-white px-4 py-2 text-sm font-semibold',
              'bg-loss/80 rounded-lg hover:bg-loss transition-colors',
            ].join(' ')}
            onClick={handleConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </>
  );
}

export default ConfirmationModal;
