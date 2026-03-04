import scannerGif from '@assets/scanner.gif';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMatchmakingSocket } from '@services/game/socket';
import '@styles/matchMaking/matchMaking.css';
const MatchMaking = () => {
  const navigate = useNavigate();

  // states
  const [seconds, setSeconds] = useState(0);

  const gameType: string = 'pong';

  useEffect(() => {
    const socket = createMatchmakingSocket();
    if (!socket) return;

    const onConnect = () => socket.emit('join-queue', gameType);

    if (socket.connected) onConnect();
    else socket.on('connect', onConnect);

    socket.on('match-found', ({ gameId }: { gameId: string }) =>
      navigate(`/${gameType}/${gameId}`)
    );

    socket.on('reconnect-game', (gameId: string) => {
      if (gameId) navigate(`/${gameType}/${gameId}`);
    });

    return () => {
      socket.emit('leave-queue');
      socket.off('connect');
      socket.off('match-found');
      socket.off('reconnect-game');
    };
  }, [navigate]);

  // wait Timer

  useEffect(() => {
    const intervalId = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const formatTimer: () => string = () => {
    const min = Math.floor((seconds + 1) / 60) % 60;
    const sec = (seconds + 1) % 60;
    const nothing: string = '';
    return `${min <= 9 ? 0 : nothing}${min} : ${sec <= 9 ? 0 : nothing}${sec}`;
  };
  // end wait Timer

  const handleCancel = () => {
    const socket = createMatchmakingSocket();
    socket.emit('leave-queue');
    navigate('/start_game');
  };

  return (
    <div className="flex flex-col items-center justify-between w-[calc(100%+4rem)] h-[calc(100vh-7rem)] -mx-8 -mb-8 relative overflow-hidden">
      <div className="absolute bg-[rgba(29,36,60,0.5)] w-160 h-160 rounded-full -bottom-56 -right-40 -z-10"></div>

      <div className="flex flex-col items-center mt-4">
        <h4 className="text-[rgba(0,243,255,0.8)] tracking-[0.2em] font-medium my-4">
          Matchmaking Protocol
        </h4>

        <span className="text-white/60 text-lg font-light tracking-wide">
          WAIT TIME: {formatTimer()}
        </span>
      </div>

      <div className="relative flex flex-col items-center justify-center flex-1">
        <div className="flex gap-5 items-center mb-8">
          <span className="dot w-3.75 h-3.75 rounded-full bg-[rgba(0,243,255,0.8)]"></span>
          <span className="dot w-3.75 h-3.75 rounded-full bg-[rgba(0,243,255,0.8)]"></span>
          <span className="dot w-3.75 h-3.75 rounded-full bg-[rgba(0,243,255,0.8)]"></span>
        </div>

        <div className="relative">
          <img
            src={scannerGif}
            alt="Scanner animation"
            className="w-120 h-120 object-contain"
          />
          <div className="absolute top-[51.5%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-center">
            <span className="text-xl font-medium tracking-[0.3em] text-[rgba(0,243,255,0.9)]">
              SEARCHING
            </span>
            <span className="text-xs font-light tracking-[0.15em] text-white/60">
              SCANNING NETWORK
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={handleCancel}
        className="flex items-center gap-3 bg-black/10 text-base font-semibold py-3 px-8 border border-[rgba(202,90,90,0.7)] rounded-[9px] text-[rgb(202,90,90)] hover:bg-white/5 hover:shadow-[0_0_20px_rgba(255,23,23,0.764)] z-10 mb-8"
      >
        CANCEL SEARCH
      </button>
    </div>
  );
};

export default MatchMaking;
