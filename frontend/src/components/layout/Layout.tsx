import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Sidebar from './Sidebar/Sidebar';

function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="p-8 flex-10">
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
