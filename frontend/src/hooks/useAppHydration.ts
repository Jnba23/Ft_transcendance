import { useEffect } from 'react';
import { useUserDirectoryStore } from '@stores/userDirectory.store';
import { useFriendRequestsStore } from '@stores/friendRequests.store';
import { useDirectMessagesStore } from '@stores/directMessages.store';
import { createChatSocket } from '@services/chat/socket';
import { useAuth } from '@context/AuthContext';
import {
  handleNewConversation,
  handleNewMessage,
} from '@realtime/chat/chat.handlers';
import { createFriendsSocket } from '@services/friends/socket';
import {
  handleNewFriendRequest,
  handleUpdateFriendRequest,
} from '@realtime/friends/friends.handlers';
import { useFriendsStore } from '@stores/Friends.store';
import { createUsersSocket } from '@services/users/socket';
import { handleUpdateOnlineStatus } from '@realtime/users/users.handlers';

function useAppHydration() {
  const { user: me } = useAuth();

  const intializeUserDirectory = useUserDirectoryStore(
    (state) => state.initialize
  );
  const initializeDirectMessages = useDirectMessagesStore(
    (state) => state.initialze
  );
  const initializeFriendRequests = useFriendRequestsStore(
    (state) => state.initialize
  );
  const initializeFriends = useFriendsStore((state) => state.initialize);

  useEffect(() => {
    if (!me) return;

    intializeUserDirectory(me);
    initializeDirectMessages();
    initializeFriendRequests();
    initializeFriends();
  }, [
    intializeUserDirectory,
    initializeFriendRequests,
    initializeDirectMessages,
    initializeFriends,
    me,
  ]);

  useEffect(() => {
    // prevent not logged user socket connection
    if (!me) return;

    const socket = createChatSocket();

    // register socket events
    socket.on('newConversation', handleNewConversation);
    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newConversation', handleNewConversation);
      socket.off('newMessage', handleNewMessage);
    };
  }, [me]);

  useEffect(() => {
    if (!me) return;

    const socket = createFriendsSocket();

    // register socket events
    socket.on('newFriendRequest', handleNewFriendRequest);
    socket.on('updateFriendRequest', handleUpdateFriendRequest);

    return () => {
      socket.off('newFriendRequest', handleNewFriendRequest);
      socket.off('updateFriendRequest', handleUpdateFriendRequest);
    };
  }, [me]);

  useEffect(() => {
    if (!me) return;

    const socket = createUsersSocket();

    // register socket events
    socket.on('updateOnlineStatus', handleUpdateOnlineStatus);

    return () => {
      socket.off('updateOnlineStatus', handleUpdateOnlineStatus);
    };
  }, [me]);
}

export default useAppHydration;
