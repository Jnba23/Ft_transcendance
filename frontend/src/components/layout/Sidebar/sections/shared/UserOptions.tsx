import UserOptsItem from './UserOptsItem';

type UserOptionsProps = {
  isOpen: boolean;
  isFriend?: boolean;
};

function UserOptions({ isOpen, isFriend }: UserOptionsProps) {
  return (
    <div style={isOpen ? undefined : { display: 'none' }}>
      <div
        className={[
          'px-2 pb-2 mt-1 pt-1',
          'flex gap-1 flex-col',
          'border-t border-white/5',
        ].join(' ')}
      >
        <UserOptsItem icon="visibility" label="View Profile" />
        <UserOptsItem icon="block" label="Block User" />
        <UserOptsItem icon="sports_esports" label="Send Game Request" />
        {!isFriend && (
          <UserOptsItem icon="person_add" label="Send Friend Request" />
        )}
      </div>
    </div>
  );
}

export default UserOptions;
