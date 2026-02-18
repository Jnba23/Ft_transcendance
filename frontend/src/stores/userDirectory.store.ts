import { create } from 'zustand'
import { User } from 'types/user'
import { userAPI, UserSummaryRes } from '@api/user.api';

interface UserDirectoryState {
	users: User[],

	initialize: () => void;

	addUser: (user: User) => void;
	removeUser: (id: number) => void;
}

export const useUserDirectoryStore = create<UserDirectoryState>((set) => ({
	users: [],

	initialize: async () => {
		const response = await userAPI.getAll();
		const users: UserSummaryRes[] = response.data.users;

		set({users});
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