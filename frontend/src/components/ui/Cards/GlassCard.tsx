interface CardInfo {
  gameName: string;
  winLoss: string;
  highestScore: string;
}

const Card = ({ gameName, winLoss, highestScore }: CardInfo) => {
  return (
    <div className="flex flex-col gap-4 bg-white/5 backdrop-blur-[10px] border border-white/10 rounded-xl p-6 text-white w-100 h-60">
      <h3 className="mb-5 text-lg font-semibold">Your {gameName} Stats</h3>

      <div className="flex justify-between items-center mb-4">
        <span className="text-slate-400 text-sm">Win/Loss Ratio</span>
        <span className="font-bold text-base">{winLoss}</span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <span className="text-slate-400 text-sm">Highest Score</span>
        <span className="font-bold text-base">{highestScore}</span>
      </div>

      {/* <Link
        to="/profile/1"
        className="inline-block mt-2 text-blue-500 no-underline text-sm hover:underline"
      >
        View full stats on profile →
      </Link> */}
    </div>
  );
};

export default Card;
