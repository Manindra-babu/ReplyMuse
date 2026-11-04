import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Shield,
  Lock,
  Trash2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { authApi } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const SettingsPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { error, success } = useToast();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPass, setIsChangingPass] = useState(false);

  // Account deletion modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      error('Please complete all password fields.');
      return;
    }
    if (newPassword.length < 8) {
      error('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      error('New passwords do not match.');
      return;
    }

    setIsChangingPass(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      success('Password successfully changed.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      error(err.message || 'Failed to update password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      error('Please type DELETE to confirm.');
      return;
    }

    setIsDeleting(true);
    try {
      await authApi.deleteAccount();
      await logout();
      success('Your account and all associated data have been permanently erased.');
      navigate('/');
    } catch (err: any) {
      error(err.message || 'Failed to delete account.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="border-b border-[#E5DFD3] pb-4">
        <h1 className="font-serif text-3xl font-bold text-[#2B2B2B] flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-[#1F7A5C]" />
          <span>Account & Privacy Settings</span>
        </h1>
        <p className="text-xs text-[#7A7468] mt-1 leading-relaxed font-sans">
          Manage your login credentials, inspect data processing practices, or permanently delete your account.
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 shadow-soft space-y-4">
        <h2 className="font-serif text-lg font-bold text-[#2B2B2B]">
          Account Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          <div>
            <span className="text-[#7A7468]">Email Address:</span>
            <p className="font-semibold text-[#2B2B2B] text-sm mt-0.5">{user?.email}</p>
          </div>
          <div>
            <span className="text-[#7A7468]">Member Since:</span>
            <p className="font-semibold text-[#2B2B2B] text-sm mt-0.5">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN') : 'Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Security & Password Change */}
      <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 shadow-soft space-y-4">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-[#1F7A5C]" />
          <h2 className="font-serif text-lg font-bold text-[#2B2B2B]">
            Change Password
          </h2>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />

          <Input
            label="New Password"
            type="password"
            placeholder="Min 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" variant="primary" size="md" loading={isChangingPass}>
            Update Password
          </Button>
        </form>
      </div>

      {/* Privacy & AI Data Practices */}
      <div className="bg-white border border-[#E5DFD3] rounded-3xl p-6 sm:p-8 shadow-soft space-y-3 text-xs text-[#2B2B2B] font-sans">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#1F7A5C]" />
          <h2 className="font-serif text-lg font-bold text-[#2B2B2B]">
            Privacy & AI Provider Transparency
          </h2>
        </div>

        <p className="text-[#7A7468] leading-relaxed">
          ReplyMuse protects customer privacy by default:
        </p>

        <ul className="space-y-1.5 list-disc list-inside text-[#7A7468] pl-1 leading-relaxed">
          <li>
            Review text is sent strictly to the inference model (Google Gemini or deterministic provider) to generate responses.
          </li>
          <li>
            Your business voice examples and reviews are stored exclusively in your isolated PostgreSQL database records.
          </li>
          <li>
            We do not share your customer review data with third-party advertisers.
          </li>
          <li>
            Passwords are hashed using industry-standard Argon2id cryptographic parameters.
          </li>
        </ul>
      </div>

      {/* Danger Zone */}
      <div className="bg-[#FDF0ED] border border-[#F9CDC9] rounded-3xl p-6 sm:p-8 shadow-soft space-y-4">
        <div className="flex items-center gap-2 text-[#D9381E]">
          <AlertTriangle className="w-4 h-4" />
          <h2 className="font-serif text-lg font-bold">
            Danger Zone
          </h2>
        </div>

        <p className="text-xs text-[#2B2B2B] leading-relaxed max-w-2xl font-sans">
          Permanently delete your ReplyMuse account. This action will immediately and irreversibly delete your business profile, voice profile, saved examples, reviews, generated drafts, and usage history.
        </p>

        <Button
          variant="danger"
          size="md"
          icon={<Trash2 className="w-4 h-4 text-white" />}
          onClick={() => setDeleteModalOpen(true)}
        >
          Delete Account & All Data
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Permanently Delete Account?"
        description="This action cannot be undone. All business profiles, review drafts, and voice settings will be erased."
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-[#22231F]">
            Please type <strong className="font-mono text-[#D9381E]">DELETE</strong> below to confirm.
          </p>

          <Input
            placeholder="DELETE"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              loading={isDeleting}
              disabled={deleteConfirmText !== 'DELETE'}
              onClick={handleDeleteAccount}
            >
              Permanently Delete Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
