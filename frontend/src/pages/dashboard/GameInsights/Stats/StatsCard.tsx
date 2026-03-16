interface GameStats {
  name: string;
  totalGames: number;
  winStreak: number;
  winRate: number;
  WLRatio: {
    win: number;
    loss: number;
  };
}

const StatsCard = ({
  name,
  totalGames,
  winStreak,
  winRate,
  WLRatio,
}: GameStats) => {
  const offset = (WLRatio.loss / (WLRatio.win + WLRatio.loss)) * 100;
  const showWins = WLRatio.win > 0;

  return (
    <main className="text-white">
      <h2 className="text-[22px] font-bold mb-6">{name} Stats</h2>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <section className="flex flex-col gap-2 rounded-xl p-4 bg-white/5">
          <span className="text-[#A9A9A9] text-sm font-medium">
            Total Games
          </span>
          <p className="text-2xl font-bold">{totalGames}</p>
        </section>

        <section className="flex flex-col gap-2 rounded-xl p-4 bg-white/5">
          <span className="text-[#A9A9A9] text-sm font-medium">Win Streak</span>
          <p className="text-2xl font-bold">{winStreak}</p>
        </section>

        <section className="flex flex-col gap-2 rounded-xl p-4 bg-white/5">
          <span className="text-[#A9A9A9] text-sm font-medium">Win Rate</span>
          <p className="text-2xl font-bold">{winRate}%</p>
        </section>

        <section className="flex flex-col gap-2 items-center rounded-xl p-4 bg-white/5">
          <span className="text-[#A9A9A9] text-sm font-medium">W/L Ratio</span>
          {/* <p className="text-2xl font-bold">Circle</p> */}
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
              <span className="text-white text-sm font-bold">
                {WLRatio.win}W
              </span>
              <span className="text-gray-400 text-[10px]">{WLRatio.loss}L</span>
            </div>
          </div>
        </section>
      </main>
    </main>
  );
};

export default StatsCard;
