import { Message } from 'types/message';
import { useChatStore } from '@stores/chat.store';
import { useDirectMessagesStore } from '@stores/directMessages.store';
import { chatApi } from '@api/chat.api';
import { UserSummaryRes } from '@api/user.api';
import { Conversation } from 'types/conversation';
import { useUserDirectoryStore } from '@stores/userDirectory.store';

interface NewConversationPayload {
  conversation_id: number;
  user: UserSummaryRes;
}

interface NewMessagePayload {
  conversation_id: number;
  message: Message;
}

export const handleNewConversation = (payload: NewConversationPayload) => {
  const dmStore = useDirectMessagesStore.getState();
  const chatstore = useChatStore.getState();

  const isConvoOpen =
    chatstore.isOpen && payload.user.id === chatstore.user?.id;
  const newConvo: Conversation = {
    id: payload.conversation_id,
    user: payload.user,
    unread_count: 0,
  };

  dmStore.addConversation(newConvo);

  if (isConvoOpen) {
    chatstore.setConversationId(newConvo.id);
  }
};

export const handleNewMessage = async (payload: NewMessagePayload) => {
  const chatStore = useChatStore.getState();
  const dmStore = useDirectMessagesStore.getState();
  const me = useUserDirectoryStore.getState().me;

  const isSentByMe = payload.message.sender_id === me?.id;
  const isConvoOpen =
    chatStore.isOpen && payload.conversation_id === chatStore.conversation_id;

  if (isConvoOpen) {
    chatStore.appendMessage(payload.message);

    if (!isSentByMe)
      await chatApi.markConversationRead(payload.conversation_id);
  } else if (!isSentByMe) {
    // convo closed
    dmStore.incrementUnread(payload.conversation_id);
  }
};
