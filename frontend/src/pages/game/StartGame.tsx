import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useLayoutStore } from '@stores/layout.store';
import { useEffect } from 'react';

const StartGame = () => {
  const navigate = useNavigate();
  const { showNavbar, unomitSidebar } = useLayoutStore((state) => state);

  useEffect(() => {
    showNavbar();
    unomitSidebar();
  }, [showNavbar, unomitSidebar]);

  const location = useLocation();
  const params = useParams();

  const game = params['*'] || location.state?.game;
  return (
    <div className="text-white relative flex flex-col justify-center items-center min-h-screen w-full bg-background-dark p-4 gap-6 text-center">
      <h1 className="font-bold text-6xl leading-none">Play {game}</h1>
      <p className="w-1/2 text-lg leading-7 text-white/60">
        Challenge your friends or find a random opponent to start a new game of
        classic {game}.
      </p>

      <div className="flex mt-5 gap-4">
        <button
          onClick={() =>
            navigate('/match_making', {
              state: { gameType: game.toLowerCase() },
            })
          }
          className="mb-20 flex items-center gap-2 rounded-lg bg-white/10 backdrop-blur-[10px] border border-gray-500 text-white text-base font-semibold py-3 px-8 cursor-pointer shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transition-all duration-200 hover:-translate-y-0.5 hover:border-white/50 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.5),0_0_15px_rgba(255,255,255,0.1)]"
        >
          <span className="material-symbols-outlined">shuffle</span>
          <span>Random Opponent</span>
        </button>
      </div>

    </div>
  );
};

export default StartGame;
