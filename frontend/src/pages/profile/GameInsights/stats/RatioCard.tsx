type RatioCardProps = {
  icon: string;
  game: string;
  WLRatio: {
    win: number;
    loss: number;
  };
};

function RatioCard({ icon, game, WLRatio }: RatioCardProps) {
  const offset = (WLRatio.loss / (WLRatio.win + WLRatio.loss)) * 100;
  const showWins = WLRatio.win > 0;

  return (
    <div className="bg-[#16213E]/50 rounded-xl p-6 border border-white/10">
      <h3 className="text-white/80 font-semibold mb-4 flex items-center gap-2">
        <span className="material-symbols-outlined !text-base">{icon}</span>
        {game}
      </h3>
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <p className="text-white/60 text-sm">W/L Ration</p>
          <p className="text-white font-bold text-lg">
            {WLRatio.win}W/{WLRatio.loss}L
          </p>
        </div>
        <div className="relative w-16 h-16 mt-1">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <circle
              className="stroke-current text-red-500"
              cx={18}
              cy={18}
              r={16}
              fill="none"
              strokeWidth={3}
            />
            {showWins && (
              <circle
                className="stroke-current text-green-400"
                cx={18}
                cy={18}
                r={16}
                fill="none"
                strokeWidth={3}
                strokeDasharray={100}
                strokeDashoffset={isNaN(offset) ? 50 : offset}
              />
            )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white text-sm font-bold">{WLRatio.win}W</span>
            <span className="text-gray-400 text-[10px]">{WLRatio.loss}L</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RatioCard;
