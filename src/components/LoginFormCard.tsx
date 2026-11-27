import React from 'react';
import { soundEngine } from '../utils/audio';

export interface LoginFormCardProps {
  authMode: 'login' | 'signup' | 'verify_otp' | 'unlock';
  setAuthMode: (mode: 'login' | 'signup' | 'verify_otp' | 'unlock') => void;
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (pwd: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  rememberPassword: boolean;
  setRememberPassword: (remember: boolean) => void;
  errorMessage: string | null;
  setErrorMessage: (msg: string | null) => void;
  successMessage: string | null;
  setSuccessMessage: (msg: string | null) => void;
  isLoading: boolean;
  handleLoginSubmit: (e: React.FormEvent) => void;
  handleSignUpSubmit: (e: React.FormEvent) => void;
  handleVerifyOtpSubmit: (e: React.FormEvent) => void;
  handleUnlockSubmit: (e: React.FormEvent) => void;
  handleQuickSocial: (provider: string) => void;
  setShowGooglePicker: (show: boolean) => void;
  pendingConfirmationEmail: string;
  otpDigits: string[];
  otpRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  handleOtpChange: (index: number, value: string) => void;
  handleOtpKeyDown: (index: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleOtpPaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  isVerifyingOtp: boolean;
  resendCooldown: number;
  isResending: boolean;
  handleResendOtpCode: () => void;
  lockedEmail: string;
  setLockedEmail: (email: string) => void;
  resetNewPassword: string;
  setResetNewPassword: (pwd: string) => void;
}

export const LoginFormCard: React.FC<LoginFormCardProps> = ({
  authMode,
  setAuthMode,
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  rememberPassword,
  setRememberPassword,
  errorMessage,
  setErrorMessage,
  successMessage,
  setSuccessMessage,
  isLoading,
  handleLoginSubmit,
  handleSignUpSubmit,
  handleVerifyOtpSubmit,
  handleUnlockSubmit,
  handleQuickSocial,
  setShowGooglePicker,
  pendingConfirmationEmail,
  otpDigits,
  otpRefs,
  handleOtpChange,
  handleOtpKeyDown,
  handleOtpPaste,
  isVerifyingOtp,
  resendCooldown,
  isResending,
  handleResendOtpCode,
  lockedEmail,
  setLockedEmail,
  resetNewPassword,
  setResetNewPassword,
}) => {
  return (
    <div className="bg-white rounded-[28px] border border-slate-200/90 p-7 sm:p-9 shadow-lg shadow-slate-900/5 relative">
      {/* Title */}
      <h2 className="text-center font-extrabold text-2xl sm:text-[26px] text-[#0F172A] mb-6 tracking-tight">
        {authMode === 'login' && 'Login'}
        {authMode === 'signup' && 'Register'}
        {authMode === 'verify_otp' && 'Verify OTP'}
        {authMode === 'unlock' && 'Reset Password'}
      </h2>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 font-medium">
          <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">error</span>
          <div className="flex-1">{errorMessage}</div>
        </div>
      )}

      {/* Success Banner */}
      {successMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2 font-medium">
          <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">check_circle</span>
          <div className="flex-1">{successMessage}</div>
        </div>
      )}

