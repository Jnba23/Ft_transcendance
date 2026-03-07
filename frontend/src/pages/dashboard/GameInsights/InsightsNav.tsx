type InsightsNavProps = {
  section: 'Pong' | 'RPS';
  switchToPong: () => void;
  switchToRPS: () => void;
};

function InsightsNav({ section, switchToPong, switchToRPS }: InsightsNavProps) {
  const PONG = 'Pong';
  const RPS = 'RPS';

  return (
    <div className="border-b border-white/10 mb-6">
      <nav className="flex gap-6 -mb-px">
        <button
          className={[
            `${
              section === PONG
                ? 'border-primary text-primary font-semibold'
                : `border-transparent text-white/60 hover:border-white/30
						hover:text-white font-medium`
            }`,
            'py-4 px-1 border-b-2 text-sm',
            'transition-all duration-200',
          ].join(' ')}
          onClick={switchToPong}
        >
          Pong
        </button>
        <button
          className={[
            `${
              section === RPS
                ? 'border-primary text-primary font-semibold'
                : `border-transparent text-white/60 hover:border-white/30
						hover:text-white font-medium`
            }`,
            'py-4 px-1 border-b-2 text-sm',
            'transition-all duration-200',
          ].join(' ')}
          onClick={switchToRPS}
        >
          RPS
        </button>
      </nav>
    </div>
  );
}

export default InsightsNav;
