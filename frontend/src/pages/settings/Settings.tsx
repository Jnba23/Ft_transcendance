import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI, MyProfileRes } from '../../api/user.api';
import { twoFaAPI } from '../../api/2fa.api';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';

function AlertBox({
  message,
  type,
  onClose,
}: {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors =
    type === 'success'
      ? 'bg-green-500/10 border-green-500/30 text-green-400'
      : 'bg-red-500/10 border-red-500/30 text-red-400';

  return (
    <div
      role="alert"
      className={`${colors} border rounded-lg px-4 py-3 text-sm flex items-center justify-between`}
    >
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-4 hover:opacity-70"
        aria-label="Close alert"
      >
        ✕
      </button>
    </div>
  );
}

function Settings() {
  const { user, checkAuth } = useAuth();

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Back link */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-6">
        {/* -- Section 1: Profile -- */}
        <ProfileSction user={user!} onSaved={checkAuth} />

        {/* -- Section 2: Security (2FA) -- */}
        <SecuritySection
          is2faEnabled={!!user?.is_2fa_enabled}
          onChanged={checkAuth}
        />
      </div>
    </div>
  );
}

export default Settings;

function ProfileSction({
  user,
  onSaved,
}: {
  user: MyProfileRes;
  onSaved: () => Promise<void>;
}) {
  const [username, setUsername] = useState(user.username);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const validateUsername = (value: string): string | null => {
    if (value.length < 4) return 'Username must be at least 4 characters';
    if (value.length > 20) return 'Username must be at most 20 characters';
    if (!/^[a-zA-Z0-9_-]+$/.test(value))
      return 'Username can only contain letters, numbers, underscores and hyphens';
    return null;
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
    setUsernameError(validateUsername(value));
  };
  const [fetchedAvatarUrl, setFetchedAvatarUrl] = useState<string | undefined>(
    undefined
  );

  useEffect(() => {
    if (user.username) setUsername(user.username);
  }, [user.username]);

  useEffect(() => {
    let objectUrl = '';

    const fetchAvatar = async () => {
      if (user.id && user.avatar_url && user.avatar_url.trim() !== '') {
        try {
          const url = await userAPI.getAvatar(user.id);
          setFetchedAvatarUrl(url);
          objectUrl = url;
        } catch {
          setFetchedAvatarUrl(undefined);
        }
      }
    };

    fetchAvatar();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [user.id, user.avatar_url]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError && error.response?.data?.message) {
      return error.response.data.message;
    }
    return 'Something went wrong. Please try again.';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedType = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedType.includes(file.type)) {
      setAlert({
        message: 'Only JPEG, PNG and GIF files are allowed.',
        type: 'error',
      });
    }
    if (file.size > 5 * 1024 * 1024) {
      setAlert({
        message: 'File is too large Maximum size is 5 MB.',
        type: 'error',
      });
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    const usernameChanged = username !== user.username;
    const avatarChanged = avatarFile !== null;

    if (usernameChanged) {
      const error = validateUsername(username);
      if (error) {
        setUsernameError(error);
        return;
      }
    }

    if (!usernameChanged && !avatarChanged) {
      setAlert({ message: 'No changes to save.', type: 'error' });
      return;
    }

    try {
      setSaving(true);

      await userAPI.updateMe({
        username: usernameChanged ? username : undefined,
        avatar: avatarChanged ? avatarFile! : undefined,
      });

      await onSaved();

      setAvatarFile(null);
      setAvatarPreview(null);

      // Notify other tabs to re-fetch the updated user
      localStorage.setItem('auth_sync', Date.now().toString());

      setAlert({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      setAlert({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const displayAvatar = avatarPreview ?? fetchedAvatarUrl;

  return (
    <section aria-labelledby="profile-heading">
      <div className="bg-[#16213E]/50 rounded-xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h2 id="profile-heading" className="text-xl font-bold text-white">
            Profile Settings
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Update your personal information and avatar.
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <div className="px-6 pt-4">
            <AlertBox
              message={alert.message}
              type={alert.type}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSaveProfile} className="divide-y divide-white/10">
          {/* Avatar row */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-6">
            <label className="text-sm font-medium text-white/80 sm:w-1/3">
              Change Avatar
            </label>

            <div className="flex items-center gap-6 flex-1">
              {/* Avatar image */}
              <div className="relative group flex-shrink-0">
                <img
                  src={displayAvatar}
                  alt="Your avatar"
                  className="size-20 rounded-full object-cover border-2 border-[#0d59f2]/50"
                />
                {/* Hover overlay to click and upload
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className=""
                                >
                                    📷
                                </button> */}
              </div>

              {/* Upload / Reset buttons */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 text-xs font-semibold bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  Upload New
                </button>
                <p className="text-[10px] text-white/50">
                  JPEG, GIF or PNG. Max size 5 MB.
                </p>
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Username row */}
          <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
            <label
              htmlFor="username"
              className="text-sm font-medium text-white/80 sm:w-1/3"
            >
              Username
            </label>
            <div className="flex-1">
              <input
                id="username"
                type="text"
                value={username}
                onChange={handleUsernameChange}
                maxLength={20}
                className={`w-full bg-white/5 border rounded-lg py-2 px-3 text-white placeholder:text-white/50 text-sm focus:outline-none transition-colors ${
                  usernameError
                    ? 'border-red-500/50 focus:border-red-500'
                    : 'border-white/10 focus:ring-[#0d59f2] focus:border-[#0d59f2]'
                }`}
                placeholder="Enter your username"
              />
              {usernameError && (
                <p className="mt-1.5 text-xs text-red-400">{usernameError}</p>
              )}
              <p className="mt-1 text-[10px] text-white/40">
                4–20 characters. Letters, numbers, underscores and hyphens only.
              </p>
            </div>
          </div>

          {/* Save button */}
          <div className="p-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#0d59f2] rounded-lg hover:bg-[#0d59f2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}

function SecuritySection({
  is2faEnabled,
  onChanged,
}: {
  is2faEnabled: boolean;
  onChanged: () => Promise<void>;
}) {
  const [showSetup, setShowSetup] = useState(false);
  const [showDisable, setShowDisable] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const resetState = () => {
    setShowSetup(false);
    setShowDisable(false);
    setQrCode('');
    setSecret('');
    setCode('');
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError && error.response?.data?.message)
      return error.response.data.message;
    return 'Something went wrong. Please try again.';
  };

  // ── Enable flow: Step 1 – generate QR ──
  const handleStartSetup = async () => {
    try {
      setLoading(true);
      const res = await twoFaAPI.generate();
      setQrCode(res.data.qrcode);
      setSecret(res.data.secret);
      setAlert(null);
      setShowSetup(true);
    } catch (error) {
      setAlert({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ── Enable flow: Step 2 – verify code & turn on ──
  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length < 6) {
      setAlert({ message: 'Please enter the 6-digit code.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      await twoFaAPI.turnOn({ code });
      await onChanged();
      resetState();
      localStorage.setItem('auth_sync', Date.now().toString());
      setAlert({ message: '2FA has been enabled!', type: 'success' });
    } catch (error) {
      setAlert({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // ── Disable flow ──
  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length < 6) {
      setAlert({ message: 'Please enter the 6‑digit code.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      await twoFaAPI.turnOff({ code });
      await onChanged();
      resetState();
      localStorage.setItem('auth_sync', Date.now().toString());
      setAlert({ message: '2FA has been disabled.', type: 'success' });
    } catch (error) {
      setAlert({ message: getErrorMessage(error), type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section aria-labelledby="security-heading">
      <div className="bg-[#16213E]/50 rounded-xl border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h2 id="security-heading" className="text-xl font-bold text-white">
            Security Settings
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Manage two-factor authentication for extra security.
          </p>
        </div>

        {/* Alert (moved tight under header) */}
        {alert && (
          <div className="px-6 pt-4">
            <AlertBox
              message={alert.message}
              type={alert.type}
              onClose={() => setAlert(null)}
            />
          </div>
        )}

        {/* -- 2FA status line -- */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border-t border-white/10 mt-0">
          <label className="text-sm font-medium text-white/80 sm:w-1/3">
            Two-Factor Authentication
          </label>

          <div className="flex-1 flex items-center gap-4">
            {/* Status badge */}
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                is2faEnabled
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-white/10 text-white/50'
              }`}
            >
              {is2faEnabled ? 'Enabled' : 'Disabled'}
            </span>

            {/* Action button */}
            {!is2faEnabled && !showSetup && (
              <button
                type="button"
                onClick={handleStartSetup}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#0d59f2] rounded-lg hover:bg-[#0d59f2]/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Enable 2FA'}
              </button>
            )}

            {is2faEnabled && !showDisable && (
              <button
                type="button"
                onClick={() => {
                  setShowDisable(true);
                  setCode('');
                  setAlert(null);
                }}
                className="px-4 py-2 text-sm font-semibold text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors"
              >
                Disable 2FA
              </button>
            )}
          </div>
        </div>

        {/* -- Enable 2FA panel (QR + vetify) -- */}
        {showSetup && !is2faEnabled && (
          <div className="mt-6 bg-[#1F2C4A] border border-white/10 rounded-xl p-6 shadow-xl">
            <form
              onSubmit={handleEnable2FA}
              className="flex flex-col items-center text-center gap-6"
            >
              {/* QR Code */}
              {qrCode && (
                <div>
                  <img
                    src={qrCode}
                    alt="Scan this QR code with your authenticator app"
                    className="size-40"
                  />
                </div>
              )}

              {/* Instructions */}
              <div>
                <h4 className="text-white font-semibold mb-2">
                  Scan this QR code with your authenticator app
                </h4>
                <p className="text-xs text-white/50 max-w-xs mx-auto">
                  Use Google Authenticator, Authy, or any TOTP app to scan the
                  code above and link your account.
                </p>
              </div>

              {/* Manual secret (for accessibility) */}
              {secret && (
                <div className="w-full max-w-xs">
                  <p className="text-xs text-white/40 mb-1">
                    Or enter this secret manually:
                  </p>
                  <code className="block bg-black/30 text-white/80 text-xs font-mono p-2 rounded-lg break-all select-all">
                    {secret}
                  </code>
                </div>
              )}

              {/* Code input */}
              <div>
                <div>
                  <label
                    htmlFor="enable-2fa-code"
                    className="block text-xs font-medium text-white/60 mb-2 text-left"
                  >
                    Verification Code
                  </label>
                  <input
                    type="text"
                    id="enable-2fa-code"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    }}
                    placeholder="000000"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-center text-lg tracking-widest font-mono text-white placeholder:text-white/20 focus:ring-[#0d59f2] focus:border-[#0d59f2] focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={resetState}
                    className="flex-1 py-2.5 text-sm font-semibold text-white/70 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || code.length < 6}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-[#0d59f2] rounded-lg hover:bg-[#0d59f2]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#0d59f2]/20"
                  >
                    {loading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* -- Disable 2FA panel */}
        {showDisable && is2faEnabled && (
          <div className="mt-6 bg-[#1F2C4A] border border-white/10 rounded-xl p-6 shadow-xl">
            <form
              onSubmit={handleDisable2FA}
              className="flex flex-col items-center text-center gap-6"
            >
              <div>
                <h4 className="text-white font-semibold mb-2">
                  Disable Two‑Factor Authentication
                </h4>
                <p className="text-xs text-white/50 max-w-sm mx-auto">
                  Enter the 6‑digit code from your authenticator app to confirm
                  disabling 2FA.
                </p>
              </div>

              <div className="w-full max-w-xs flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="disable-2fa-code"
                    className="block text-xs font-medium text-white/60 mb-2 text-left"
                  >
                    Verification Code
                  </label>
                  <input
                    id="disable-2fa-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    placeholder="000000"
                    className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-3 text-center text-lg tracking-widest font-mono text-white placeholder:text-white/20 focus:ring-[#0d59f2] focus:border-[#0d59f2] focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={resetState}
                    className="flex-1 py-2.5 text-sm font-semibold text-white/70 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || code.length < 6}
                    className="flex-1 py-2.5 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-500/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Disabling...' : 'Disable 2FA'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </section>
  );
}
