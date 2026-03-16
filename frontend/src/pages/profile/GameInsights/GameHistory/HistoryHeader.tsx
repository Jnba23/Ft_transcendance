import TwoOptionsToggle from '@components/ui/TwoOptionsToggle';

type HistoryHeaderProps = {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setGameType: React.Dispatch<React.SetStateAction<string>>;
  page: number;
  totalPages: number;
};

function HistoryHeader({
  setPage,
  setGameType,
  page,
  totalPages,
}: HistoryHeaderProps) {
  const INITIAL_PAGE = 1;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
        <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
          Game History
        </h3>
        <div className="flex items-center gap-4">
          {/* prev / next */}
          <div className="flex gap-2 items-center">
            <button
              className={[
                'flex items-center justify-center p-2 text-white/70',
                'hover:bg-white/10 hover:text-white transition-colors',
                'rounded-lg border border-white/10',
              ].join(' ')}
              onClick={() => setPage((prev) => (prev - 1 > 1 ? prev - 1 : 1))}
            >
              <span className="material-symbols-outlined !text-base">
                chevron_left
              </span>
              <span className="text-sm font-medium pr-1">Previous</span>
            </button>
            <span className="text-sm font-medium text-white/70 px-1">
              {page} / {totalPages || 1}
            </span>
            <button
              className={[
                'flex items-center justify-center p-2 text-white/70',
                'hover:bg-white/10 hover:text-white transition-colors',
                'rounded-lg border border-white/10',
              ].join(' ')}
              onClick={() =>
                setPage((prev) =>
                  prev + 1 < totalPages ? prev + 1 : totalPages
                )
              }
            >
              <span className="text-sm font-medium pr-1">Next</span>
              <span className="material-symbols-outlined !text-base">
                chevron_right
              </span>
            </button>
          </div>
          {/* two options toggle */}
          <TwoOptionsToggle
            opt1="Pong History"
            opt2="RPS History"
            section="profile"
            onOpt1Select={() => {
              setGameType('pong');
              setPage(INITIAL_PAGE);
            }}
            onOpt2Select={() => {
              setGameType('RPS');
              setPage(INITIAL_PAGE);
            }}
          />
        </div>
      </div>
      <div
        className={[
          'grid grid-cols-4 gap-4 px-4 text-xs font-bold',
          'text-white/60 uppercase tracking-wider mb-2',
        ].join(' ')}
      >
        <span>opponent</span>
        <span className="text-center">date</span>
        <span className="text-center">score</span>
        <span className="text-right">outcome</span>
      </div>
    </div>
  );
}

export default HistoryHeader;
