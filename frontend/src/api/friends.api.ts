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

export const friendsaApi = {
	createFriendRequest: async (data: CreateFriendRequestReq) => {
		const response = await client.post<CreateFriendRequestRes>('/friends/requests', data);
		return response.data;
	},
}