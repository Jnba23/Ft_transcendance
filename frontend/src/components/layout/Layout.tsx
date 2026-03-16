import useAppHydration from '@hooks/useAppHydration';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';
import Sidebar from './Sidebar/Sidebar';
import ErrorAlert from './ErrorAlert/ErrorAlert';

function Layout() {
  useAppHydration();

  return (
    <div className="flex">
      <Sidebar />
      <main className="p-8 flex-10 relative">
        <ErrorAlert />
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
