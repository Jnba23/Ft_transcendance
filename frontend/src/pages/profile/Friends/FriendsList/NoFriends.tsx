function NoFriends() {
	return (
		<div className="p-2 overflow-y-auto custom-scrollbar max-h-96">
			<div className="flex flex-col items-center p-8 text-center justify-center">
				<div className="text-white/20 mb-4">
					<span className="material-symbols-outlined !text-4xl">
						hub
					</span>
				</div>
				<h3 className="text-white font-bold text-lg mb-2">
					No friends yet
				</h3>
				<p className="text-white/40 text-sm leading-relaxed max-w-50">
					Find players in the directory to build your network!
				</p>
			</div>
		</div>
	)
}

export default NoFriends;