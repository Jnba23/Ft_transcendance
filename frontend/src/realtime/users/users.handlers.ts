import { useChatStore } from "@stores/chat.store";
import { useDirectMessagesStore } from "@stores/directMessages.store";
import { useUserDirectoryStore } from "@stores/userDirectory.store"

interface UpdateOnlineStatusPayload {
	userId: number,
	status: 'online' | 'offline'
}

export const handleUpdateOnlineStatus = (payload: UpdateOnlineStatusPayload) => {
	const userDirStore = useUserDirectoryStore.getState();
	const dmStore = useDirectMessagesStore.getState();
	const chatStore = useChatStore.getState();

	userDirStore.updateUserStatus(payload.userId, payload.status);
	dmStore.updateUserStatus(payload.userId, payload.status);
	chatStore.updateUserStatus(payload.userId, payload.status);
}