      {/* MODE 1: LOGIN */}
      {authMode === 'login' && (
        <form onSubmit={handleLoginSubmit} noValidate>
          {/* Email input: Emerald border, emerald person icon matching project brand */}
          <div className="relative flex items-center rounded-2xl border-2 border-[#10B981] bg-white px-4 py-3 shadow-xs transition-all focus-within:ring-3 focus-within:ring-[#10B981]/15 mb-3.5">
            <span className="material-symbols-outlined text-[20px] text-[#10B981] mr-3 shrink-0">
              person
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="praveenlp45@gmail.com"
              className="w-full text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Password input: soft gray container, lock icon */}
          <div className="relative flex items-center rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200/90 focus-within:border-[#10B981] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#10B981]/15 transition-all mb-3.5">
            <span className="material-symbols-outlined text-[20px] text-slate-400 mr-3 shrink-0">
              lock
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none bg-transparent pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-[#0F172A] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {/* Remember Password & Forget Password */}
          <div className="flex items-center justify-between text-xs sm:text-[13px] mb-6">
            <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none font-medium">
              <input
                type="checkbox"
                checked={rememberPassword}
                onChange={(e) => setRememberPassword(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-[#10B981] focus:ring-[#10B981] accent-[#10B981] cursor-pointer"
              />
              <span>Remember Password</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setAuthMode('unlock');
                setLockedEmail(email);
                setErrorMessage(null);
              }}
              className="text-[#0F172A] font-bold hover:text-[#10B981] cursor-pointer"
            >
              Forget Password?
            </button>
          </div>

          {/* Midnight Slate Action Button matching project navbar & actions */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-sm sm:text-base py-3.5 rounded-2xl transition duration-150 shadow-md shadow-slate-900/10 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Login'
            )}
          </button>

          {/* Switch to Register */}
          <p className="text-center text-xs text-slate-400 mt-4 font-normal">
            No account yet?{' '}
            <button
              type="button"
              onClick={() => {
                setAuthMode('signup');
                setErrorMessage(null);
                setSuccessMessage(null);
                soundEngine.playCoinSound();
              }}
              className="text-[#10B981] font-bold underline hover:text-emerald-700 ml-1 cursor-pointer"
            >
              Register
            </button>
          </p>

          {/* Or Login With Divider */}
          <p className="text-center text-xs text-slate-400 my-4 font-normal tracking-wide">
            Or Login With:
          </p>

          {/* 4 Social Buttons */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            {/* Apple */}
            <button
              type="button"
              onClick={() => handleQuickSocial('Apple')}
              title="Sign in with Apple"
              className="w-12 h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition shadow-2xs hover:border-slate-300 cursor-pointer group"
            >
              <svg className="w-5 h-5 fill-[#0F172A] group-hover:scale-105 transition" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.64 1.35-.57.65-1.07 1.72-.94 2.74 1.01.08 2.04-.49 2.66-1.24z" />
              </svg>
            </button>

            {/* Twitter */}
            <button
              type="button"
              onClick={() => handleQuickSocial('Twitter')}
              title="Sign in with Twitter"
              className="w-12 h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition shadow-2xs hover:border-slate-300 cursor-pointer group"
            >
              <svg className="w-5 h-5 fill-[#1DA1F2] group-hover:scale-105 transition" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.936 9.936 0 0024 4.59z" />
              </svg>
            </button>

            {/* Facebook */}
            <button
              type="button"
              onClick={() => handleQuickSocial('Facebook')}
              title="Sign in with Facebook"
              className="w-12 h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition shadow-2xs hover:border-slate-300 cursor-pointer group"
            >
              <svg className="w-5 h-5 fill-[#1877F2] group-hover:scale-105 transition" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </button>

            {/* Google */}
            <button
              type="button"
              onClick={() => setShowGooglePicker(true)}
              title="Sign in with Google"
              className="w-12 h-12 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 flex items-center justify-center transition shadow-2xs hover:border-slate-300 cursor-pointer group"
            >
              <svg className="w-5 h-5 group-hover:scale-105 transition" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </button>
          </div>
        </form>
      )}

      {/* MODE 2: REGISTER / SIGN UP */}
      {authMode === 'signup' && (
        <form onSubmit={handleSignUpSubmit}>
          {/* Name */}
          <div className="relative flex items-center rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200/90 focus-within:border-[#10B981] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#10B981]/15 transition-all mb-3">
            <span className="material-symbols-outlined text-[20px] text-slate-400 mr-3 shrink-0">
              person
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full Name"
              className="w-full text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Email */}
          <div className="relative flex items-center rounded-2xl border-2 border-[#10B981] bg-white px-4 py-3 shadow-xs transition-all focus-within:ring-3 focus-within:ring-[#10B981]/15 mb-3">
            <span className="material-symbols-outlined text-[20px] text-[#10B981] mr-3 shrink-0">
              mail
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          {/* Password */}
          <div className="relative flex items-center rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200/90 focus-within:border-[#10B981] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#10B981]/15 transition-all mb-3">
            <span className="material-symbols-outlined text-[20px] text-slate-400 mr-3 shrink-0">
              lock
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (Min. 6 chars)"
              className="w-full text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none bg-transparent pr-8"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-slate-400 hover:text-[#0F172A] cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {showPassword ? 'visibility_off' : 'visibility'}
              </span>
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative flex items-center rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200/90 focus-within:border-[#10B981] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#10B981]/15 transition-all mb-4">
            <span className="material-symbols-outlined text-[20px] text-slate-400 mr-3 shrink-0">
              lock_reset
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="w-full text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-sm sm:text-base py-3.5 rounded-2xl transition duration-150 shadow-md shadow-slate-900/10 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Register'
            )}
          </button>

          <p className="text-center text-xs text-slate-400 mt-4 font-normal">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
                setSuccessMessage(null);
                soundEngine.playCoinSound();
              }}
              className="text-[#10B981] font-bold underline hover:text-emerald-700 ml-1 cursor-pointer"
            >
              Login
            </button>
          </p>
        </form>
      )}

