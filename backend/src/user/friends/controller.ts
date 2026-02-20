import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { AppError } from '../../utils/AppError.js';
import { friendService } from './service.js';
import { User } from '../../auth/types.js';
import { FriendAction } from './types.js';

export const createFriendRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const SenderId = (res.locals.user as User).id;
    const recipientId = parseInt(req.params.id);

    if (SenderId === recipientId) {
      return next(new AppError('Cannot send friend request to yourself', 400));
    }

    const existing = friendService.checkExisting(SenderId, recipientId);
    if (existing) {
      if (existing.status === 'accepted') {
        return next(new AppError('Already friends', 409));
      }
      return next(new AppError('Friend request already exists', 409));
    }

    const requestId = friendService.createRequest(SenderId, recipientId);

    res.status(201).json({
      status: 'success',
      data: { request_id: requestId },
    });
  }
);

// GET /api/friend-requests?type=sent|received
export const getFriendRequests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (res.locals.user as User).id;
    const type = req.query.type as string;

    if (!type || !['sent', 'received'].includes(type)) {
      return next(
        new AppError('Query param "type" must be "sent" or "received"', 400)
      );
    }

    const requests =
      type === 'sent'
        ? friendService.getSentRequests(userId)
        : friendService.getReceivedRequests(userId);

    res.json({
      status: 'success',
      results: requests.length,
      data: { requests },
    });
  }
);

export const handleFriendAction = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (res.locals.user as User).id;
    const { request_id, action } = req.body as {
      request_id: number;
      action: FriendAction;
    };

    const request = friendService.getRequestById(request_id);

    if (!request) {
      return next(new AppError('Friend request not found', 404));
    }

    const isSender = request.user_id_1 === userId;
    const isRecipient = request.user_id_2 === userId;

    if (!isRecipient && !isSender) {
      return next(new AppError('Not authorized to perfom this action', 403));
    }

    if (action === 'cancel' && !isSender) {
      return next(new AppError('Only sender can cancel a request', 403));
    }

    if ((action === 'accept' || action === 'decline') && !isRecipient) {
      return next(new AppError('Only recipient can accept or decline', 403));
    }

    if (action == 'accept') {
      friendService.acceptRequest(request_id);
      res.json({ status: 'success', message: 'Friend request accepted' });
    } else {
      // decline or cancel = delete the request
      friendService.deleteRequest(request_id);
      res.json({ status: 'success', message: `Friend request ${action}ed` });
    }
  }
);

export const checkFriendship = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (res.locals.user as User).id;
    const otherUserId = parseInt(req.params.id);

    const existing = friendService.checkExisting(userId, otherUserId);

    if (!existing) {
      return res.json({
        status: 'success',
        data: { relationship: 'none' },
      });
    }

    const isSender = existing.user_id_1 === userId;

    res.json({
      status: 'success',
      data: {
        request_id: existing.id,
        relationship: existing.status,
        direction: isSender ? 'sent' : 'received',
      },
    });
  }
);

export const removeFriendship = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (res.locals.user as User).id;
    const requestId = parseInt(req.params.id);

    const request = friendService.getRequestById(requestId);

    if (!request) {
      return next(new AppError('Friendship not found', 404));
    }

    // Verify user is part of this friendship
    if (request.user_id_1 !== userId && request.user_id_2 !== userId) {
      return next(new AppError('Not authorized', 403));
    }

    friendService.deleteRequest(requestId);

    res.status(204).send();
  }
);

export const getFriends = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (res.locals.user as User).id;
    const friends = friendService.getFriends(userId);

    res.json({
      status: 'success',
      results: friends.length,
      data: { friends },
    });
  }
);
