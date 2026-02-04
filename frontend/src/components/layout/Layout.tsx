import { Outlet } from 'react-router-dom';
import Navbar from './Navbar/Navbar';

function Layout() {
  return (
    <div>
      <main className='p-8'>
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;