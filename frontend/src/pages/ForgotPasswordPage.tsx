import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { authApi } from '../services/auth';
import { useToast } from '../context/ToastContext';

export const ForgotPasswordPage: React.FC = () => {
  const { error } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSubmitted(true);
      if (res.dev_reset_token) {
        setDevToken(res.dev_reset_token);
      }
    } catch (err: any) {
      error(err.message || 'Unable to process request.');
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
            Reset Your Password
          </h1>
          <p className="text-xs text-[#7A7468] font-sans">
            Enter your email to receive recovery instructions
          </p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="p-4 bg-[#DCEBE3]/60 border border-[#BEE0D0] rounded-2xl text-xs text-[#2B2B2B] space-y-2">
              <div className="flex items-center gap-1.5 font-semibold text-[#1F7A5C]">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A5C]" />
                <span>Instructions Dispatched</span>
              </div>
              <p className="leading-relaxed">
                If an account exists with <strong>{email}</strong>, a secure password reset link has been dispatched.
              </p>
            </div>

            {devToken && (
              <div className="p-3 bg-[#FAF8F5] border border-[#E5DFD3] rounded-2xl text-xs space-y-2">
                <span className="text-[11px] font-mono uppercase text-[#EE6A4B] font-bold">
                  Development Mode Helper:
                </span>
                <p className="font-mono text-[11px] break-all text-[#22231F]">{devToken}</p>
                <Link
                  to={`/reset-password?token=${devToken}`}
                  className="inline-block text-xs text-[#009B72] underline font-medium"
                >
                  Proceed to Reset Page with Token →
                </Link>
              </div>
            )}

            <Link to="/login" className="block text-center pt-2">
              <Button variant="secondary" size="md" className="w-full">
                Return to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Account Email"
              type="email"
              placeholder="owner@yourbusiness.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Send Reset Link
            </Button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-[#7A7468] hover:text-[#1F7A5C] font-sans"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
