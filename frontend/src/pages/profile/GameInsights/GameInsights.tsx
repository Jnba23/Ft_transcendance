import { UserStats } from 'types/userStats';
import RatioCard from './stats/RatioCard';

type GameInsightsProps = {
  stats: UserStats;
};

function GameInsights({ stats }: GameInsightsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <RatioCard
        game="Pong"
        icon="sports_tennis"
        WLRatio={{ win: stats.pong_wins, loss: stats.pong_losses }}
      />
      <RatioCard
        game="RPS"
        icon="sign_language"
        WLRatio={{ win: stats.RPS_wins, loss: stats.RPS_losses }}
      />
    </div>
  );
}

export default GameInsights;
