import Avatar from '../../components/ui/Avatar';

interface LeaderboardState {
  me: boolean;
  rank: number;
  avatarPath: string;
  username: string;
  score: number;
}

const LeaderSection = ({
  me,
  rank,
  avatarPath,
  username,
  score,
}: LeaderboardState) => {
  return (
    <main
      className={
        me
          ? 'flex items-center justify-between p-2 rounded-lg bg-white/5 border border-blue-500'
          : 'flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors'
      }
    >
      <section className="flex gap-5 items-center">
        <span
          className={
            me
              ? 'flex items-center justify-center size-5 text-xs bg-[#0D59F233] text-[#0D59F2] font-bold rounded-full'
              : 'text-xs font-bold text-[#A9A9A9]'
          }
        >
          {rank}
        </span>
        <Avatar path={avatarPath} section="chat" />
        <p className="text-white font-medium text-sm">{username}</p>
      </section>
      <section className="flex flex-col items-center">
        <span className="text-white font-bold text-sm">{score}</span>
        <p className="text-[10px] text-[#A9A9A9] uppercase font-semibold">
          WINS
        </p>
      </section>
    </main>
  );
};

export default LeaderSection;
