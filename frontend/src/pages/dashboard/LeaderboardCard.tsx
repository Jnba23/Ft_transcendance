import LeaderSection from './LeaderSection';
import Boy from '../../assets/boy.jpg';
import Girl from '../../assets/girl.jpg';

const LeaderboardCard = () => {
  return (
    <main className="text-white">
      <h2 className="text-[22px] font-bold mb-6">Top Friends Leaderboard</h2>
      <section className="flex flex-col gap-3">
        <LeaderSection
          me={true}
          rank={1}
          avatarPath={Boy}
          username="CyberNinja"
          score={2450}
        />
        <LeaderSection
          me={false}
          rank={2}
          avatarPath={Girl}
          username="CyberNinja"
          score={2450}
        />
        <LeaderSection
          me={false}
          rank={3}
          avatarPath={Girl}
          username="CyberNinja"
          score={2450}
        />
        <LeaderSection
          me={false}
          rank={4}
          avatarPath={Girl}
          username="CyberNinja"
          score={2450}
        />
      </section>
    </main>
  );
};

export default LeaderboardCard;
