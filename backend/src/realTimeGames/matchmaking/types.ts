	import { Socket } from "socket.io"
export type GameType = 'rps' | 'pong';

export interface QueueEntry {
	userId: number;
	username: string;
	gameType: GameType;
	joinedAt: Date,
	socketId : string;
}

export interface MatchResult {
	gameId: string;
	player1: QueueEntry;
	player2: QueueEntry;
	gameType: GameType;
}