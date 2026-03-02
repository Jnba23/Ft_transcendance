import { FriendAction, FriendRequestWithUser } from "types/friendRequest";
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

interface UpdateFriendRequestStatusReq {
	request_id: number,
	action: FriendAction
}

interface UpdateFriendRequestStatusRes {
	status: string,
	message: string
}

interface GetFriendsRes {
	status: string,
	results: number,
	data: {
		friends: FriendRequestWithUser[]
	}
}

export const friendsApi = {
	createFriendRequest: async (data: CreateFriendRequestReq) => {
		const response = await client.post<CreateFriendRequestRes>('/friends/requests', data);
		return response.data;
	},

	getFriendRequests: async (type: 'sent' | 'received') => {
		const response = await client.get<GetFriendRequestsRes>(`/friends/requests?type=${type}`);
		return response.data;
	},

	updateFriendRequestStatus: async (data: UpdateFriendRequestStatusReq) => {
		const response = await client.post<UpdateFriendRequestStatusRes>('/friends/requests/action', data);
		return response.data;
	},

	getFriends: async () => {
		const response = await client.get<GetFriendsRes>('/friends');
		return response.data;
	}
}