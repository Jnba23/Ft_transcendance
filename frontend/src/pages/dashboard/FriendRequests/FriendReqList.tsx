import FriendReqItem from "./FriendReqItem";
import { useFriendRequestsStore } from "@stores/friendRequests.store";

type FriendReqListProps = {
	reqType: "received" | "sent";
};

function FriendReqList({ reqType }: FriendReqListProps) {
	const requests = useFriendRequestsStore((state) => state[reqType]);
	const removeReceived = useFriendRequestsStore((state) => state.removeReceived);
	const removeSent = useFriendRequestsStore((state) => state.removeSent);

	return (
		<div className="h-48 overflow-y-auto custom-scrollbar">
			<div className="flex flex-col gap-3">
				{
					requests.map(req => {
						return (
							<FriendReqItem 
								key={req.id}
								reqId={req.id}
								reqType={reqType}
								removeReq={
									reqType === "received" ?
									() => removeReceived(req.id) :
									() => removeSent(req.id)
								}
							/>
						)
					})
				}
			</div>
		</div>
	); 
}

export default FriendReqList;