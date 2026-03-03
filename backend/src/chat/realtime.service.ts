import { User } from '../auth/types.js';
import { getIO } from '../core/sockets/socketServer.js';
import { MessageRow } from './types.js';

type EmitNewConversationProps = {
  conversationId: number | bigint;
  creator: Partial<User>;
  otherUser: Partial<User>;
};

type EmitNewMessageProps = {
  senderId: number;
  receiverId: number;
  message: MessageRow;
};

export const emitNewConversation = ({
  conversationId,
  creator,
  otherUser,
}: EmitNewConversationProps) => {
  const io = getIO();
  const chatNs = io.of('/chat');

  chatNs.to(`user_${creator.id}`).emit('newConversation', {
    conversation_id: conversationId,
    user: otherUser,
  });

  if (creator.id === otherUser.id) return;

  chatNs.to(`user_${otherUser.id}`).emit('newConversation', {
    conversation_id: conversationId,
    user: creator,
  });
};

export const emitNewMessage = ({
  senderId,
  receiverId,
  message,
}: EmitNewMessageProps) => {
  const io = getIO();
  const chatNs = io.of('/chat');
  const payload = {
    conversation_id: message.conversation_id,
    message: {
      id: message.id,
      sender_id: message.sender_id,
      content: message.content,
      sent_at: message.sent_at,
    },
  };

  chatNs.to(`user_${receiverId}`).emit('newMessage', payload);
  if (receiverId === senderId) return;
  chatNs.to(`user_${senderId}`).emit('newMessage', payload);
};
