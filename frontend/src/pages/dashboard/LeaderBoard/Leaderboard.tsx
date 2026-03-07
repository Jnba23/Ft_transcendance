import { gamesAPI } from '@api/games.api';
import LeaderBoardItem from './LeaderboardItem';
import { useEffect, useState } from 'react';
import { LeaderboardUnit } from 'types/leaderboard';
import { useUserDirectoryStore } from '@stores/userDirectory.store';
import { useErrorStore } from '@stores/error.store';

const LeaderboardCard = () => {
  const me = useUserDirectoryStore((state) => state.me);
  const showError = useErrorStore((state) => state.showError);
  const [leaderboard, setLeaderboard] = useState<LeaderboardUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await gamesAPI.getLeaderBoard();
        const data = response.data.leaderboard;
        setLeaderboard(data);
      } catch {
        showError('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [showError]);

  if (loading) return <div></div>;

  return (
    <main className="text-white">
      <h3 className="text-lg font-bold mb-4 leading-tight tracking-tight">
        Top Players
      </h3>
      <section className="flex flex-col gap-3">
        {leaderboard.map((user) => {
          return (
            <LeaderBoardItem
              key={user.id}
              highlight={user.id === me?.id}
              rank={user.rank}
              userId={user.id}
              username={user.username}
              score={user.wins}
            />
          );
        })}
      </section>
    </main>
  );
};

export default LeaderboardCard;
