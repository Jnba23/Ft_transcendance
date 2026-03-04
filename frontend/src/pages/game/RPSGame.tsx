import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '@hooks/useSocket'
import { useRPSGame } from '@hooks/useRPSGame'
import { Choice } from '@my-types/rps'
import ChoiceIcon from '@components/ui/icons/ChoiceIcons'

const RPSGame = () => {
	const { gameId } = useParams<{ gameId: string}>();
	const navigate = useNavigate();
	const { user } = useAuth();
	const  { socket, isConnected } = useSocket('/rps');

	const {
		gameState,
		myChoice,
		roundResult,
		gameOver,
		waitingForOpp,
		opDisconnected,
		countdown,
		makeChoice
	} = useRPSGame(socket, gameId!, user?.id || 0);

	useEffect(() => {
		const savedGameId = localStorage.getItem('currentGameId');
		if (savedGameId && savedGameId != gameId){
			navigate(`/rps-game/${savedGameId}`);
		}
	}, [gameId, navigate]);

	if (!isConnected || !user){
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='flex flex-col items-center gap-4'>
					<div className='w-16 h-16 border-4 border-[rgba(0,243,255,0.3)] border-t-[rgba(0,243,255,0.9)] rounded-full animate-spin'></div>
					<p className='text-[rgba(0,243,255,0.8)] text-xl'>Connecting to game Server ...</p>
				</div>
			</div>
		);
	}

	if (!gameState) {
		return (
			<div className='flex items-center justify-center h-screen'>
				<div className='flex flex-col items-center gap-4'>
					<div className='w-16 h-16 border-4 border-[rgba(0,243,255,0.3)] border-t-[rgba(0,243,255,0.9)] rounded-full animate-spin'></div>
					<p className='text-[rgba(0,243,255,0.8)] text-xl'>Loading game...</p>
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
				<p className="text-[rgba(0,243,255,0.6)] text-sm tracking-[0.2em]">BEST OF {gameState.roundsToWin * 2 - 1}</p>
			</div>
			{/* Scoreboard */}
			<div className="flex items-center gap-16 mb-12 bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-xl p-8 min-w-[550px]">
			<div className="flex flex-col items-center flex-1 gap-3">
			<span className={`text-base mb-1 tracking-wider uppercase ${isPlayer1 ? 'text-[rgba(0,243,255,0.9)] font-bold' : 'text-white/70 font-medium'}`}>
				{gameState?.player1.name}
			</span>
			<div className="relative">
				<span className="text-6xl font-bold text-white">{gameState?.player1.score}</span>
				{isPlayer1 && (
				<div className="absolute -inset-2 bg-[rgba(0,243,255,0.1)] rounded-lg -z-10 animate-pulse"></div>
				)}
			</div>
			{!gameState?.player1.isConnected && (
				<span className="text-red-400 text-xs font-semibold tracking-wider">DISCONNECTED</span>
			)}
			</div>

        <div className="text-white/30 text-3xl font-bold tracking-widest">VS</div>

        <div className="flex flex-col items-center flex-1 gap-3">
          <span className={`text-base mb-1 tracking-wider uppercase ${!isPlayer1 ? 'text-[rgba(0,243,255,0.9)] font-bold' : 'text-white/70 font-medium'}`}>
            {gameState?.player2.name}
          </span>
          <div className="relative">
            <span className="text-6xl font-bold text-white">{gameState?.player2.score}</span>
            {!isPlayer1 && (
              <div className="absolute -inset-2 bg-[rgba(0,243,255,0.1)] rounded-lg -z-10 animate-pulse"></div>
            )}
          </div>
          {!gameState?.player2.isConnected && (
            <span className="text-red-400 text-xs font-semibold tracking-wider">DISCONNECTED</span>
          )}
        </div>
      </div>

      {/* Round Info */}
      <div className="text-center mb-10">
        <h2 className="text-3xl text-[rgba(0,243,255,0.8)] font-bold tracking-[0.3em]">
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
                <span className="block text-8xl font-bold text-[rgba(0,243,255,0.9)] mb-3 animate-pulse">
                  {countdown}
                </span>
                <div className="absolute inset-0 blur-2xl bg-[rgba(0,243,255,0.3)] -z-10"></div>
              </div>
              <p className="text-white/60 text-sm tracking-[0.2em] uppercase">Seconds to choose!</p>
            </div>
          )}
          <h3 className="text-xl text-[rgba(0,243,255,0.8)] mb-8 tracking-[0.2em] font-semibold uppercase">Make your choice</h3>
          <div className="flex gap-8 justify-center">
            {(['rock', 'paper', 'scissors'] as Choice[]).map((choice) => (
              <button
                key={choice}
                onClick={() => makeChoice(choice)}
                disabled={countdown === 0}
                className="group relative flex flex-col items-center gap-4 bg-white/5 backdrop-blur-[10px] border-2 border-white/10 rounded-2xl p-8 w-36 hover:border-[rgba(0,243,255,0.8)] hover:bg-white/10 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-white/10"
              >
                <div className="absolute inset-0 bg-[rgba(0,243,255,0.05)] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                  <ChoiceIcon choice={choice} size={80} className="drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]" />
                </div>
                <span className="relative z-10 text-white uppercase font-bold tracking-wider text-sm">{choice}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Waiting Phase */}
      {(waitingForOpp || myChoice) && gameState?.phase !== 'revealing' && (
        <div className="text-center">
			<div className="relative mb-6">
				<div className="w-20 h-20 border-4 border-[rgba(0,243,255,0.2)] border-t-[rgba(0,243,255,0.9)] rounded-full animate-spin mx-auto"></div>
			</div>
			<p className="text-white text-xl mb-4 tracking-wide">Waiting for opponent...</p>
			{myChoice && (
			<div className="flex flex-col items-center gap-3 mt-6 bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-xl p-6 max-w-xs mx-auto">
				<p className="text-[rgba(0,243,255,0.8)] text-sm tracking-wider uppercase font-semibold">Your Choice</p>
				<ChoiceIcon choice={myChoice} size={64} className="drop-shadow-[0_0_20px_rgba(0,243,255,0.6)]" />
				<span className="text-white uppercase font-bold tracking-widest">{myChoice}</span>
			</div>
			)}
        </div>
      )}

      {/* Round Results */}
      {roundResult && gameState?.phase === 'revealing' && (
        <div className="text-center bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-2xl p-10 min-w-[700px]">
			<h3 className="text-3xl text-[rgba(0,243,255,0.8)] mb-10 tracking-[0.3em] font-bold">ROUND RESULT</h3>
			<div className="flex items-center justify-center gap-16 mb-8">
				<div className="flex flex-col items-center gap-4">
					<span className="text-white/70 text-sm tracking-wider uppercase font-semibold">{gameState.player1.name}</span>
					<div className="relative">
						<div className="bg-white/10 rounded-full p-8 border-2 border-white/20">
							<ChoiceIcon choice={roundResult.p1Choice} size={100} className="drop-shadow-[0_0_25px_rgba(0,243,255,0.5)]" />
						</div>
						{roundResult.p1Score > roundResult.p2Score && (
						<div className="absolute -inset-3 border-4 border-[rgba(0,243,255,0.8)] rounded-full animate-pulse"></div>
						)}
					</div>
					<span className="text-white capitalize text-lg font-bold tracking-widest">{roundResult.p1Choice}</span>
				</div>

				<div className="text-[rgba(0,243,255,0.3)] text-4xl font-bold tracking-widest">VS</div>

				<div className="flex flex-col items-center gap-4">
					<span className="text-white/70 text-sm tracking-wider uppercase font-semibold">{gameState.player2.name}</span>
					<div className="relative">
						<div className="bg-white/10 rounded-full p-8 border-2 border-white/20">
							<ChoiceIcon choice={roundResult.p2Choice} size={100} className="drop-shadow-[0_0_25px_rgba(0,243,255,0.5)]" />
						</div>
						{roundResult.p2Score > roundResult.p1Score && (
							<div className="absolute -inset-3 border-4 border-[rgba(0,243,255,0.8)] rounded-full animate-pulse"></div>
						)}
					</div>
					<span className="text-white capitalize text-lg font-bold tracking-widest">{roundResult.p2Choice}</span>
				</div>
			</div>

          <div className="mt-8 text-2xl font-bold tracking-wide">
            {roundResult.p1Choice === roundResult.p2Choice ? (
              <p className="text-white/60 tracking-[0.2em]">IT'S A TIE!</p>
            ) : roundResult.p1Score > roundResult.p2Score ? (
              <p className="text-[rgba(0,243,255,0.9)] tracking-[0.15em]">{gameState.player1.name.toUpperCase()} WINS THIS ROUND!</p>
            ) : (
              <p className="text-[rgba(0,243,255,0.9)] tracking-[0.15em]">{gameState.player2.name.toUpperCase()} WINS THIS ROUND!</p>
            )}
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
			<div className="bg-white/10 backdrop-blur-[20px] border-2 border-white/20 rounded-3xl p-14 text-center max-w-lg shadow-[0_0_60px_rgba(0,243,255,0.3)]">
				<h2 className="text-6xl font-bold mb-6 tracking-wide">
					{gameOver.winnerId === user.id ? (
					<span className="text-[rgba(0,243,255,0.9)] drop-shadow-[0_0_20px_rgba(0,243,255,0.8)]">🎉 YOU WIN!</span>
					) : (
					<span className="text-red-400 drop-shadow-[0_0_20px_rgba(255,0,0,0.5)]">😔 YOU LOST</span>
					)}
				</h2>
				<p className="text-3xl text-white mb-8 tracking-wide font-semibold">{gameOver.winnerName} wins!</p>
				
				<div className="bg-white/5 rounded-xl p-6 mb-8 border border-white/10">
					<p className="text-[rgba(0,243,255,0.6)] text-xs tracking-[0.2em] uppercase mb-4 font-semibold">Final Score</p>
					<div className="flex justify-around text-lg">
						<div className="flex flex-col gap-2">
							<span className="text-white/70 text-sm tracking-wider">{gameState?.player1.name}</span>
							<span className="text-white font-bold text-3xl">{gameOver.finalScore.player1}</span>
						</div>
						<div className="text-white/30 text-2xl self-center font-bold">-</div>
						<div className="flex flex-col gap-2">
							<span className="text-white/70 text-sm tracking-wider">{gameState?.player2.name}</span>
							<span className="text-white font-bold text-3xl">{gameOver.finalScore.player2}</span>
						</div>
					</div>
				</div>

				{gameOver.reason === 'forfeit' && (
					<p className="text-yellow-400 text-sm mb-8 tracking-wide">({gameOver.message})</p>
				)}
					<button
						onClick={() => navigate('/dashboard')}
						className="bg-white/5 backdrop-blur-[10px] border-2 border-[rgba(0,243,255,0.8)] rounded-xl py-4 px-10 text-[rgba(0,243,255,0.9)] font-bold text-lg tracking-wider uppercase hover:bg-white/10 hover:shadow-[0_0_30px_rgba(0,243,255,0.5)] transition-all duration-300"
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