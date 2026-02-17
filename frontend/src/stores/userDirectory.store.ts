import { create } from 'zustand'
import { User } from 'types/user'
import axios from 'axios';

interface UserDirectoryState {
	users: User[],

	initialize: () => void;

	addUser: (user: User) => void;
	removeUser: (id: number) => void;
}

export const useUserDirectoryStore = create<UserDirectoryState>((set) => ({
	users: [],

	initialize: async () => {
		const usersRes = await getUsers();
		const users: User[] = usersRes.data;

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

async function getUsers() {
	return (
		axios.get('http://localhost:4950/api/users')
	);
}