import { LeaderboardUnit } from "types/leaderboard";
import { client } from "./client";
import { UserStats } from "types/userStats";
import { GameHistoryItem } from "types/gameHistory";

export interface GameHistoryData {
	games: GameHistoryItem[];
	page: number,
	totalPages: number,
	hasNext: boolean,
	hasPrev: boolean
}

interface GetLeaderboardRes {
	status: string;
	results: number;
	data: {
		leaderboard: LeaderboardUnit[];
	}
}

interface GetStatsRes {
	status: string;
	data: {
		stats: UserStats;
	}
}


interface GetGameHistoryRes {
	status: string,
	data: GameHistoryData
}

export const gamesAPI = {
	getLeaderBoard: async () => {
		const response = await client.get<GetLeaderboardRes>('/games/leaderboard');
		return response.data;
	},

	getStats: async (userId: number) => {
		const response = await client.get<GetStatsRes>(`/games/users/${userId}/stats`);
		return response.data;
	},

	getGameHistory: async (userId?: number, page: number = 1, limit: number = 20, gameType?: string) => {
		const response = await client.get<GetGameHistoryRes>(`/games/users/${userId}/history`, {
			params: { page, limit, gameType }
		});
		return response.data;
	}
}