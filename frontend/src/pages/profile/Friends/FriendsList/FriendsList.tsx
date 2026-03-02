import { FriendRequestWithUser } from "types/friendRequest";
import FriendsListItem from "./FriendsListItem";
import NoFriends from "./NoFriends";
import NoMatchedUser from "@components/ui/NoMatchedUser";

type FriendsListProps = {
	friends: FriendRequestWithUser[],
	isSearching: boolean
}

function FriendsList({ friends, isSearching } : FriendsListProps) {

	if (!friends.length && isSearching) return <NoMatchedUser />

	if (!friends.length) return <NoFriends />

	return (
		<div className="p-2 overflow-y-auto custom-scrollbar max-h-96"> {/* list container */}
			<div className="flex flex-col gap-1"> {/* friends list */}
				{
					friends.map(friendship => {
						return <FriendsListItem key={friendship.id} friendship={friendship} />
					})
				}
			</div>
		</div>
	);
}

export default FriendsList;