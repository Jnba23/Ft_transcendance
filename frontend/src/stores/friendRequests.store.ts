// we can work with zustand to fetch the data of the user as well
import { create } from "zustand";
import { FriendRequest } from "types/friendRequest";
import { mockSentRequests } from "@utils/data";
import { mockReceivedRequests } from "@utils/data";
import axios from "axios";

interface FriendRequestsState {
	sent: FriendRequest[];
	received: FriendRequest[];

	initialize: () => Promise<void>;

	addReceived: (request: FriendRequest) => void;
	removeReceived: (id: number) => void;
	removeSent: (id: number) => void;
}

export const useFriendRequestsStore = create<FriendRequestsState>((set) => ({
	sent: mockSentRequests, //[]
	received: mockReceivedRequests, //[]

	initialize: async () => {
		const [sentRes, receivedRes] = await Promise.all([
			axios.get("/api/friend-requests?type=sent"),
			axios.get("/api/friend-requests?type=received"),
		]);

		const sent: FriendRequest[] = sentRes.data;
		const received: FriendRequest[] = receivedRes.data;

		set({ sent, received });
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