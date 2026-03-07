import FriendRequests from './FriendRequests/FriendRequests';
import GameInsights from './GameInsights/GameInsights';
import Leaderboard from './LeaderBoard/Leaderboard';

function Dashboard() {
  return (
    <div>
      <div className="flex flex-col gap-12">
        <article>
          <div
            className={[
              'grid gap-8 grid-cols-1 lg:grid-cols-2',
              'bg-card-dark p-6 rounded-lg',
              'border border-white/10',
            ].join(' ')}
          >
            <FriendRequests />
            <Leaderboard />
          </div>
        </article>

        <article>
          <GameInsights />
        </article>
      </div>
    </div>
  );
}

export default Dashboard;
