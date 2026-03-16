import UserBadge from '@components/ui/UserBadge';
import { GameHistoryItem } from 'types/gameHistory';

type GameHistoryUnitProps = {
  game: GameHistoryItem;
  userId: number;
};

function GameHistoryUnit({ game, userId }: GameHistoryUnitProps) {
  return (
    <div className="grid grid-cols-4 items-center gap-4 bg-white/5 p-3 rounded-lg">
      <UserBadge id={userId} username={game.opponent_name} section="history" />
      <span className="text-sm text-center text-white/80">
        {game.created_at.split(' ')[0]}
      </span>
      <span className="text-white text-sm text-center font-semibold">
        {game.player1_score}-{game.player2_score}
      </span>
      <div className="text-right">
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            game.result === 'win'
              ? 'bg-[#50C87833] text-[#50C878]'
              : 'bg-red-500/20 text-red-500'
          }`}
        >
          {game.result}
        </span>
      </div>
    </div>
  );
}

export default GameHistoryUnit;
