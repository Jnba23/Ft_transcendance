import BriefHistory from './BriefHistory/BriefHistory';
import InsightsNav from './InsightsNav';
import Stats from './Stats/Stats';
import { useState } from 'react';

function GameInsights() {
  const PONG = 'Pong';
  const RPS = 'RPS';
  const [section, setSetion] = useState<'Pong' | 'RPS'>(PONG);
  const switchToPong = () => setSetion(PONG);
  const switchToRPS = () => setSetion(RPS);

  return (
    <div className="bg-[#16213E]/50 p-6 rounded-lg border border-white/10">
      <InsightsNav
        section={section}
        switchToPong={switchToPong}
        switchToRPS={switchToRPS}
      />
      <Stats section={section} />
      <BriefHistory section={section} />
    </div>
  );
}

export default GameInsights;
