import { useNavigate } from "react-router-dom";
import UserOptsItem from './UserOptsItem';
import { useFriendRequestsStore } from "@stores/friendRequests.store";

type UserOptionsProps = {
  isOpen: boolean;
  isFriend?: boolean;
  user_id: number
};

function UserOptions({ isOpen, isFriend, user_id }: UserOptionsProps) {
  const navigate = useNavigate();
  const toProfile = () => {
    navigate(`/profile/${user_id}`);
  }
  const sendRequest = useFriendRequestsStore((state) => state.sendRequest);
  const sendFriendRequest = () => {
    sendRequest(user_id);
  }

  return (
    <div style={isOpen ? undefined : { display: 'none' }}>
      <div
        className={[
          'px-2 pb-2 pt-1',
          'flex gap-1 flex-col',
          'border-t border-white/5',
        ].join(' ')}
      >
        <UserOptsItem icon="visibility" label="View Profile" onClick={toProfile}/>
        {!isFriend && (
          <UserOptsItem icon="person_add" label="Send Friend Request" onClick={sendFriendRequest}/>
        )}
      </div>
    </div>
  );
}

export default UserOptions;
