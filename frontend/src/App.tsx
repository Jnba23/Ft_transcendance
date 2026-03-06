import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@components/layout/Layout';
import LoginPage from '@pages/auth/LoginPage';
import SignupPage from '@pages/auth/SignupPage';
import TwoFactorAuth from '@pages/auth/TwoFactorAuth';
import Dashboard from '@pages/dashboard/Dashboard';
import Profile from '@pages/profile/Profile';
import Settings from '@pages/settings/Settings';
import PongGame from './pages/game/PongGame';
import StartGame from '@pages/game/StartGame';
import MatchMaking from '@pages/game/MatchMaking';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import RPSGame from '@pages/game/RPSGame';
import EndMatch from '@pages/game/EndMatch';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<ProtectedRoute isPublicOnly />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/2fa" element={<TwoFactorAuth />} />
          </Route>

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Wrap protected pages in the Sidebar/Navbar Layout */}
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/start_game/Pong" element={<StartGame />} />
              <Route path="/start_game/Rps" element={<StartGame />} />
              <Route path="/match_making" element={<MatchMaking />} />
              <Route path="/rps/:gameId" element={<RPSGame />} />
              <Route path="/pong/:gameId" element={<PongGame />} />
              {/* <Route path="/rps-test" element={<RPSMatchmakingTest />} /> */}
              <Route path="/end_match" element={<EndMatch />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
