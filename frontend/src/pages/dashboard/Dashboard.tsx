import FriendRequests from './FriendRequests/FriendRequests';
import LeaderboardCard from './LeaderboardCard';
import StateCard from './StateCard';
import HistoryCard, { HistoryEntry } from './HistoryCard';

const dummyHistory: HistoryEntry[] = [
  {
    opponent: 'GhostRider',
    date: '2024-07-21',
    winningHand: 'Paper',
    outcome: 'Win',
  },
  {
    opponent: 'GhostRider',
    date: '2024-07-21',
    winningHand: 'Paper',
    outcome: 'Win',
  },
];

function Dashboard() {
  return (
    <div>
      <div className="flex flex-col gap-12">
        <article>
          <div
            className={[
              'grid gap-8 grid-cols-1 lg:grid-cols-2',
              'bg-[#16213E]/50 p-6 rounded-lg',
              'border border-white/10',
            ].join(' ')}
          >
            <FriendRequests />
            <LeaderboardCard />
          </div>
        </article>
        <article>
          <div className="bg-[#16213E]/50 p-6 rounded-lg border border-white/10">
            <StateCard
              name="Pong"
              totalGames={85}
              winStrick={9}
              winRate={72}
              WLRatio={{ win: 50, loss: 50 }}
            />
            <HistoryCard name="Pong" history={dummyHistory} />
          </div>
        </article>
      </div>
    </div>
  );
}

export default Dashboard;
