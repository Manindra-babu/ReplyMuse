import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { KeyRound, Check } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { authApi } from '../services/auth';
import { useToast } from '../context/ToastContext';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { error, success } = useToast();

  const [token, setToken] = useState(tokenFromUrl);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      error('Reset token is required.');
      return;
    }

    if (newPassword.length < 8) {
      error('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, newPassword);
      success('Password successfully reset! Please sign in with your new password.');
      navigate('/login');
    } catch (err: any) {
      error(err.message || 'Token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <div className="bg-white border border-[#E5DFD3] rounded-3xl p-8 shadow-soft space-y-6">
        <div className="text-center space-y-2">
          <div className="w-11 h-11 rounded-2xl bg-[#1F7A5C] flex items-center justify-center text-white mx-auto shadow-xs">
            <KeyRound className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#2B2B2B]">
            Choose a New Password
          </h1>
          <p className="text-xs text-[#7A7468] font-sans">
            Enter your verification token and your new secure password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Reset Token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste reset token"
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            loading={loading}
            icon={<Check className="w-4 h-4 text-white" />}
          >
            Update Password
          </Button>

          <div className="text-center pt-2">
            <Link to="/login" className="text-xs text-[#7A7468] hover:text-[#1F7A5C] underline font-sans">
              Cancel and return to sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
