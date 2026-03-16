import { friendsApi } from '@api/friends.api';
import { FriendRequestWithUser } from 'types/friendRequest';
import { create } from 'zustand';
import { useErrorStore } from './error.store';

interface FriendsStoreState {
  isLoading: boolean;
  isOpen: boolean;
  isConfirmOpen: boolean;
  toggle: () => void;
  hide: () => void;
  openConfirmation: () => void;
  hideConfirmation: () => void;

  friends: FriendRequestWithUser[];
  total: number;
  initialize: () => void;
  addFriend: (friend: FriendRequestWithUser) => void;
  removeFriend: (id: number) => void;
  includes: (userId: number) => FriendRequestWithUser | undefined;

  awaitingConfirmId: number | null;
  awaitingConfirmName: string | null;
  setAwaitingConfirm: (id: number, name: string) => void;
  reset: () => void;
}

export const useFriendsStore = create<FriendsStoreState>((set, get) => ({
  isLoading: true,
  isOpen: false,
  isConfirmOpen: false,
  toggle: () => {
    set((state) => ({
      isOpen: !state.isOpen,
    }));
  },
  hide: () => {
    set({ isOpen: false });
  },

  openConfirmation: () => {
    set({ isConfirmOpen: true });
  },

  hideConfirmation: () => {
    set({ isConfirmOpen: false });
  },

  friends: [],
  total: 0,

  initialize: async () => {
    const errorStore = useErrorStore.getState();

    if (!localStorage.getItem('has_session')) {
      set({ friends: [], total: 0, isLoading: false });
      return;
    }

    try {
      const response = await friendsApi.getFriends();
      const friends = response.data.friends;
      const total = response.results;

      set({ friends, total, isLoading: false });
    } catch {
      errorStore.showError('Failed to fetch friends');
    } finally {
      set({ isLoading: false });
    }
  },

  addFriend: (friend) => {
    set((state) => ({
      friends: [...state.friends, friend],
      total: state.total + 1,
    }));
  },

  removeFriend: (id) => {
    set((state) => ({
      friends: state.friends.filter((friend) => friend.id != id),
    }));

    set((state) => ({
      total: state.friends.length,
    }));
  },

  includes: (userId) => {
    const result = get().friends.find((friend) => {
      return [friend.user_id_1, friend.user_id_2].includes(userId);
    });

    return result;
  },

  awaitingConfirmId: null,
  awaitingConfirmName: null,

  setAwaitingConfirm: (id, username) => {
    set({
      awaitingConfirmId: id,
      awaitingConfirmName: username,
    });
  },

  reset: () => {
    set({ friends: [], total: 0, isLoading: false });
  },
}));
