import FriendReqItem from './FriendReqItem';
import { useFriendRequestsStore } from '@stores/friendRequests.store';
import NoRequests from './NoRequests';

type FriendReqListProps = {
  reqType: 'received' | 'sent';
};

function FriendReqList({ reqType }: FriendReqListProps) {
  const requests = useFriendRequestsStore((state) => state[reqType]);

  if (!requests.length) {
    return <NoRequests reqType={reqType} key={reqType}/>
  }

  return (
    <div className="h-48 overflow-y-auto custom-scrollbar">
      <div className="flex flex-col gap-3">
        {requests.map((req) => {
          return (
            <FriendReqItem
              key={req.id}
              request={req}
              reqType={reqType}
            />
          );
        })}
      </div>
    </div>
  );
}

export default FriendReqList;
