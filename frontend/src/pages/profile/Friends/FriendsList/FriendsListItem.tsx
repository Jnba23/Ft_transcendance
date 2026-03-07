import Avatar from '@components/ui/Avatar';
import { useFriendsStore } from '@stores/Friends.store';
import { FriendRequestWithUser } from 'types/friendRequest';

type FriendsListItemProps = {
  friendship: FriendRequestWithUser;
};

function FriendsListItem({ friendship }: FriendsListItemProps) {
  const { openConfirmation, setAwaitingConfirm } = useFriendsStore(
    (state) => state
  );
  const handleRemove = () => {
    setAwaitingConfirm(friendship.id, friendship.username);
    openConfirmation();
  };

  return (
    <div
      className={[
        'flex items-center justify-between',
        'hover:bg-white/5 rounded-lg p-2',
      ].join(' ')}
    >
      {' '}
      {/* friends list item */}
      <div className="flex gap-3 items-center">
        <Avatar userId={friendship.user_id} section="friends" />
        <h3 className="text-white font-medium text-sm">
          {friendship.username}
        </h3>
      </div>
      <button
        className={[
          'size-8.5 text-white/40 hover:text-loss hover:bg-loss/10',
          'rounded-md transition-colors flex items-center justify-center',
          'duration-180',
        ].join(' ')}
        onClick={handleRemove}
      >
        <span className="material-symbols-outlined !text-lg">
          person_remove
        </span>
      </button>
    </div>
  );
}

export default FriendsListItem;
