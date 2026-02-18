export type Choice = 'rock' | 'paper' | 'scissors';
export type GamePhase = 'waiting' | 'revealing' | 'game-over';

export interface PlayerState {
	userId: number,
	name: string,
	score: number,
	currentChoice?: Choice,
	isConnected: boolean,
	socketId: string
}
export interface RpsGameState {
	gameId: string,
	player1: PlayerState,
	player2: PlayerState,
	currentRound: number,
	roundsToWin: number, //say we play best 2 five : first player to reach score 3 wins
	phase: GamePhase,
	winner: number | null// userId
	timers: {
		autoChoice?: NodeJS.Timeout,
		reconnection?: NodeJS.Timeout,
		roundReveal?: NodeJS.Timeout,
		cleanup?: NodeJS.Timeout
	  }
}