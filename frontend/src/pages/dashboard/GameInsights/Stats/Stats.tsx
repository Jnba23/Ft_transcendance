import { UserStats } from 'types/userStats';
import StatsCard from './StatsCard';
import { useEffect, useState } from 'react';
import { gamesAPI } from '@api/games.api';
import { useErrorStore } from '@stores/error.store';
import { useUserDirectoryStore } from '@stores/userDirectory.store';

type StatsProps = {
	section: 'Pong' | 'RPS'
}

function Stats({ section }: StatsProps) {
	const me = useUserDirectoryStore((state) => state.me);
	const showError = useErrorStore((state) => state.showError);
	const [stats, setStats] = useState<UserStats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!me) return;

		const fetchStats = async () => {
			try {
				const response = await gamesAPI.getStats(me?.id);
				const data = response.data.stats;
				setStats(data);
			} catch {
				showError('Failed to fetch stats');
			} finally {
				setLoading(false);
			}
		}

		fetchStats();
	}, [me]);

	if (loading || !stats) return <div></div>

	return (
		<div>
			{
              section === 'Pong' ?
              <StatsCard
                name={section}
                totalGames={stats?.pong_games_played}
                winStreak={stats.pong_winStreak}
                winRate={stats.pong_win_rate}
                WLRatio={{ win: stats.pong_wins, loss: stats.pong_losses }}
              />
              :
              <StatsCard
                name={section}
                totalGames={stats.RPS_games_played}
                winStreak={stats.RPS_winStreak}
                winRate={stats.RPS_win_rate}
                WLRatio={{ win: stats.RPS_wins, loss: stats.RPS_losses }}
              />
            }
		</div>
	);
}

export default Stats;