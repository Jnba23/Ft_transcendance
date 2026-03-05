import { create } from 'zustand';
import { friendsApi } from '@api/friends.api';
import { FriendRequestWithUser } from 'types/friendRequest';
import { useErrorStore } from './error.store';

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
  reset: () => void;
}

export const useFriendRequestsStore = create<FriendRequestsState>(
  (set, get) => ({
    sent: [],
    received: [],

    initialize: async () => {
      const errorStore = useErrorStore.getState();

      if (!localStorage.getItem('has_session')) {
        set({ received: [], sent: [] });
        return;
      }
      try {
        const [receivedRes, sentRes] = await Promise.all([
          friendsApi.getFriendRequests('received'),
          friendsApi.getFriendRequests('sent'),
        ]);
        const received = receivedRes.data.requests;
        const sent = sentRes.data.requests;

        set({ received, sent });
      } catch {
        errorStore.showError('Failed to fetch friend requests');
      }
    },

    reset: () => {
      set({ received: [], sent: [] });
    },

    sendRequest: async (other_id: number) => {
      const errorStore = useErrorStore.getState();

      try {
        await friendsApi.createFriendRequest({ other_id });
      } catch {
        errorStore.showError('Failed to send friend request');
      }
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
