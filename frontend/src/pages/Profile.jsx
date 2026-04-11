import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import Button from '../components/ui/Button';
import { User, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    avatar: '',
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.username) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/users/${user.username}`);

        setProfileData({
          username: res.data.user.username || '',
          bio: res.data.user.bio || '',
          avatar: res.data.user.avatar || '',
        });
      } catch (err) {
        console.error(err);

        setProfileData({
          username: user.username || '',
          bio: user.bio || '',
          avatar: user.avatar || '',
        });

        setStatus({
          type: 'error',
          msg: t('profile.loadError', 'Failed to load profile.'),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, t]);

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: '', msg: '' });

    try {
      const res = await api.put('/users/profile', {
        bio: profileData.bio,
        avatar: profileData.avatar,
      });

      const updatedUser = res.data.user;

      localStorage.setItem('user', JSON.stringify(updatedUser));

      setProfileData({
        username: updatedUser.username || '',
        bio: updatedUser.bio || '',
        avatar: updatedUser.avatar || '',
      });

      setStatus({
        type: 'success',
        msg: t('profile.success', 'Profile updated successfully.'),
      });

      setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        msg: t('profile.error', 'Failed to update profile.'),
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="rounded-3xl border border-slate-100 bg-white px-6 py-4 shadow-sm">
          <p className="font-bold text-slate-600">
            {t('profile.loading', 'Loading profile...')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 justify-center bg-slate-50/50 px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-10 shadow-sm">
          <div className="absolute right-0 top-0 p-8 opacity-5">
            <User className="h-48 w-48" />
          </div>

          <div className="relative z-10 mb-10 flex flex-col items-center border-b border-slate-100 pb-10">
            <div className="mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-indigo-100 text-4xl font-black text-indigo-600 shadow-lg">
              {profileData.avatar ? (
                <img
                  src={profileData.avatar}
                  className="h-full w-full object-cover"
                  alt="Avatar"
                />
              ) : (
                (profileData.username?.charAt(0)?.toUpperCase() || 'U')
              )}
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-800">
              {t('profile.title', 'Profile')}
            </h1>
            <p className="font-medium text-slate-500">
              {t('profile.desc', 'Manage your creator profile')}
            </p>
          </div>

          <div className="relative z-10 mx-auto max-w-md space-y-6">
            {status.msg && (
              <div
                className={`flex items-center gap-3 rounded-2xl p-4 text-sm font-bold ${
                  status.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                {status.msg}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {t('profile.username', 'Username')}
              </label>
              <input
                type="text"
                className="w-full cursor-not-allowed rounded-xl border-0 bg-slate-100 px-4 py-3 font-bold text-slate-500 outline-none"
                value={profileData.username}
                disabled
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {t('profile.avatar', 'Avatar URL')}
              </label>
              <input
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                placeholder="https://..."
                value={profileData.avatar}
                onChange={(e) =>
                  setProfileData({ ...profileData, avatar: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {t('profile.bio', 'Bio')}
              </label>
              <textarea
                className="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-all focus:ring-2 focus:ring-indigo-500"
                placeholder={t(
                  'profile.bioPlaceholder',
                  'Write something about yourself...'
                )}
                value={profileData.bio}
                onChange={(e) =>
                  setProfileData({ ...profileData, bio: e.target.value })
                }
              />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3.5 text-base shadow-indigo-100"
              >
                {saving
                  ? t('profile.saving', 'Saving...')
                  : t('profile.save', 'Save Changes')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}