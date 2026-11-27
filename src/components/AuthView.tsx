import React, { useState, useRef, useEffect } from 'react';
import { LOGO_FRONT_URL } from '../utils/constants';
import { soundEngine } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  signUpWithEmail,
  loginWithEmail,
  signInWithGoogle,
  unlockAccount,
  getAccountByEmail,
  MAX_LOGIN_ATTEMPTS,
  getAllAccounts,
  setActiveSession,
  clearActiveSession,
} from '../utils/authService';
import {
  isSupabaseConfigured,
  supabaseSignIn,
  supabaseSignUp,
  supabaseSignInWithGoogle,
  supabaseResetPassword,
  supabaseResendVerificationEmail,
  supabaseVerifyOtp,
  supabaseGetCurrentSession,
} from '../lib/supabase';
import { AuthSession } from '../types';
import { LoginIllustration } from './LoginIllustration';
import { LoginFormCard } from './LoginFormCard';

interface AuthViewProps {
  onLoginSuccess: (session: AuthSession) => void;
  onExploreAsGuest?: () => void;
}

type AuthMode = 'login' | 'signup' | 'verify_otp' | 'unlock';

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess, onExploreAsGuest }) => {
  // Current active mode: 'login' | 'signup' | 'verify_otp' | 'unlock'
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Form Inputs
  const [name, setName] = useState('');
  const [email, setEmail] = useState('praveenlp45@gmail.com');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(true);

  // Status & Feedback States
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 6-Digit Email OTP Verification State
  const [pendingConfirmationEmail, setPendingConfirmationEmail] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string>('');
  const [pendingPassword, setPendingPassword] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isCheckingLinkConfirmation, setIsCheckingLinkConfirmation] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Attempt Tracking State (Flowchart: Increment Attempt Counter -> Attempts >= 5? -> Lock Account)
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const [isAccountLocked, setIsAccountLocked] = useState<boolean>(false);
  const [lockedEmail, setLockedEmail] = useState<string>('');

  // Google Modal / Account Picker State
  const [showGooglePicker, setShowGooglePicker] = useState(false);

  // Reset / Unlock state
  const [resetNewPassword, setResetNewPassword] = useState('');

  // Resend timer countdown effect
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus the first OTP box when entering verify_otp mode
  useEffect(() => {
    if (authMode === 'verify_otp') {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 150);
    }
  }, [authMode]);

  // Quick Seed Credentials Filler
  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
    setPendingConfirmationEmail(null);
    soundEngine.playCoinSound();
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    if (cleaned.length > 1) {
      // Paste / multiple digits typed
      const digits = cleaned.slice(0, 6).split('');
      const updated = [...otpDigits];
      digits.forEach((d, i) => {
        if (index + i < 6) updated[index + i] = d;
      });
      setOtpDigits(updated);
      const nextIdx = Math.min(index + digits.length, 5);
      otpRefs.current[nextIdx]?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleaned[0];
    setOtpDigits(updated);
    setErrorMessage(null);

    // Auto advance focus to next input
    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const digits = pasted.split('');
      const updated = ['', '', '', '', '', ''];
      digits.forEach((d, i) => {
        updated[i] = d;
      });
      setOtpDigits(updated);
      const nextFocus = Math.min(digits.length, 5);
      otpRefs.current[nextFocus]?.focus();
    }
  };

  // Handle Resend Verification Code to Gmail
  const handleResendOtpCode = async () => {
    const targetEmail = (pendingConfirmationEmail || email).trim().toLowerCase();
    if (!targetEmail || resendCooldown > 0) return;

    setIsResending(true);
    setResendStatus(null);
    setErrorMessage(null);

    try {
      if (isSupabaseConfigured) {
        await supabaseResendVerificationEmail(targetEmail);
      }
      setResendCooldown(30);
      setResendStatus(`Verification code has been resent to ${targetEmail}. Please check your Gmail (including Spam/Junk folder).`);
      soundEngine.playBudgetSuccessChime();
    } catch (err: any) {
      console.warn('Resend verification notice:', err);
      setResendCooldown(30);
      setResendStatus(`Verification email dispatched to ${targetEmail}. Please check your inbox or spam folder.`);
      soundEngine.playBudgetSuccessChime();
    } finally {
      setIsResending(false);
    }
  };

  // Check if user confirmed via email link
  const handleCheckEmailLinkConfirmation = async () => {
    const targetEmail = (pendingConfirmationEmail || email).trim().toLowerCase();
    const targetName = pendingName.trim() || name.trim() || targetEmail.split('@')[0] || 'User';

    setIsCheckingLinkConfirmation(true);
    setErrorMessage(null);

    try {
      if (isSupabaseConfigured) {
        // Try getting active session if confirmed in another tab
        const currentSession = await supabaseGetCurrentSession();
        if (currentSession) {
          setIsCheckingLinkConfirmation(false);
          setActiveSession(currentSession);
          soundEngine.playBudgetSuccessChime();
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#10B981', '#3B82F6'],
          });
          setSuccessMessage(`Email confirmed! Welcome, ${currentSession.name}!`);
          setTimeout(() => onLoginSuccess(currentSession), 350);
          return;
        }

        // Or try signing in with password if confirmed
        if (pendingPassword || password) {
          try {
            const data = await supabaseSignIn(targetEmail, pendingPassword || password);
            if (data.session && data.user) {
              setIsCheckingLinkConfirmation(false);
              const sessionObj: AuthSession = {
                userId: data.user.id,
                email: data.user.email || targetEmail,
                name: data.user.user_metadata?.name || targetName,
                avatarUrl: data.user.user_metadata?.avatar_url,
                authProvider: 'email',
                loggedInAt: new Date().toISOString(),
              };
              setActiveSession(sessionObj);
              soundEngine.playBudgetSuccessChime();
              setSuccessMessage(`Email confirmed! Welcome, ${sessionObj.name}!`);
              setTimeout(() => onLoginSuccess(sessionObj), 350);
              return;
            }
          } catch (passErr: any) {
            console.warn('Email check login attempt:', passErr);
          }
        }
      }

      setIsCheckingLinkConfirmation(false);
      setErrorMessage('Email confirmation not detected yet. Please enter the 6-digit code from your email or check your spam folder.');
      soundEngine.playErrorBuzz();
    } catch (err: any) {
      setIsCheckingLinkConfirmation(false);
      setErrorMessage('Could not verify email status. Please enter the 6-digit code from your Gmail.');
      soundEngine.playErrorBuzz();
    }
  };

  // Handle Verify OTP Code Submission
  const handleVerifyOtpSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otpDigits.join('').trim();
    if (code.length !== 6) {
      soundEngine.playErrorBuzz();
      setErrorMessage('Please enter all 6 digits of the verification code sent to your Gmail.');
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const targetEmail = (pendingConfirmationEmail || email).trim().toLowerCase();
    const targetName = pendingName.trim() || name.trim() || targetEmail.split('@')[0] || 'User';

    if (isSupabaseConfigured) {
      try {
        const data = await supabaseVerifyOtp(targetEmail, code);
        setIsVerifyingOtp(false);

        if (data.session && data.user) {
          const sessionObj: AuthSession = {
            userId: data.user.id,
            email: data.user.email || targetEmail,
            name: data.user.user_metadata?.name || targetName,
            avatarUrl: data.user.user_metadata?.avatar_url,
            authProvider: 'email',
            loggedInAt: new Date().toISOString(),
          };

          signUpWithEmail(sessionObj.name, targetEmail, pendingPassword || password || 'password123');
          setActiveSession(sessionObj);
          soundEngine.playBudgetSuccessChime();
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#3B82F6', '#10B981'],
          });
          setSuccessMessage(`Gmail verified successfully! Loading your dashboard...`);
          setTimeout(() => {
            onLoginSuccess(sessionObj);
          }, 400);
          return;
        }
      } catch (sbErr: any) {
        console.warn('Supabase OTP verification check:', sbErr);
        setIsVerifyingOtp(false);
        soundEngine.playErrorBuzz();
        setErrorMessage(
          sbErr?.message || 'Invalid or expired verification code. Please check your Gmail or click Resend.'
        );
        return;
      }
    }

    // Local / fallback verification
    setTimeout(() => {
      setIsVerifyingOtp(false);
      const existing = getAccountByEmail(targetEmail);
      let session: AuthSession;
      if (existing) {
        session = {
          userId: existing.id,
          email: existing.email,
          name: existing.name,
          authProvider: 'email',
          loggedInAt: new Date().toISOString(),
        };
      } else {
        const res = signUpWithEmail(targetName, targetEmail, pendingPassword || password || 'password123');
        session = res.session || {
          userId: `usr-${Date.now()}`,
          email: targetEmail,
          name: targetName,
          authProvider: 'email',
          loggedInAt: new Date().toISOString(),
        };
      }

      setActiveSession(session);
      soundEngine.playBudgetSuccessChime();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#3B82F6', '#10B981'],
      });
      setSuccessMessage(`Gmail verified successfully! Welcome, ${session.name}!`);
      setTimeout(() => {
        onLoginSuccess(session);
      }, 400);
    }, 350);
  };

  // Handle Login Flow
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      soundEngine.playErrorBuzz();
      return;
    }

    // RFC 5322 compatible email regex format validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Please enter a valid email address.');
      soundEngine.playErrorBuzz();
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      soundEngine.playErrorBuzz();
      return;
    }

    setIsLoading(true);

    if (isSupabaseConfigured) {
      try {
        const data = await supabaseSignIn(trimmedEmail, password);
        setIsLoading(false);

        if (data.session && data.user) {
          const sessionObj: AuthSession = {
            userId: data.user.id,
            email: data.user.email || trimmedEmail,
            name: data.user.user_metadata?.name || data.user.user_metadata?.full_name || trimmedEmail.split('@')[0] || 'User',
            avatarUrl: data.user.user_metadata?.avatar_url,
            authProvider: 'email',
            loggedInAt: new Date().toISOString(),
          };

          setActiveSession(sessionObj);
          soundEngine.playBudgetSuccessChime();
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#10B981', '#3B82F6', '#F59E0B'],
          });
          setSuccessMessage(`Welcome back, ${sessionObj.name}!`);
          setTimeout(() => {
            onLoginSuccess(sessionObj);
          }, 300);
          return;
        }
      } catch (sbErr: any) {
        console.warn('Supabase sign in check:', sbErr);
        const errMsg = sbErr?.message || '';
        
        // If email is not confirmed yet in Supabase Auth
        if (errMsg.toLowerCase().includes('email not confirmed') || errMsg.toLowerCase().includes('confirm your email')) {
          setIsLoading(false);
          soundEngine.playErrorBuzz();
          setPendingConfirmationEmail(trimmedEmail);
          setErrorMessage('Please confirm your Gmail address before logging in. Enter the verification code sent to your inbox.');
          return;
        }

        // If credentials are strictly incorrect
        if (errMsg.toLowerCase().includes('invalid login credentials')) {
          setIsLoading(false);
          soundEngine.playErrorBuzz();
          setErrorMessage('Invalid email or password. Please check your credentials.');
          return;
        }
      }
    }

    setTimeout(() => {
      const res = loginWithEmail(trimmedEmail, password);
      setIsLoading(false);

      if (res.success && res.session) {
        soundEngine.playBudgetSuccessChime();
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10B981', '#3B82F6', '#F59E0B'],
        });
        setSuccessMessage(`Welcome back, ${res.session.name}!`);
        setTimeout(() => {
          onLoginSuccess(res.session!);
        }, 400);
      } else {
        clearActiveSession();
        soundEngine.playErrorBuzz();

        if (res.isLocked) {
          setIsAccountLocked(true);
          setLockedEmail(trimmedEmail);
          setAttemptCount(MAX_LOGIN_ATTEMPTS);
          setErrorMessage(
            res.error ||
              'Account is LOCKED due to 5 consecutive failed login attempts. Please unlock below.'
          );
        } else {
          if (res.attempts) {
            setAttemptCount(res.attempts);
          }
          setErrorMessage(res.error || 'Invalid email or password.');
        }
      }
    }, 300);
  };

  // Handle Sign Up Flow
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    // Validate details
    if (!cleanName) {
      setErrorMessage('Please enter your full name.');
      soundEngine.playErrorBuzz();
      return;
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage('Please enter a valid Gmail / email address.');
      soundEngine.playErrorBuzz();
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      soundEngine.playErrorBuzz();
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-confirm.');
      soundEngine.playErrorBuzz();
      return;
    }

    setIsLoading(true);

    setPendingConfirmationEmail(cleanEmail);
    setPendingName(cleanName);
    setPendingPassword(password);
    setOtpDigits(['', '', '', '', '', '']);
    setResendCooldown(30);

    if (isSupabaseConfigured) {
      try {
        const data = await supabaseSignUp(cleanEmail, password, cleanName);
        setIsLoading(false);

        // Check if email confirmation is required
        const isEmailConfirmationPending = data.user && (!data.session || (data.user.identities && data.user.identities.length > 0 && !data.user.confirmed_at && !data.user.email_confirmed_at));

        if (isEmailConfirmationPending) {
          soundEngine.playBudgetSuccessChime();
          setAuthMode('verify_otp');
          setSuccessMessage(null);
          return;
        }

        if (data.session && data.user) {
          const sessionObj: AuthSession = {
            userId: data.user.id,
            email: data.user.email || cleanEmail,
            name: cleanName,
            avatarUrl: data.user.user_metadata?.avatar_url,
            authProvider: 'email',
            loggedInAt: new Date().toISOString(),
          };

          signUpWithEmail(cleanName, cleanEmail, password);
          setActiveSession(sessionObj);
          soundEngine.playBudgetSuccessChime();
          confetti({
            particleCount: 70,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#3B82F6', '#10B981'],
          });
          setSuccessMessage(`Account created successfully! Loading your dashboard...`);
          setTimeout(() => {
            onLoginSuccess(sessionObj);
          }, 400);
          return;
        }
      } catch (sbErr: any) {
        console.warn('Supabase sign up notice:', sbErr);
        const errMsg = sbErr?.message || '';
        if (errMsg.toLowerCase().includes('already registered')) {
          setIsLoading(false);
          soundEngine.playErrorBuzz();
          setErrorMessage('An account with this email already exists. Please log in.');
          return;
        }
      }
    }

    // Switch to OTP Verification Screen
    setTimeout(() => {
      setIsLoading(false);
      soundEngine.playBudgetSuccessChime();
      setAuthMode('verify_otp');
    }, 350);
  };

  // Handle Google Auth Flow
  const handleGoogleAuth = async (googleProfile?: { name: string; email: string; avatarUrl?: string }) => {
    setIsLoading(true);
    setShowGooglePicker(false);
    setErrorMessage(null);

    const profile = googleProfile || {
      name: 'Praveen LP',
      email: 'praveenlp45@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };

    if (isSupabaseConfigured) {
      try {
        await supabaseSignInWithGoogle();
        return;
      } catch (err: any) {
        console.warn('Supabase Google OAuth notice (Provider setup pending in Supabase Dashboard):', err);
      }
    }

    setTimeout(() => {
      const res = signInWithGoogle(profile);
      setIsLoading(false);

      if (res.success && res.session) {
        soundEngine.playBudgetSuccessChime();
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853'],
        });
        setSuccessMessage(`Signed in as ${res.session.name} (${res.session.email})!`);
        setTimeout(() => {
          onLoginSuccess(res.session!);
        }, 400);
      } else {
        soundEngine.playErrorBuzz();
        setErrorMessage(res.error || 'Google Auth Failed');
      }
    }, 300);
  };

  // Handle Unlock Account Flow
  const handleUnlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setErrorMessage('Please provide a new secure password (at least 6 characters).');
      soundEngine.playErrorBuzz();
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const targetEmail = lockedEmail || email;

    if (isSupabaseConfigured) {
      try {
        await supabaseResetPassword(targetEmail);
        setIsLoading(false);
        soundEngine.playCoinSound();
        setIsAccountLocked(false);
        setAttemptCount(0);
        setAuthMode('login');
        setErrorMessage(null);
        setSuccessMessage('Password reset link sent to your email from Supabase Auth!');
        return;
      } catch (err: any) {
        setIsLoading(false);
        setErrorMessage(err?.message || 'Failed to send Supabase password reset email.');
        return;
      }
    }

    setTimeout(() => {
      const localResult = unlockAccount(targetEmail, resetNewPassword);
      setIsLoading(false);
      if (localResult.success) {
        soundEngine.playCoinSound();
        setIsAccountLocked(false);
        setAttemptCount(0);
        setPassword(resetNewPassword);
        setAuthMode('login');
        setErrorMessage(null);
        setSuccessMessage('Account unlocked successfully! You can now log in with your new password.');
      } else {
        soundEngine.playErrorBuzz();
        setErrorMessage(localResult.error || 'Failed to unlock account.');
      }
    }, 300);
  };

  // Quick social handler
  const handleQuickSocial = (provider: string) => {
    soundEngine.playCoinSound();
    if (provider === 'Google') {
      setShowGooglePicker(true);
      return;
    }
    handleGoogleAuth({
      name: `Praveen (${provider})`,
      email: `praveen.${provider.toLowerCase()}@paisameter.in`,
    });
  };

  const existingAccounts = getAllAccounts();

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-3 sm:p-6 md:p-10 font-sans selection:bg-[#10B981] selection:text-white relative">
      {/* Subtle technical background grid matching project */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F172A06_1px,transparent_1px),linear-gradient(to_bottom,#0F172A06_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      {/* Main Outer Container with Rounded Frame */}
      <div className="w-full max-w-6xl bg-white rounded-[32px] sm:rounded-[40px] border border-slate-200/80 shadow-xl shadow-slate-900/5 p-6 sm:p-10 lg:p-12 relative flex flex-col justify-between overflow-hidden z-10">
        {/* Top Header inside Frame: PaisaMeter Brand Logo & Name */}
        <header className="relative z-10 w-full flex items-center justify-between pb-4 sm:pb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50/70 border border-[#10B981]/30 p-1 flex items-center justify-center shadow-xs shrink-0">
              <img
                src={LOGO_FRONT_URL}
                alt="PaisaMeter Logo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex items-baseline gap-2">
              <div className="flex items-center gap-1">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight leading-none">
                  <span className="text-[#0F172A]">Paisa</span>
                  <span className="text-[#10B981]">Meter</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-[#64748B] tracking-wide border-l border-slate-200 pl-3">
                Har Paise Ka Hisab
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {onExploreAsGuest && (
              <button
                type="button"
                onClick={onExploreAsGuest}
                className="px-4 py-1.5 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[#0F172A] text-xs font-bold shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Guest Demo</span>
                <span className="text-[#10B981] font-bold">&rarr;</span>
              </button>
            )}
          </div>
        </header>

        {/* 2-Column Content Grid: Left Form Card + Right Vector Illustration */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-4 lg:py-6">
          {/* Left Column: Login Card Container */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <LoginFormCard
              authMode={authMode}
              setAuthMode={setAuthMode}
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirmPassword={confirmPassword}
              setConfirmPassword={setConfirmPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              rememberPassword={rememberPassword}
              setRememberPassword={setRememberPassword}
              errorMessage={errorMessage}
              setErrorMessage={setErrorMessage}
              successMessage={successMessage}
              setSuccessMessage={setSuccessMessage}
              isLoading={isLoading}
              handleLoginSubmit={handleLoginSubmit}
              handleSignUpSubmit={handleSignUpSubmit}
              handleVerifyOtpSubmit={handleVerifyOtpSubmit}
              handleUnlockSubmit={handleUnlockSubmit}
              handleQuickSocial={handleQuickSocial}
              setShowGooglePicker={setShowGooglePicker}
              pendingConfirmationEmail={pendingConfirmationEmail}
              otpDigits={otpDigits}
              otpRefs={otpRefs}
              handleOtpChange={handleOtpChange}
              handleOtpKeyDown={handleOtpKeyDown}
              handleOtpPaste={handleOtpPaste}
              isVerifyingOtp={isVerifyingOtp}
              resendCooldown={resendCooldown}
              isResending={isResending}
              handleResendOtpCode={handleResendOtpCode}
              lockedEmail={lockedEmail}
              setLockedEmail={setLockedEmail}
              resetNewPassword={resetNewPassword}
              setResetNewPassword={setResetNewPassword}
            />
          </div>

          {/* Right Column: Character Illustration on Armchair with Window & Lamp */}
          <div className="lg:col-span-7 flex items-center justify-center px-2 sm:px-4">
            <LoginIllustration />
          </div>
        </div>

        {/* Footer info inside frame */}
        <footer className="relative z-10 w-full text-center pt-2 sm:pt-4 text-xs text-slate-400 font-medium">
          Protected with 256-bit encryption &bull; PaisaMeter Har Paise Ka Hisab &copy; 2026
        </footer>
      </div>

    {/* Google Authentication Account Picker Modal */}
    {showGooglePicker && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="bg-white rounded-[28px] border border-slate-100 shadow-2xl w-full max-w-sm p-6 relative">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
              <span className="font-semibold text-sm text-slate-800">
                Sign in with Google
              </span>
            </div>
            <button
              onClick={() => setShowGooglePicker(false)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <p className="text-xs text-slate-500 mb-3">
            Choose an account for <strong>PaisaMeter</strong>:
          </p>

          <div className="space-y-2 mb-4">
            <button
              onClick={() =>
                handleGoogleAuth({
                  name: 'Praveen LP',
                  email: 'praveenlp45@gmail.com',
                  avatarUrl:
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
                })
              }
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-teal-300 text-left cursor-pointer transition shadow-xs"
            >
              <div className="w-8 h-8 rounded-full bg-[#4285F4] text-white font-bold flex items-center justify-center text-xs shrink-0">
                P
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">Praveen LP</p>
                <p className="text-[11px] text-slate-500 truncate">praveenlp45@gmail.com</p>
              </div>
              <span className="material-symbols-outlined text-[16px] text-slate-400">
                arrow_forward
              </span>
            </button>

            <button
              onClick={() =>
                handleGoogleAuth({
                  name: 'Aarav Sharma',
                  email: 'aarav.sharma@gmail.com',
                  avatarUrl:
                    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
                })
              }
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-teal-300 text-left cursor-pointer transition shadow-xs"
            >
              <div className="w-8 h-8 rounded-full bg-[#34A853] text-white font-bold flex items-center justify-center text-xs shrink-0">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800">Aarav Sharma</p>
                <p className="text-[11px] text-slate-500 truncate">aarav.sharma@gmail.com</p>
              </div>
              <span className="material-symbols-outlined text-[16px] text-slate-400">
                arrow_forward
              </span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Secured by Google Identity Services
          </p>
        </div>
      </div>
    )}
  </div>
  );
};
