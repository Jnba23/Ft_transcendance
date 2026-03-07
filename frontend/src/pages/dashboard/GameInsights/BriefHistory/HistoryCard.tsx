import { GameHistoryItem } from "types/gameHistory";

interface HistoryCardProps {
  name: string;
  history: GameHistoryItem[];
}

const HistoryCard = ({ name, history }: HistoryCardProps) => {
  return (
    <div className="text-white">
      <h2 className="text-[22px] font-bold my-6">Recent {name} History</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center text-[#A9A9A9]">
          <thead className="text-xs text-white uppercase bg-white/5">
            <tr>
              <th className="px-6 py-3 rounded-l" scope="col">
                Opponent
              </th>
              <th className="px-6 py-3" scope="col">
                Date
              </th>
              <th className="px-6 py-3" scope="col">
                score
              </th>
              <th className="px-6 py-3 rounded-r" scope="col">
                Outcome
              </th>
            </tr>
          </thead>
          <tbody className="">
            {history.map((entry, index) => (
              <tr
                key={index}
                className="border-b border-white/10 hover:bg-white/5 transition-colors"
              >
                <td className="px-6 py-3 text-white font-bold">
                  {entry.opponent_name}
                </td>
                <td className="px-6 py-3">{entry.created_at.split(' ')[0]}</td>
                <td className="px-6 py-3">
                  {entry.player1_score}-{entry.player2_score}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      entry.result === 'win'
                        ? 'bg-[#50C87833] text-[#50C878]'
                        : 'bg-red-500/20 text-red-500'
                    }`}
                  >
                    {entry.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryCard;
