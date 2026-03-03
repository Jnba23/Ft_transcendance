import { getIO } from '../../core/sockets/socketServer.js';
import { FriendAction, FriendRequestWithUser, Friendship } from './types.js';

type EmitNewFriendRequestProps = {
  requestWithCreator: FriendRequestWithUser;
  requestWithOther: FriendRequestWithUser;
};

type EmitHandleFriendRequest = {
  request: Friendship;
  userId: number;
  isSender: boolean;
  action: FriendAction;
};

export const emitNewFriendRequest = ({
  requestWithCreator,
  requestWithOther,
}: EmitNewFriendRequestProps) => {
  const io = getIO();
  const friendsNs = io.of('/friends');

  friendsNs
    .to(`user_${requestWithCreator.user_id_1}`)
    .emit('newFriendRequest', {
      requestWithUser: requestWithOther,
    });

  friendsNs.to(`user_${requestWithOther.user_id_2}`).emit('newFriendRequest', {
    requestWithUser: requestWithCreator,
  });
};

export const emitUpdateFriendRequest = ({
  request,
  userId,
  isSender,
  action,
}: EmitHandleFriendRequest) => {
  const io = getIO();
  const friendsNs = io.of('/friends');

  const otherId =
    userId === request.user_id_1 ? request.user_id_2 : request.user_id_1;

  friendsNs.to(`user_${userId}`).emit('updateFriendRequest', {
    requestId: request.id,
    otherId,
    reqType: `${isSender ? 'sent' : 'received'}`,
    isActionAccept: action === 'accept',
  });

  friendsNs.to(`user_${otherId}`).emit('updateFriendRequest', {
    requestId: request.id,
    otherId: userId,
    reqType: `${isSender ? 'received' : 'sent'}`,
    isActionAccept: action === 'accept',
  });
};
