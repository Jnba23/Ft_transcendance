import { useRef, useEffect, useState } from 'react'
import { Socket } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '@hooks/useSocket'
import { useRPSGame } from '@hooks/useRPSGame'
import { Choice } from '@my-types/rps'
import ChoiceIcon from '@components/ui/icons/ChoiceIcons'
import { createRpsSocket } from '@services/game/socket';
import { getManager } from '../../services/manager'

const RPSGame = () => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [socketReady, setSocketReady] = useState(false);
	const { gameId } = useParams<{ gameId: string}>();
	const navigate = useNavigate();
	const { user } = useAuth();
	useEffect(() => {
		const manager = getManager();
		const existingSocket = manager.socket('/rps');
		if (existingSocket.connected)
			existingSocket.disconnect();
		const newSocket = createRpsSocket();
		setSocket(newSocket);

		const handleConnect = () => {
			setSocketReady(true);
		}

		if (newSocket.connected)
			handleConnect();
		else
			newSocket.on('connect', handleConnect);
		return () => {
			newSocket.off('connect', handleConnect);
			newSocket.disconnect();
			setSocketReady(false);
		};
	  }, []);

	const {
		gameState,
		myChoice,
		roundResult,
		gameOver,
		waitingForOpp,
		opDisconnected,
		countdown,
		makeChoice
	} = useRPSGame(socket, gameId!);

	if (!socket || !user){
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='flex flex-col items-center gap-4'>
					<div className='w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin'></div>
					<p className='text-primary/80 text-xl'>Connecting to game Server ...</p>
				</div>
			</div>
		);
	}

	if (!gameState) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='flex flex-col items-center gap-4'>
					<div className='w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin'></div>
					<p className='text-primary/80 text-xl'>Loading game...</p>
				</div>
			</div>
		);
	}

	const isPlayer1 = gameState.player1.userId === user.id;

	return (
		<div className="flex flex-col items-center justify-center min-h-[calc(100vh-7rem)] py-8">
			{/* Header */}
			<div className="text-center mb-8">
				<h1 className="text-4xl font-bold text-white mb-2 tracking-wide">ROCK PAPER SCISSORS</h1>
				<p className="text-primary/60 text-sm ">BEST OF {gameState.roundsToWin * 2 - 1}</p>
			</div>
			{/* Scoreboard */}
			<div className="flex items-center gap-16 mb-12 bg-white/5  border border-white/10 rounded-xl p-8 min-w-[550px]">
			<div className="flex flex-col items-center flex-1 gap-3">
				<span className={`text-base mb-1 uppercase ${isPlayer1 ? 'text-primary font-bold' : 'text-white/70 font-medium'}`}>
					{gameState?.player1.name}
				</span>
				<div className="relative">
					<span className="text-6xl font-bold text-white">{gameState?.player1.score}</span>
					{isPlayer1 && (
						<div className="absolute -inset-2 bg-primary/10 rounded-lg -z-10"></div>
					)}
				</div>
				{!gameState?.player1.isConnected && (
					<span className="text-red-400 text-xs font-semibold">DISCONNECTED</span>
				)}
			</div>

        <div className="text-white/30 text-3xl font-bold tracking-wide">VS</div>

        <div className="flex flex-col items-center flex-1 gap-3">
			<span className={`text-base mb-1 uppercase ${!isPlayer1 ? 'text-primary font-bold' : 'text-white/70 font-medium'}`}>
				{gameState?.player2.name}
			</span>
			<div className="relative">
				<span className="text-6xl font-bold text-white">{gameState?.player2.score}</span>
				{!isPlayer1 && (
					<div className="absolute -inset-2 bg-primary/10 rounded-lg -z-10"></div>
				)}
			</div>
			{!gameState?.player2.isConnected && (
			<span className="text-red-400 text-xs font-semibold">DISCONNECTED</span>
			)}
        </div>
      </div>

      {/* Round Info */}
      <div className="text-center mb-10">
        <h2 className="text-3xl text-primary/80 font-bold tracking-wide">
          ROUND {gameState?.currentRound}
        </h2>
      </div>

      {/* Opponent Disconnected Alert */}
      {opDisconnected && (
        <div className="bg-yellow-500/10 border-2 border-yellow-500/50 rounded-xl p-5 mb-8 text-center max-w-md animate-pulse">
          <p className="text-yellow-400 font-bold text-lg tracking-wide mb-1">⚠️ OPPONENT DISCONNECTED</p>
          <p className="text-white/60 text-sm tracking-wide">Waiting for reconnection (5 seconds)...</p>
        </div>
      )}

      {/* Choice Phase */}
      {gameState?.phase === 'choosing' && !myChoice && (
        <div className="text-center">
          {countdown !== null && countdown > 0 && (
            <div className="mb-10">
              <div className="relative inline-block">
                <span className="block text-8xl font-bold text-primary mb-3 animate-pulse">
                  {countdown}
                </span>
                <div className="absolute inset-0 blur-2xl bg-primary/30 -z-10"></div>
              </div>
              <p className="text-white/60 text-sm  uppercase">Seconds to choose!</p>
            </div>
          )}
          <h3 className="text-xl text-primary/80 mb-8  font-semibold uppercase">Make your choice</h3>
          <div className="flex gap-8 justify-center">
            {(['rock', 'paper', 'scissors'] as Choice[]).map((choice) => (
              <button
                key={choice}
                onClick={() => makeChoice(choice)}
                disabled={countdown === 0}
                className="group relative flex flex-col items-center gap-4 bg-white/5  border border-white/10 rounded-2xl p-8 w-36 hover:border-primary/80 hover:bg-white/10 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/10"
              >
                <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
					<ChoiceIcon choice={choice} size={80} className="drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]" />
				</div>
                <span className="relative z-10 text-white uppercase font-bold text-sm">{choice}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Waiting Phase */}
      {(waitingForOpp || myChoice) && gameState?.phase !== 'revealing' && (
        <div className="text-center">
			<div className="relative mb-6">
				<div className="w-20 h-20 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
			</div>
			<p className="text-white text-xl mb-4 tracking-wide">Waiting for opponent...</p>
			{myChoice && (
			<div className="flex flex-col items-center gap-3 mt-6 bg-white/5  border border-white/10 rounded-xl p-6 max-w-xs mx-auto">
				<p className="text-primary/80 text-sm uppercase font-semibold">Your Choice</p>
				<ChoiceIcon choice={myChoice} size={64} className="drop-shadow-[0_0_20px_rgba(0,243,255,0.6)]" />
				<span className="text-white uppercase font-bold tracking-wide">{myChoice}</span>
			</div>
			)}
        </div>
      )}

      {/* Round Results */}
      {roundResult && gameState?.phase === 'revealing' && (
        <div className="text-center bg-white/5  border border-white/10 rounded-2xl p-10 min-w-[700px]">
			<h3 className="text-3xl text-primary/80 mb-10 tracking-wide font-bold">ROUND RESULT</h3>
			<div className="flex items-center justify-center gap-16 mb-8">
				<div className="flex flex-col items-center gap-4">
					<span className="text-white/70 text-sm uppercase font-semibold">{gameState.player1.name}</span>
					<div className="relative">
						<div className="bg-white/10 rounded-full p-8 border border-white/10">
							<ChoiceIcon choice={roundResult.p1Choice} size={100} className="drop-shadow-[0_0_25px_rgba(0,243,255,0.5)]" />
						</div>
						{roundResult.p1Score > roundResult.p2Score && (
						<div className="absolute -inset-3 border-4 border-primary/80 rounded-full animate-pulse"></div>
						)}
					</div>
					<span className="text-white capitalize text-lg font-bold tracking-wide">{roundResult.p1Choice}</span>
				</div>

				<div className="text-primary/30 text-4xl font-bold tracking-wide">VS</div>

				<div className="flex flex-col items-center gap-4">
					<span className="text-white/70 text-sm uppercase font-semibold">{gameState.player2.name}</span>
					<div className="relative">
						<div className="bg-white/10 rounded-full p-8 border border-white/10">
							<ChoiceIcon choice={roundResult.p2Choice} size={100} className="drop-shadow-[0_0_25px_rgba(0,243,255,0.5)]" />
						</div>
						{roundResult.p2Score > roundResult.p1Score && (
							<div className="absolute -inset-3 border-4 border-primary/80 rounded-full animate-pulse"></div>
						)}
					</div>
					<span className="text-white capitalize text-lg font-bold tracking-wide">{roundResult.p2Choice}</span>
				</div>
			</div>

          <div className="mt-8 text-2xl font-bold tracking-wide">
            {roundResult.p1Choice === roundResult.p2Choice ? (
              <p className="text-white/60 ">IT'S A TIE!</p>
            ) : roundResult.p1Score > roundResult.p2Score ? (
              <p className="text-primary">{gameState.player1.name.toUpperCase()} WINS THIS ROUND!</p>
            ) : (
              <p className="text-primary">{gameState.player2.name.toUpperCase()} WINS THIS ROUND!</p>
            )}
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
			<div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-3xl p-14 text-center max-w-lg shadow-[0_0_60px_rgba(0,243,255,0.3)]">
				<h2 className="text-6xl font-bold mb-6 tracking-wide">
					{gameOver.winnerId === user.id ? (
					<span className="text-win">YOU WON</span>
					) : (
					<span className="text-loss">YOU LOST</span>
					)}
				</h2>
				<p className="text-3xl text-white mb-8 tracking-wide font-semibold">{gameOver.winnerName} wins!</p>
				
				<div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
					<p className="text-primary/60 text-xs  uppercase mb-4 font-semibold">Final Score</p>
					<div className="flex justify-around text-lg">
						<div className="flex flex-col gap-2">
							<span className="text-white/70 text-sm">{gameState?.player1.name}</span>
							<span className="text-white font-bold text-3xl">{gameOver.finalScore.player1}</span>
						</div>
						<div className="text-white/30 text-2xl self-center font-bold">-</div>
						<div className="flex flex-col gap-2">
							<span className="text-white/70 text-sm">{gameState?.player2.name}</span>
							<span className="text-white font-bold text-3xl">{gameOver.finalScore.player2}</span>
						</div>
					</div>
				</div>

				{gameOver.reason === 'forfeit' && (
					<p className="text-yellow-400 text-sm mb-8 tracking-wide">({gameOver.message})</p>
				)}
					<button
						onClick={() => navigate('/dashboard')}
						className="bg-white/5  border-2 border-primary/80 rounded-xl py-4 px-10 text-primary font-bold text-lg uppercase hover:bg-white/10 hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all duration-300"
					>
						Return to Dashboard
					</button>
			</div>
        </div>
      )}
    </div>
	)
}

export default RPSGame;