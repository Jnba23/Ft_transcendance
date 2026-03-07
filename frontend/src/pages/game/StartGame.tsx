import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Cards/GlassCard';
import { useLayoutStore } from '@stores/layout.store';
import { useEffect } from 'react';

const StartGame = ({ name }: { name: string }) => {
  const navigate = useNavigate();
  const {showNavbar, unomitSidebar} = useLayoutStore((state) => state);

  useEffect(() => {
    showNavbar();
    unomitSidebar();
  }, []);

  return (
    <div className="text-white relative flex flex-col justify-center items-center min-h-screen w-full bg-background-dark p-4 gap-6 text-center isolate">
      <span
        className="material-symbols-outlined absolute text-white/5 -z-10"
        style={{ fontSize: '40rem' }}
      >
        sports_tennis
      </span>
      <h1 className="font-bold text-6xl leading-none">Play {name}</h1>
      <p className="w-1/2 text-lg leading-7 text-white/60">
        Challenge your friends or find a random opponent to start a new game of
        classic Pong.
      </p>

      <div className="flex mt-5 gap-4">
        <button className="mb-20 flex items-center gap-2 rounded-lg border-none bg-blue-600 text-white text-base font-semibold py-3 px-8 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(0,100,255,0.7),0_0_40px_rgba(0,100,255,0.4)]">
          <span className="material-symbols-outlined">group_add</span>
          <span>Play with a Friend</span>
        </button>

        <button
          onClick={() => navigate('/match_making')}
          className="mb-20 flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-[10px] border border-gray-500 text-white text-base font-semibold py-3 px-8 cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/50 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5),0_0_15px_rgba(255,255,255,0.1)]"
        >
          <span className="material-symbols-outlined">shuffle</span>
          <span>Random Opponent</span>
        </button>
      </div>

      <Card gameName={name} winLoss="61W / 24L" highestScore="11 - 0" />
    </div>
  );
};

export default StartGame;