      {/* MODE 3: OTP VERIFICATION */}
      {authMode === 'verify_otp' && (
        <div>
          <p className="text-center text-xs text-slate-500 mb-5 leading-relaxed">
            We sent a 6-digit confirmation code to{' '}
            <strong className="text-[#0F172A]">{pendingConfirmationEmail || email}</strong>
          </p>

          <form onSubmit={handleVerifyOtpSubmit}>
            <div className="flex justify-between gap-2 mb-5">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  onPaste={idx === 0 ? handleOtpPaste : undefined}
                  className="w-11 h-12 sm:w-12 sm:h-14 text-center font-mono font-bold text-lg sm:text-xl rounded-xl border-2 border-[#10B981] bg-white text-[#0F172A] focus:outline-none focus:ring-3 focus:ring-[#10B981]/20 transition shadow-xs"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifyingOtp}
              className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-sm sm:text-base py-3.5 rounded-2xl transition duration-150 shadow-md shadow-slate-900/10 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isVerifyingOtp ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Verify Code'
              )}
            </button>

            <div className="flex items-center justify-between mt-4 text-xs text-slate-500 font-medium">
              <button
                type="button"
                onClick={handleResendOtpCode}
                disabled={resendCooldown > 0 || isResending}
                className="text-[#10B981] hover:underline font-bold disabled:text-slate-400 cursor-pointer"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className="text-slate-600 hover:text-[#0F172A] hover:underline font-medium cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODE 4: RESET PASSWORD / UNLOCK */}
      {authMode === 'unlock' && (
        <form onSubmit={handleUnlockSubmit}>
          <p className="text-center text-xs text-slate-500 mb-4">
            Enter your email and choose a new password to recover access.
          </p>

          <div className="relative flex items-center rounded-2xl border-2 border-[#10B981] bg-white px-4 py-3 shadow-xs transition-all focus-within:ring-3 focus-within:ring-[#10B981]/15 mb-3">
            <span className="material-symbols-outlined text-[20px] text-[#10B981] mr-3 shrink-0">
              mail
            </span>
            <input
              type="email"
              required
              value={lockedEmail || email}
              onChange={(e) => {
                setLockedEmail(e.target.value);
                setEmail(e.target.value);
              }}
              placeholder="Account Email"
              className="w-full text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          <div className="relative flex items-center rounded-2xl bg-slate-50 px-4 py-3 border border-slate-200/90 focus-within:border-[#10B981] focus-within:bg-white focus-within:ring-3 focus-within:ring-[#10B981]/15 transition-all mb-4">
            <span className="material-symbols-outlined text-[20px] text-slate-400 mr-3 shrink-0">
              lock_reset
            </span>
            <input
              type="password"
              required
              value={resetNewPassword}
              onChange={(e) => setResetNewPassword(e.target.value)}
              placeholder="New Password (Min. 6 chars)"
              className="w-full text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-sm sm:text-base py-3.5 rounded-2xl transition duration-150 shadow-md shadow-slate-900/10 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              'Set New Password'
            )}
          </button>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              className="text-xs text-slate-600 hover:text-[#0F172A] hover:underline font-medium cursor-pointer"
            >
              Back to Login
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
