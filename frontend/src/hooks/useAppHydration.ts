import { useEffect } from 'react';
import { useUserDirectoryStore } from "@stores/userDirectory.store";
import { useFriendRequestsStore } from '@stores/friendRequests.store';
import { useDirectMessagesStore } from "@stores/directMessages.store"

function useAppHydration() {
	const intializeUserDirectory = useUserDirectoryStore(
		(state) => state.initialize
	);
	const initializeDirectMessages = useDirectMessagesStore(
		(state) => state.initialze
	);
	const initializeFriendRequests = useFriendRequestsStore(
    	(state) => state.initialize
  	);

	useEffect(() => {
		intializeUserDirectory();
		initializeDirectMessages();
		// initializeFriendRequests();
	}, [intializeUserDirectory, initializeFriendRequests]);
}

export default useAppHydration;