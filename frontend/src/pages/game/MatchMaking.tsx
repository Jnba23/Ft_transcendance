import scannerGif from '@assets/scanner.gif';

const MatchMaking = () => {
  return (
    <div className="flex flex-col items-center justify-between w-[calc(100%+4rem)] h-[calc(100vh-7rem)] -mx-8 -mb-8 relative overflow-hidden">
      <div className="absolute bg-[rgba(29,36,60,0.5)] w-[40rem] h-[40rem] rounded-full -bottom-56 -right-40 -z-10"></div>
      <div className="flex flex-col items-center mt-4">
        <h4 className="text-[rgba(0,243,255,0.8)] tracking-[0.2em] font-medium my-4">
          Matchmaking Protocol v2.4
        </h4>
        <span className="text-white/60 text-lg font-light tracking-wide">
          ESTIMATED WAIT TIME: 00 : 45
        </span>
      </div>

      <div className="relative flex flex-col items-center justify-center flex-1">
        <div className="flex gap-5 items-center mb-8">
          <span className="dot w-[15px] h-[15px] rounded-full bg-[rgba(0,243,255,0.8)]"></span>
          <span className="dot w-[15px] h-[15px] rounded-full bg-[rgba(0,243,255,0.8)]"></span>
          <span className="dot w-[15px] h-[15px] rounded-full bg-[rgba(0,243,255,0.8)]"></span>
        </div>

        <div className="relative">
          <img
            src={scannerGif}
            alt="Scanner animation"
            className="w-[30rem] h-[30rem] object-contain"
          />
          <div className="absolute top-[51.5%] left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 text-center">
            <span className="searching text-xl font-medium tracking-[0.3em] text-[rgba(0,243,255,0.9)]">
              SEARCHING
            </span>
            <span className="scanning text-xs font-light tracking-[0.15em] text-white/60">
              SCANNING NETWORK
            </span>
          </div>
        </div>
      </div>

      <button className="cancel-btn flex items-center gap-3 bg-black/10 text-base font-semibold py-3 px-8 border border-[rgba(202,90,90,0.7)] rounded-[9px] text-[rgb(202,90,90)] hover:bg-white/5 hover:shadow-[0_0_20px_rgba(255,23,23,0.764)] z-10 mb-8">
        <span className="material-symbols-outlined btn-icon">close</span> CANCEL
        SEARCH
      </button>
    </div>
  );
};

export default MatchMaking;
