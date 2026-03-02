import { useChatStore } from "@stores/chat.store";
import { useDirectMessagesStore } from "@stores/directMessages.store";
import { useFriendRequestsStore } from "@stores/friendRequests.store"
import { useFriendsStore } from "@stores/Friends.store";
import { useUserDirectoryStore } from "@stores/userDirectory.store";
import { FriendRequestWithUser } from "types/friendRequest"

interface NewFriendRequestPayload {
	requestWithUser: FriendRequestWithUser
}

interface UpdateFriendRequestPayload {
	requestId: number,
	otherId: number,
	reqType: 'received' | 'sent',
	isActionAccept: boolean
}

export const handleNewFriendRequest = (payload: NewFriendRequestPayload) => {
	const friendReqStore = useFriendRequestsStore.getState();
	const dmStore = useDirectMessagesStore.getState();
	const userDirStore = useUserDirectoryStore.getState();
	const chatSotore = useChatStore.getState();
	const me = userDirStore.me;

	const isCreaterByMe = payload.requestWithUser.user_id_1 === me?.id;

	// update friend request store
	if (isCreaterByMe) {
		friendReqStore.addSent(payload.requestWithUser);
	} else {
		friendReqStore.addReceived(payload.requestWithUser);
	}

	const other_id = isCreaterByMe ?
		payload.requestWithUser.user_id_2
		:
		payload.requestWithUser.user_id_1;

	// update dm/userDir/chat stores
	dmStore.setHasFriendRequest(other_id, 1);
	userDirStore.setHasFriendRequest(other_id, 1);
	chatSotore.setHasFriendRequest(other_id, 1);
}

export const handleUpdateFriendRequest = (payload: UpdateFriendRequestPayload) => {
	const friendReqStore = useFriendRequestsStore.getState();
	const dmStore = useDirectMessagesStore.getState();
	const userDirStore = useUserDirectoryStore.getState();
	const chatSotore = useChatStore.getState();
	const friendsStore = useFriendsStore.getState();

	// update dm/userDir/chat/friends stores
	if (!payload.isActionAccept) {
		dmStore.setHasFriendRequest(payload.otherId, 0);
		userDirStore.setHasFriendRequest(payload.otherId, 0);
		chatSotore.setHasFriendRequest(payload.otherId, 0);
		friendsStore.removeFriend(payload.requestId);
	} else {
		const request = friendReqStore.getRequest(payload.requestId, payload.reqType)

		if (request) friendsStore.addFriend(request);
	}

	// update friend request store
	if (payload.reqType === 'received') {
		friendReqStore.removeReceived(payload.requestId);
		return;
	}

	friendReqStore.removeSent(payload.requestId);
}