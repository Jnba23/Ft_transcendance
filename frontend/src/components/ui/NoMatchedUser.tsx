function NoMatchedUser() {
  return (
    <div className="text-center p-12 px-4">
      <span className="material-symbols-outlined text-white/20 !text-4xl mb-3">
        search_off
      </span>
      <h3 className="text-white font-bold text-sm">No users found</h3>
      <p className="text-xs text-[#A0A6BD]">Try a different username</p>
    </div>
  );
}

export default NoMatchedUser;
