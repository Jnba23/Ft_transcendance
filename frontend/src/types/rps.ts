export type Choice = 'rock' | 'paper' | 'scissors';
export type GamePhase = 'waiting' | 'choosing' | 'revealing' | 'game-over'

export interface PlayerState {
	userId: number,
	name: string,
	score: number,
	isConnected: boolean
}

export interface GameState {
	currentRound: number,
	player1: PlayerState,
	player2: PlayerState,
	phase: GamePhase,
	roundsToWin: number
}

export interface RoundResult {
	p1Choice: Choice,
	p2Choice: Choice,
	p1Score: number,
	p2Score: number,
	round: number
}

export interface GameOverData {
	winnerId: number,
	winnerName: string,
	finalScore: {
		player1: number,
		player2: number
	}
	reason?: 'forfeit',
	message?: string
}