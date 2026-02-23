import { create } from 'zustand'
import { MyProfileRes, userAPI, UserSummaryRes } from '@api/user.api';

interface UserDirectoryState {
	me: MyProfileRes | null,
	users: UserSummaryRes[],

	initialize: (me: MyProfileRes | null) => void;

	addUser: (user: UserSummaryRes) => void;
	removeUser: (id: number) => void;
}

export const useUserDirectoryStore = create<UserDirectoryState>((set) => ({

	me: null,
	users: [],

	initialize: async (me) => {
		const response = await userAPI.getAll();
		const users: UserSummaryRes[] = response.data.users;

		set({me, users});
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
	}
}));