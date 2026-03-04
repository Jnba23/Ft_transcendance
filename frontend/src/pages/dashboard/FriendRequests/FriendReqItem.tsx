import UserBadge from '@ui/UserBadge';
import friend from '@assets/friend.jpg';
import RequestActions from '@ui/RequestActions';
import { FriendRequestWithUser } from 'types/friendRequest';
import { friendsApi } from '@api/friends.api';

type FriendReqItemProps = {
  request: FriendRequestWithUser;
  reqType: 'received' | 'sent';
};

function FriendReqItem({ request, reqType }: FriendReqItemProps) {
  const onAccept = () => {
    friendsApi.updateFriendRequestStatus({
      request_id: request.id,
      action: 'accept',
    });
  };
  const onDecline = () => {
    friendsApi.updateFriendRequestStatus({
      request_id: request.id,
      action: 'decline',
    });
  };
  const onCancel = () => {
    friendsApi.updateFriendRequestStatus({
      request_id: request.id,
      action: 'cancel',
    });
  };

  return (
    <div className={[
      "flex items-center gap-4 md:justify-between",
      "flex-col md:flex-row p-4 md:p-0 bg-[#16213E] rounded-lg",
      "md:bg-transparent border border-white/10 shadow-lg",
      "md:border-0 shadow-none"
    ].join(' ')}>
      <UserBadge
        username={request.username}
        avatar={friend}
        section="friendRequest"
        toCols={true}
      />
      {reqType === 'received' ? (
        <RequestActions
          section="friendRequest"
          onAccept={onAccept}
          onDecline={onDecline}
        />
      ) : (
        <CancelReqButton onCancel={onCancel} />
      )}
    </div>
  );
}

function CancelReqButton({ onCancel }: { onCancel: () => void }) {
  return (
    <button
      className={[
        'px-3 py-1.5 text-xs font-medium text-white/90 rounded-lg',
        'bg-[#2A3B5A] hover:bg-[#3A4C6A] transition-colors',
      ].join(' ')}
      onClick={onCancel}
    >
      Cancel Request
    </button>
  );
}
export default FriendReqItem;
