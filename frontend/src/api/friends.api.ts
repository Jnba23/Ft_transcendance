import { FriendRequestWithUser } from "types/friendRequest";
import { client } from "./client";

interface CreateFriendRequestReq {
	other_id: number
}

interface CreateFriendRequestRes {
	status: string,
	data: {
		request_id: number
	}
}

interface GetFriendRequestsRes {
	status: string,
	results: number,
	data: {
		requests: FriendRequestWithUser[]
	}
}

export const friendsaApi = {
	createFriendRequest: async (data: CreateFriendRequestReq) => {
		const response = await client.post<CreateFriendRequestRes>('/friends/requests', data);
		return response.data;
	},

	getFriendRequests: async (type: 'sent' | 'received') => {
		const response = await client.get<GetFriendRequestsRes>(`/friends/requests?type=${type}`);
		return response.data;
	},
}