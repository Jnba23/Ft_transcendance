import { create } from 'zustand';
import { friendsApi } from '@api/friends.api';
import { FriendRequestWithUser } from 'types/friendRequest';

interface FriendRequestsState {
  sent: FriendRequestWithUser[];
  received: FriendRequestWithUser[];

  initialize: () => Promise<void>;

  sendRequest: (other_id: number) => void;
  addReceived: (request: FriendRequestWithUser) => void;
  addSent: (Request: FriendRequestWithUser) => void;
  removeReceived: (id: number) => void;
  removeSent: (id: number) => void;
  getRequest: (
    id: number,
    reqType: 'sent' | 'received'
  ) => FriendRequestWithUser | undefined;
}

export const useFriendRequestsStore = create<FriendRequestsState>(
  (set, get) => ({
    sent: [],
    received: [],

    initialize: async () => {
      const [receivedRes, sentRes] = await Promise.all([
        friendsApi.getFriendRequests('received'),
        friendsApi.getFriendRequests('sent'),
      ]);
      const received = receivedRes.data.requests;
      const sent = sentRes.data.requests;

      set({ received, sent });
    },

    sendRequest: async (other_id: number) => {
      await friendsApi.createFriendRequest({ other_id });
      // time-left && display 'couldn't send friend request'
    },

    addReceived: (request) => {
      set((state) => ({
        received: [request, ...state.received],
      }));
    },

    addSent: (request) => {
      set((state) => ({
        sent: [request, ...state.sent],
      }));
    },

    removeReceived: (id) => {
      set((state) => ({
        received: state.received.filter((req) => req.id !== id),
      }));
    },

    removeSent: (id) => {
      set((state) => ({
        sent: state.sent.filter((req) => req.id !== id),
      }));
    },

    getRequest: (id, reqType) => {
      let request;

      if (reqType === 'sent') {
        request = get().sent.find((req) => req.id === id);
      } else {
        request = get().received.find((req) => req.id === id);
      }

      return request;
    },
  })
);
