import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client'
import { Choice, GameState, RoundResult, GameOverData} from '../types/rps'

export const useRPSGame = (socket: Socket | null, gameId: string, userId: number) => {
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [myChoice, setMyChoice] = useState<Choice | null>(null);
	const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
	const [gameOver, setGameOver] = useState<GameOverData | null>(null);
	const [waitingForOpp, setWaitingForOpp] = useState(false);
	const [opDisconnected, setOpDisconnected] = useState(false);
	const [countdown, setCountdown] = useState<number | null>(null);

	useEffect(() => {
		if (!socket) return ;

		socket.emit('join-game', {gameId, userId});
		socket.on('joined-game', (data: {gameId: string, gameState: GameState}) => {
			// console.log(data);
			setGameState(data.gameState);
			localStorage.setItem('currentGameId', data.gameId);
		})

		socket.on('game-start', (data: {message: string, roundsToWin: number}) => {
			console.log(data);
			setGameState((prev) => {
				return (prev ? { ...prev, phase: 'choosing'} : null);
			})
			setMyChoice(null);
			setRoundResult(null);
			setCountdown(5);
		})

		socket.on('auto-choice-made', (data: {message: string, choice: Choice})=> {
			console.log(data);
			setWaitingForOpp(true);
			makeChoice(data.choice);
		});

		socket.on('choice-recorded', () => {
			setWaitingForOpp(true);
		})

		socket.on('round-results', (data: RoundResult) => {
			setRoundResult(data);
			setGameState((prev) => {
				return prev ? {
					...prev,
					currentRound: data.round,
					player1: { ...prev.player1, score: data.p1Score},
					player2: { ...prev.player2, score: data.p2Score},
					phase: 'revealing'
				} : null
			});
			setWaitingForOpp(false);
			setMyChoice(null);
		})

		socket.on('new-round', (data: {round: number, message: string}) => {
			setGameState((prev) => {
				return prev ? {...prev, currentRound: data.round, phase: 'choosing'}: null;
			})
			setRoundResult(null);
			setMyChoice(null);
			setCountdown(5);
		})

		socket.on('game-over', (data: GameOverData) => {
			// console.log('-----------Game Over-----------');
			// console.log(data);
			setGameOver(data);
			setGameState((prev) => {
				return prev ? {...prev, phase: 'game-over'} : null;
			})
			localStorage.removeItem('currentGameId');
		});


		socket.on('opponent-disconnected', () => {
			setOpDisconnected(true);
		})

		socket.on('opponent-reconnected', () => {
			setOpDisconnected(false);
		})

		socket.on('error', (data: {message: string}) => {
			console.error('Game error', data.message);
			alert(data.message);
		})

		return () => {
			socket.off('joined-game');
			socket.off('game-start');
			socket.off('choice-recorded');
			socket.off('round-results');
			socket.off('new-round');
			socket.off('game-over');
			socket.off('auto-choice-made');
			socket.off('opponent-disconnected');
			socket.off('opponent-reconnected');
			socket.off('error');
		}
	}, [socket, gameId, userId]);

	useEffect(() => {
		if (countdown === null || countdown <= 0) return;

		const timer = setTimeout(() => {
			setCountdown(countdown - 1);
		}, 1000);
		return () => clearTimeout(timer);
	}, [countdown]);

	const makeChoice = (choice: Choice) => {
		console.log('choice made fnct');
		socket?.emit('make-choice', { choice });
		setMyChoice(choice);
		setCountdown(null);
	};

	return {
		gameState,
		myChoice,
		roundResult,
		gameOver,
		waitingForOpp,
		opDisconnected,
		countdown,
		makeChoice
	};
}