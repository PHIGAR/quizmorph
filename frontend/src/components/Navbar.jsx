import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Sparkles,
  LogOut,
  User as UserIcon,
  Globe,
  ChevronDown,
  LayoutDashboard,
  FolderOpen,
} from 'lucide-react';
import Button from './ui/Button';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const profileRef = useRef(null);
  const langRef = useRef(null);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const currentLang = i18n.language || localStorage.getItem('lang') || 'en';

  const switchLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('lang', lng);
    setLangOpen(false);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('lang');
    if (savedLang && savedLang !== i18n.language) {
      i18n.changeLanguage(savedLang);
    }
  }, [i18n]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
      if (langRef.current && !langRef.current.contains(event.target)) {
        setLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center space-x-2">
          <div className="rounded-xl bg-indigo-50 p-2 transition-colors group-hover:bg-indigo-100">
            <Sparkles className="h-6 w-6 text-indigo-600" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-900">
            QuizMorph
          </span>
        </Link>

        <div className="flex items-center space-x-4 md:space-x-6">
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-bold text-slate-600 transition-colors hover:text-indigo-600"
            >
              <Globe className="h-4 w-4" />
              <span className="uppercase">{currentLang.substring(0, 2)}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>

            {langOpen && (
              <div className="absolute right-0 top-12 w-32 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-xl shadow-slate-200/50">
                <button
                  onClick={() => switchLanguage('en')}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-colors ${currentLang.startsWith('en')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  English
                </button>
                <button
                  onClick={() => switchLanguage('th')}
                  className={`w-full rounded-xl px-4 py-2.5 text-left text-sm font-bold transition-colors ${currentLang.startsWith('th')
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  ภาษาไทย
                </button>
              </div>
            )}
          </div>

          <Link
            to="/explore"
            className="hidden text-sm font-bold text-slate-600 transition-colors hover:text-indigo-600 sm:block"
          >
            {t('nav.explore', 'Explore')}
          </Link>

          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden text-sm font-bold text-slate-600 transition-colors hover:text-indigo-600 md:block"
              >
                {t('nav.dashboard', 'Dashboard')}
              </Link>

              <div
                className="relative border-l border-slate-200 pl-4 md:pl-6"
                ref={profileRef}
              >
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="group flex items-center gap-2 focus:outline-none"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-transparent bg-indigo-100 text-sm font-black text-indigo-700 transition-all group-hover:scale-105 group-hover:border-indigo-200 group-hover:shadow-md">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        className="h-full w-full rounded-full object-cover"
                        alt="Avatar"
                      />
                    ) : (
                      user?.username?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-2xl shadow-slate-200/50">
                    <div className="mb-2 border-b border-slate-50 px-4 py-3">
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                        Signed in as
                      </p>
                      <p className="truncate font-bold text-slate-800">
                        {user?.username || 'User'}
                      </p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileOpen(false)}
                      className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      {t('nav.dashboard', 'Dashboard')}
                    </Link>

                    <Link
                      to="/my-quizzes"
                      onClick={() => setProfileOpen(false)}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <FolderOpen className="h-4 w-4" />
                      {t('nav.myQuizzes', 'My Quizzes')}
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50 hover:text-indigo-600"
                    >
                      <UserIcon className="h-4 w-4" />
                      {t('nav.profile', 'Profile')}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-bold text-red-500 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      {t('nav.logout', 'Logout')}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="ml-2 flex items-center space-x-3 border-l border-slate-200 pl-4 md:pl-6">
              <Link
                to="/login"
                className="hidden text-sm font-bold text-slate-600 transition-colors hover:text-indigo-600 sm:block"
              >
                {t('nav.login', 'Login')}
              </Link>
              <Link to="/register">
                <Button size="sm" className="shadow-none">
                  {t('nav.register', 'Register')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}