function FindConnections() {
  return (
    <div className="flex flex-col justify-center items-center pt-8 px-4 text-center">
      <div className="relative mb-4">
        <span className="material-symbols-outlined !text-5xl text-white/20">
          groups
        </span>
        <div className="bg-[#16213E] rounded-full size-8 absolute -bottom-0 -right-1 grid place-items-center">
          <span className="material-symbols-outlined text-white/30 !text-2xl">
            search
          </span>
        </div>
      </div>
      <h3 className="text-xs text-white font-bold mb-1">
        Find New Connections
      </h3>
      <p className="text-[10px] text-[#A0A6BD] leading-relaxed">
        Type a username to explore the community
      </p>
    </div>
  );
}

export default FindConnections;
