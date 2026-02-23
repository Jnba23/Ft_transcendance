import { create } from "zustand";
import axios from "axios";
import { FriendRequest } from "types/friendRequest";
import { friendsaApi } from "@api/friends.api";

interface FriendRequestsState {
	sent: FriendRequest[];
	received: FriendRequest[];

	initialize: () => Promise<void>;

	sendRequest: (other_id: number) => void;
	addReceived: (request: FriendRequest) => void;
	removeReceived: (id: number) => void;
	removeSent: (id: number) => void;
}

export const useFriendRequestsStore = create<FriendRequestsState>((set) => ({
	sent: [],
	received: [],

	initialize: async () => {
		const [sentRes, receivedRes] = await Promise.all([
			axios.get("/api/friend-requests?type=sent"),
			axios.get("/api/friend-requests?type=received"),
		]);

		const sent: FriendRequest[] = sentRes.data;
		const received: FriendRequest[] = receivedRes.data;

		set({ sent, received });
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