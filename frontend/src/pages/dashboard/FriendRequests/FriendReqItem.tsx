import UserBadge from "@ui/UserBadge";
import friend from "@assets/friend.jpg";
import RequestActions from "@ui/RequestActions";

type FriendReqItemProps = {
	reqType: "received" | "sent";
};

function FriendReqItem({ reqType }: FriendReqItemProps) {
	return (
		<div className="flex items-center justify-between">
			<UserBadge
			username="PlayerX"
			avatar={friend}
			section="friendRequest"
			/>
			{
				reqType === "received" ?
				<RequestActions section="friendRequest" />
				:
				<CancelReqButton />
			}
		</div>
	);
}

function CancelReqButton() {
	return (
		<button className={[
			"px-3 py-1.5 text-xs font-medium text-white/90 rounded-lg",
			"bg-[#2A3B5A] hover:bg-[#3A4C6A] transition-colors",
		].join(' ')}>
			Cancel Request
		</button>
	)
}
export default FriendReqItem;