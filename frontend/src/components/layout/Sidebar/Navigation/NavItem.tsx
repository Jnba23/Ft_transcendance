type NavItemProps = {
	icon: string,
	label: string,
}

function NavItem({ icon, label } : NavItemProps) {
	return (
		<a href="#" className={[
			"flex gap-3 items-center",
			"text-white",
			"hover:bg-white/10",
			"px-3 py-2 rounded-lg",
		].join(' ')}>
			<span className="material-symbols-outlined">
				{icon}
			</span>
			<p className="text-sm font-medium">
				{label}
			</p>
		</a>
	)
}

export default NavItem;