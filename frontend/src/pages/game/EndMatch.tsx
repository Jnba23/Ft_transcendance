import Avatar from '@components/ui/Avatar';
import { useNavigate, useLocation } from 'react-router-dom';
import Boy from '@assets/boy.jpg';
import Girl from '@assets/girl.jpg';
import { useAuth } from '../../context/AuthContext';

const EndMatch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const matchData = location.state?.matchData as any | undefined;

  const isPlayer1 = matchData?.player1Id === user?.id;
  const myScore = isPlayer1 ? matchData?.player1Score : matchData?.player2Score;
  const opponentScore = isPlayer1 ? matchData?.player2Score : matchData?.player1Score;
  const opponentName = isPlayer1 ? matchData?.player2Name : matchData?.player1Name;
  const didIWin = matchData?.winnerId === user?.id;

  if (!matchData || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#101622]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col justify-center items-center min-h-screen w-full bg-[#101622] p-4 md:p-8 gap-8 md:gap-12 text-center isolate overflow-x-hidden">
      <h1 className={`font-bold text-5xl md:text-7xl leading-none ${didIWin ? 'text-blue-400' : 'text-red-400'}`}>
        {didIWin ? 'You Win' : 'You Loss'}
      </h1>

      <div className={`flex flex-col md:flex-row gap-8 md:gap-16 p-8 md:p-12 w-full max-w-180 bg-[#16213E]/60 rounded-3xl border border-white/10 items-center justify-between ${didIWin ? 'border-blue-500/20' : 'border-red-500/20'}`}>

        {/* Player 1 (You) */}
        <div className="flex flex-col justify-center items-center flex-1">
          <div className="relative mb-4">
            <Avatar path={Boy} section="board" />
          </div>
          <h3 className="font-bold text-xl md:text-2xl text-white mb-2">You</h3>
          <p className="text-blue-100 bg-blue-600/30 border border-blue-500/30 rounded px-3 py-1 text-xs md:text-sm uppercase tracking-widest font-semibold">
            You
          </p>
        </div>

        {/* Score Display */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <span className="text-xs md:text-sm font-light tracking-[0.3em] text-white/50 mb-2 uppercase">Final Score</span>
          <p className="font-black text-5xl md:text-7xl text-white">
            {myScore}<span className="text-blue-500 mx-2 md:mx-4">-</span>{opponentScore}
          </p>
        </div>

        {/* Player 2 (Opponent) */}
        <div className="flex flex-col justify-center items-center flex-1">
          <div className="relative mb-4">
            <Avatar path={Girl} section="board" />
          </div>
          <h3 className="font-bold text-xl md:text-2xl text-white/80 mb-2 whitespace-nowrap">{opponentName}</h3>
          <p className="text-white/60 bg-white/5 border border-white/10 rounded px-3 py-1 text-xs md:text-sm uppercase tracking-widest font-semibold">
            Opponent
          </p>
        </div>

      </div>

      <div className="flex flex-col sm:flex-row mt-4 md:mt-8 gap-4 md:gap-6 w-full max-w-180 px-4 md:px-0 z-10">
        <button className="flex-1 flex justify-center items-center gap-3 rounded-xl border border-blue-500/50 bg-blue-600/90 hover:bg-blue-500 text-white text-sm md:text-base font-semibold py-4 px-6 cursor-pointer shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(37,99,235,0.6)]">
          <span className="material-symbols-outlined text-xl">group_add</span>
          <span className="tracking-wide">Add Friend</span>
        </button>

        <button
          onClick={() => navigate('/match_making')}
          className="flex-1 flex justify-center items-center gap-3 rounded-xl bg-[#1D253F]/80 backdrop-blur-md border border-white/10 text-white/90 text-sm md:text-base font-semibold py-4 px-6 cursor-pointer shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-[#252E4B]/90 hover:border-white/20 hover:text-white"
        >
          <span className="material-symbols-outlined text-xl">shuffle</span>
          <span className="tracking-wide">Next Match</span>
        </button>
      </div>
    </div>
  );
};

export default EndMatch;
