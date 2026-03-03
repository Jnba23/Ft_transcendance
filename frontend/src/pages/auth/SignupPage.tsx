import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authAPI } from '@api/auth.api';
import { Link } from 'react-router-dom';
import { EyeIcon, EyeOffIcon } from '@components/ui/icons/EyeIcons';
import { signupSchema, type SignupFormData } from '@schemas/auth.schema';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';
import logo from '@assets/logo.png';
import { useAuth } from '../../context/AuthContext';

function SignupPage(): React.JSX.Element {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSignUpSubmit = async (data: SignupFormData) => {
    try {
      await authAPI.signup(data);

      await checkAuth();

      localStorage.setItem('auth_sync', Date.now().toString());

      // Success! Redirect the user (Auto-login)
      navigate('/dashboard');
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        // backend sends some thing like: { status: "fail", message: "Email is already taken" }
        const errorMessage = error.response.data.message;

        if (errorMessage.includes('Email')) {
          setError('email', {
            type: 'server',
            message: errorMessage,
          });
        } else if (errorMessage.includes('Username')) {
          setError('username', {
            type: 'server',
            message: errorMessage,
          });
        } else {
          setError('root', {
            type: 'server',
            message: errorMessage || 'Something went wrong. Please try again.',
          });
        }
      } else {
        setError('root', {
          type: 'network',
          message: 'Unable to connect to server. Check your internet.',
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#101622] p-4 font-sans text-[#EFEFEF]">
      <div className="w-full max-w-md bg-[#16213E]/50 border border-white/10 rounded-xl shadow-2xl p-8">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <img alt="logo" src={logo} className="w-24 h-24 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-white/60 mt-2">
            Join the ultimate Pong and RPS community.
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit(onSignUpSubmit)} className="space-y-6">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your unique username"
              className={`w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-white/50 text-sm focus:ring-[#0d59f2] focus:border-[#0d59f2] transition-colors focus:outline-none ${
                errors.username ? 'border-[#E94560] focus:border-[#E94560]' : ''
              }`}
              {...register('username')}
            />
            {errors.username && (
              <p className="text-xs text-[#E94560] mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-white/50 text-sm focus:ring-[#0d59f2] focus:border-[#0d59f2] transition-colors focus:outline-none ${
                errors.email ? 'border-[#E94560] focus:border-[#E94560]' : ''
              }`}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-[#E94560] mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className={`w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-white/50 text-sm focus:ring-[#0d59f2] focus:border-[#0d59f2] transition-colors focus:outline-none ${
                  errors.password
                    ? 'border-[#E94560] focus:border-[#E94560]'
                    : ''
                }`}
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white focus:outline-none"
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {/* Password Hint */}
            <p className="text-[10px] text-white/40 mt-1">
              Minimum 8 characters, 1 number, 1 special character.
            </p>
            {errors.password && (
              <p className="text-xs text-[#E94560] mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                className={`w-full bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-white placeholder:text-white/50 text-sm focus:ring-[#0d59f2] focus:border-[#0d59f2] transition-colors focus:outline-none ${
                  errors.confirmPassword
                    ? 'border-[#E94560] focus:border-[#E94560]'
                    : ''
                }`}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-[#E94560] mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* This acts as the display screen for 'root' errors */}
          {errors.root && (
            <div className="text-[#E94560] bg-[#E94560]/10 p-2 rounded text-sm text-center">
              {errors.root.message}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#0d59f2] hover:bg-[#0d59f2]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0d59f2] focus:ring-offset-[#101622] transition-colors"
            >
              Sign Up
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-white/10"></div>
          <span className="flex-shrink mx-4 text-xs text-white/50 uppercase">
            OR
          </span>
          <div className="flex-grow border-t border-white/10"></div>
        </div>

        {/* Social Auth Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              window.location.href = `${
                import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
              }/oauth/google`;
            }}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-white/10 rounded-lg text-sm font-medium text-white bg-white/5 hover:bg-white/10 transition-colors"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-white/60">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-[#0d59f2] hover:underline"
            >
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;
