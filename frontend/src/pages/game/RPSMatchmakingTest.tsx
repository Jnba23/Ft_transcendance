import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '@hooks/useSocket';

const RPSMatchmakingTest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket('/matchmaking');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!socket || !user) return;

    socket.on('match-found', (data: { gameId: string; gameType: string; opponent: string }) => {
      console.log('Match found!', data);
      localStorage.setItem('currentGameId', data.gameId);
      navigate(`/rps-game/${data.gameId}`);
    });

    return () => {
      socket.off('match-found');
    };
  }, [socket, user, navigate]);

  const handleFindMatch = () => {
    if (!socket || !user) return;
    socket.emit('join-queue', {
      userId: user.id,
      username: user.username,
      gameType: 'rps'
    });
    setSearching(true);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-8">
      <h1 className="text-4xl font-bold text-white tracking-wider">RPS TESTING</h1>
      
      {!isConnected && (
        <p className="text-red-400 text-lg">Connecting to server...</p>
      )}
      
      {!searching ? (
        <button
          onClick={handleFindMatch}
          disabled={!isConnected}
          className="bg-[rgba(0,243,255,0.8)] text-black px-12 py-4 rounded-xl text-xl font-bold hover:bg-[rgba(0,243,255,1)] disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_30px_rgba(0,243,255,0.6)]"
        >
          FIND MATCH
        </button>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[rgba(0,243,255,0.3)] border-t-[rgba(0,243,255,0.9)] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[rgba(0,243,255,0.8)] text-xl tracking-wide">Searching for opponent...</p>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-xl p-6 text-white/60 text-sm">
        <p className="mb-2">👤 User ID: <span className="text-white font-bold">{user?.id}</span></p>
        <p className="mb-2">📝 Username: <span className="text-white font-bold">{user?.username}</span></p>
        <p>🔌 Socket: {isConnected ? <span className="text-green-400 font-bold">✅ Connected</span> : <span className="text-red-400 font-bold">❌ Disconnected</span>}</p>
      </div>
    </div>
  );
};

export default RPSMatchmakingTest;
