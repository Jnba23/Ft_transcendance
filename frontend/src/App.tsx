import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import LoginPage from '@pages/auth/LoginPage';
import Dashboard from '@pages/dashboard/Dashboard';
import Profile from '@pages/profile/Profile';
import GamePage from '@pages/game/GamePage';

function App(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/game" element={<GamePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
