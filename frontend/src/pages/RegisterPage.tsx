import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { BrandMark } from '../components/common/BrandLogo';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage: React.FC = () => {
  const { register, loginWithGoogle } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (credential: string) => {
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      success('Signed in with Google! Let’s set up your business.');
      navigate('/onboarding');
    } catch (err: any) {
      error(err.message || 'Google sign-up failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      error('Please complete all required fields.');
      return;
    }

    if (password.length < 8) {
      error('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password);
      success('Account created successfully! Let’s set up your business.');
      navigate('/onboarding');
    } catch (err: any) {
      error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white border border-[#E5DFD3] rounded-3xl p-8 shadow-soft space-y-6">
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandMark size="lg" className="shadow-xs" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#2B2B2B]">
            Create Your Account
          </h1>
          <p className="text-xs text-[#7A7468] font-sans">
            Start drafting authentic review replies in your unique brand voice
          </p>
        </div>

        {/* Google One-Tap / Button */}
        <div className="space-y-4">
          <GoogleSignInButton
            text="signup_with"
            onSuccess={handleGoogleSuccess}
            onError={(err) => error(err.message || 'Google sign-up failed.')}
            disabled={loading}
          />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E5DFD3] w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#7A7468] font-medium absolute">
              or register with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="owner@yourbusiness.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password (min 8 characters)"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <div className="p-3 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl text-[11px] text-[#7A7468] flex items-start gap-2 font-sans">
            <ShieldCheck className="w-4 h-4 text-[#1F7A5C] shrink-0 mt-0.5" />
            <span>
              By continuing, you agree to our Terms of Service and Privacy Policy. Passwords are cryptographically hashed using Argon2id.
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            icon={<ArrowRight className="w-4 h-4 text-white" />}
          >
            Create Account & Onboard
          </Button>
        </form>

        <div className="pt-4 border-t border-[#E5DFD3] text-center text-xs text-[#7A7468] font-sans">
          <span>Already have an account? </span>
          <Link to="/login" className="font-semibold text-[#1F7A5C] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
