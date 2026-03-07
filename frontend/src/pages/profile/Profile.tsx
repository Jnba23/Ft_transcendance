import { useParams } from 'react-router';
import GameInsights from './GameInsights/GameInsights';
import ProfileBanner from './ProfileBadge/ProfileBanner';
import { useErrorStore } from '@stores/error.store';
import { UserStats } from 'types/userStats';
import { gamesAPI } from '@api/games.api';
import { useEffect, useState } from 'react';
import GameHistory from './GameInsights/GameHistory/GameHistory';

function Profile() {
  const { id } = useParams();
  const userId = parseInt(id!);

  const showError = useErrorStore((state) => state.showError);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await gamesAPI.getStats(userId);
				const data = response.data.stats;
				setStats(data);
			} catch {
				showError('Failed to fetch profile');
			} finally {
				setLoading(false);
			}
		}

		fetchStats();
	}, [userId]);

	if (loading || !stats) return <div></div>

  return (
    <div className='flex flex-col gap-12'>
      <ProfileBanner userId={userId} stats={stats}/>
      <GameInsights stats={stats}/>
      <GameHistory userId={userId}/>
    </div>
  );
}

export default Profile;
