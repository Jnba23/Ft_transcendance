import { useState } from 'react';
import FRSectionHeader from './FRSectionHeader';
import FriendReqList from './FriendReqList';

function FriendRequests() {
  const [reqType, setReqType] = useState<'received' | 'sent'>('received');

  return (
    <div className="flex flex-col gap-4">
      <FRSectionHeader setReqType={setReqType} />
      <FriendReqList reqType={reqType} />
    </div>
  );
}

export default FriendRequests;
