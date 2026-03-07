import { useEffect, useState } from 'react';
import HistoryHeader from './HistoryHeader';
import { GameHistoryItem } from 'types/gameHistory';
import { useErrorStore } from '@stores/error.store';
import { GameHistoryData, gamesAPI } from '@api/games.api';
import GameHistoryUnit from './GameHistoryUnit';

type GameHistoryProps = {
  userId: number;
};

function GameHistory({ userId }: GameHistoryProps) {
  const INITIAL_PAGE = 1;
  const LIMIT = 10;
  const showError = useErrorStore((state) => state.showError);
  const [gameType, setGameType] = useState('pong');
  const [page, setPage] = useState(INITIAL_PAGE);
  const [data, setData] = useState<GameHistoryData | null>(null);
  const [games, setGames] = useState<GameHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchGames = async () => {
      try {
        const response = await gamesAPI.getGameHistory(
          userId,
          page,
          LIMIT,
          gameType
        );
        const games = response.data.games;
        setGames(games.filter((game) => game.game_type === gameType));
        setData(response.data);
      } catch {
        showError('Failed to fetch game history');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [gameType, page, userId, showError]);

  if (page > data?.totalPages) setPage(data?.totalPages); // reset to total pages after profile switch

  if (loading) return <div></div>;

  return (
    <div className="bg-[#16213E]/50 rounded-xl p-6 border border-white/10">
      <HistoryHeader
        setPage={setPage}
        setGameType={setGameType}
        page={data!.page ?? 1}
        totalPages={data!.totalPages ?? 1}
      />
      <div className="max-h-64 h-64 overflow-y-auto custom-scrollbar pr-2 flex flex-col">
        <div className="flex flex-col gap-2">
          {games.map((game) => {
            return (
              <GameHistoryUnit
                key={game.id}
                game={game}
                userId={game.opponent_id}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GameHistory;
