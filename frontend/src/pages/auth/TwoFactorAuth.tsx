import React, { useState, useEffect } from 'react';
import {
  useLocation,
  useNavigate,
  useSearchParams,
  Link,
} from 'react-router-dom';
import { twoFaAPI } from '../../api/2fa.api';
import { useAuth } from '../../context/AuthContext';
import { AxiosError } from 'axios';
import logo from '@assets/logo.png';

function TwoFactorAuth(): React.JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();

  const [tempToken, setTempToken] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const tokenFromState = location.state?.tempToken;
    const tokenFromQuery = searchParams.get('token');

    if (tokenFromState) {
      setTempToken(tokenFromState);
    } else if (tokenFromQuery) {
      setTempToken(tokenFromQuery);
    } else {
      navigate('/login', { replace: true });
    }
  }, [location.state, searchParams, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!tempToken) return;

    if (code.length < 6) {
      setErrorMsg('Please enter a valid 6-digit code.');
      return;
    }

    try {
      setLoading(true);
      await twoFaAPI.authenticate({ code, tempToken });

      await checkAuth();

      localStorage.setItem('auth_sync', Date.now().toString());

      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.data?.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg('Invalid code or session expired. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!tempToken) {
    return <div className="min-h-screen bg-[#101622]"></div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#101622] p-4 font-sans text-[#EFEFEF]">
      <div className="w-full max-w-md bg-[#16213E]/50 border border-white/10 rounded-xl shadow-2xl p-8">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <img src={logo} alt="logo" className="w-24 h-24 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Two-Factor Auth
          </h1>
          <p className="text-white/60 mt-2">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block text-sm font-medium text-white/80 mb-1.5 text-center"
              htmlFor="code"
            >
              Verification Code
            </label>
            <input
              type="text"
              id="code"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              className={`w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-center text-2xl tracking-[0.5em] font-mono text-white placeholder:text-white/20 focus:ring-[#0d59f2] focus:border-[#0d59f2] transition-colors focus:outline-none ${
                errorMsg ? 'border-[#E94560] focus:border-[#E94560]' : ''
              }`}
            />
          </div>

          {errorMsg && (
            <div className="text-[#E94560] bg-[#E94560]/10 p-2 rounded text-sm text-center">
              {errorMsg}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#0d59f2] hover:bg-[#0d59f2]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d59f2] focus:ring-offset-[#101622] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="text-sm font-medium text-white/60 hover:text-white transition-colors"
          >
            Cancel and return to login
          </button>
        </div>

        {/* Legal Links */}
        <div className="mt-8 text-center flex justify-center gap-4 text-xs text-white/40">
          <Link to="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <span>&bull;</span>
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </div>
  );
}

export default TwoFactorAuth;
