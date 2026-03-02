import { create } from 'zustand'
import { MyProfileRes, userAPI, UserSummaryRes } from '@api/user.api';

interface UserDirectoryState {
	me: MyProfileRes | null,
	users: UserSummaryRes[],
	isLoading: boolean,

	initialize: (me: MyProfileRes | null) => void;

	addUser: (user: UserSummaryRes) => void;
	removeUser: (id: number) => void,
	setHasFriendRequest: (id: number, hasFriendReq: number) => void,
	hasFriendRequest: (id: number) => boolean,
	updateUserStatus: (id: number, status: 'online' | 'offline') => void,
}

export const useUserDirectoryStore = create<UserDirectoryState>((set, get) => ({

	me: null,
	users: [],
	isLoading: true,

	initialize: async (me) => {
		const response = await userAPI.getAll();
		const users: UserSummaryRes[] = response.data.users;

		set({me, users, isLoading: false});
	},

	addUser: (user) => {
		set((state) => ({
			users: [user, ...state.users]
		}));
	},

	removeUser: (id) => {
		set((state) => ({
			users: state.users.filter(user => user.id !== id)
		}));
	},

	setHasFriendRequest: (id, hasFriendReq) => {
		set((state) => ({
			users: state.users.map(user => {
				if (user.id === id) {
					user.hasFriendRequest = hasFriendReq
				}

				return user;
			})
		}));
	},

	hasFriendRequest: (id: number) => {
		const user = get().users.find(user => user.id === id);

		return !!user?.hasFriendRequest;
	},

	updateUserStatus: (id, status) => {
		set((state) => ({
			users: state.users.map(user => {
				if (user.id === id) {
					user.status = status
				}

				return user;
			})
		}));
	}
}));