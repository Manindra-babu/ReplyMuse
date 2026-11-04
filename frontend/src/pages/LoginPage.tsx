import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { BrandMark } from '../components/common/BrandLogo';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const { error, success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleGoogleSuccess = async (credential: string) => {
    setLoading(true);
    try {
      await loginWithGoogle(credential);
      success('Signed in with Google successfully!');
      navigate(from, { replace: true });
    } catch (err: any) {
      error(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      success('Welcome back to ReplyMuse Studio!');
      navigate(from, { replace: true });
    } catch (err: any) {
      error(err.message || 'Invalid email or password.');
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
            Sign in to ReplyMuse
          </h1>
          <p className="text-xs text-[#7A7468] font-sans">
            Enter your email and password to access your studio workspace
          </p>
        </div>

        {/* Google One-Tap / Button */}
        <div className="space-y-4">
          <GoogleSignInButton
            text="signin_with"
            onSuccess={handleGoogleSuccess}
            onError={(err) => error(err.message || 'Google sign-in failed.')}
            disabled={loading}
          />

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E5DFD3] w-full" />
            <span className="bg-white px-3 text-[11px] uppercase tracking-wider text-[#7A7468] font-medium absolute">
              or continue with email
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

          <div>
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <div className="text-right mt-1.5">
              <Link
                to="/forgot-password"
                className="text-xs text-[#7A7468] hover:text-[#1F7A5C] underline font-sans"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            icon={<ArrowRight className="w-4 h-4 text-white" />}
          >
            Sign In
          </Button>
        </form>

        <div className="pt-4 border-t border-[#E5DFD3] text-center text-xs text-[#7A7468] font-sans">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-semibold text-[#1F7A5C] hover:underline">
            Register free
          </Link>
        </div>
      </div>
    </div>
  );
};
