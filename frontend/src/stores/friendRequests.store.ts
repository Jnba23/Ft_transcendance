import { create } from "zustand";
import axios from "axios";
import { friendsaApi } from "@api/friends.api";
import { FriendRequestWithUser } from "types/friendRequest";

interface FriendRequestsState {
	sent: FriendRequestWithUser[];
	received: FriendRequestWithUser[];

	initialize: () => Promise<void>;

	sendRequest: (other_id: number) => void;
	addReceived: (request: FriendRequestWithUser) => void;
	removeReceived: (id: number) => void;
	removeSent: (id: number) => void;
}

export const useFriendRequestsStore = create<FriendRequestsState>((set) => ({
	sent: [],
	received: [],

	initialize: async () => {
		const response = await friendsaApi.getFriendRequests('received');
		const received = response.data.requests;

		set({ received });
	},

	sendRequest: async (other_id: number) => {
		const response = await friendsaApi.createFriendRequest({other_id});
		// time-left && display 'couldn't send friend request'
	},

	addReceived: (request) => {
		set((state) => ({
			received: [request, ...state.received],
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
	}
}));