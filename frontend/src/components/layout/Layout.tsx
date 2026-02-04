import { Outlet } from "react-router-dom";

function Layout() {
	return (
		<div>
			<main>
			<Outlet />
			</main>
		</div>
	);
}

export default Layout;