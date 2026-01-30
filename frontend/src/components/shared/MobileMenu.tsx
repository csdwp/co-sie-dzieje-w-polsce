'use client';

import React from 'react';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  useClerk,
  useUser,
} from '@clerk/nextjs';
import Image from 'next/image';

interface MobileMenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
  selectedTypes: string[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const MobileMenu = ({
  isOpen,
  toggleMenu,
  selectedTypes,
  setSelectedTypes,
  isDarkMode,
  toggleDarkMode,
}: MobileMenuProps) => {
  const { openUserProfile, signOut } = useClerk();
  const { user } = useUser();

  const handleManageAccount = () => {
    openUserProfile();
  };

  const handleSignOut = () => {
    signOut();
    toggleMenu();
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      const includesType = prev.includes(type);
      const shouldRemove = includesType && prev.length > 1;

      return shouldRemove
        ? prev.filter(t => t !== type)
        : includesType
          ? prev
          : [...prev, type];
    });
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        aria-label={isOpen ? 'Zamknij menu' : 'Otwórz menu'}
        aria-expanded={isOpen}
        className={`cursor-pointer absolute top-2 left-3 z-50 p-2 rounded-xl transition-all duration-500 ${
          isOpen
            ? 'text-neutral-200]'
            : 'text-neutral-400 dark:text-neutral-500'
        }`}
        onClick={toggleMenu}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          className="w-6 h-6"
        >
          <line
            x1="50"
            y1="170"
            x2={isOpen ? '400' : '450'}
            y2="170"
            stroke="currentColor"
            strokeWidth="28"
            strokeLinecap="round"
            style={{
              transform: isOpen ? 'translateY(85px) rotate(45deg)' : 'none',
              transformOrigin: 'center',
              transition:
                'transform 400ms cubic-bezier(0.4, 0, 0.2, 1), x2 400ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
          <line
            x1="50"
            y1="340"
            x2={isOpen ? '400' : '250'}
            y2="340"
            stroke="currentColor"
            strokeWidth="28"
            strokeLinecap="round"
            style={{
              transform: isOpen ? 'translateY(-85px) rotate(-45deg)' : 'none',
              transformOrigin: 'center',
              transition:
                'transform 400ms cubic-bezier(0.4, 0, 0.2, 1), x2 400ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        </svg>
      </button>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMenu}
      />

      {/* Menu Panel */}
      <div
        className={`fixed top-0 left-0 z-40 w-[85%] max-w-[320px] h-auto max-h-[70vh] rounded-br-3xl bg-white/[0.04] backdrop-blur-xl border border-br-white/[0.06] shadow-2xl transition-all duration-500 ease-out ${
          isOpen
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 -translate-x-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="p-6 pt-16 space-y-6">
          {/* Filter Section */}
          <div className="space-y-4">
            <div className="text-[11px] uppercase tracking-widest text-neutral-500">
              Filtruj według
            </div>
            <div className="flex gap-6 px-1">
              <button
                onClick={() => toggleType('Ustawa')}
                className={`text-[15px] tracking-wide transition-all duration-500 ${
                  selectedTypes.includes('Ustawa')
                    ? 'text-neutral-200 [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.6))]'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Ustawy
              </button>
              <button
                onClick={() => toggleType('Rozporządzenie')}
                className={`text-[15px] tracking-wide transition-all duration-500 ${
                  selectedTypes.includes('Rozporządzenie')
                    ? 'text-neutral-200 [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.6))]'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Rozporządzenia
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Account Section */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-widest text-neutral-500">
              Konto
            </div>
            <SignedOut>
              <div className="flex flex-col gap-2">
                <SignInButton>
                  <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-5 h-5"
                    >
                      <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Zaloguj się</span>
                  </button>
                </SignInButton>
                <SignUpButton>
                  <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 transition-all duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-5 h-5"
                    >
                      <path d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="text-sm font-medium">Zarejestruj się</span>
                  </button>
                </SignUpButton>
              </div>
            </SignedOut>
            <SignedIn>
              <div className="flex flex-col gap-2">
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-2">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt="Avatar"
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/[0.1] flex items-center justify-center text-neutral-400">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className="w-4 h-4"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                  )}
                  <span className="text-sm text-neutral-300">
                    {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
                  </span>
                </div>

                {/* Manage Account */}
                <button
                  onClick={handleManageAccount}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-5 h-5"
                  >
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm font-medium">Zarządzaj kontem</span>
                </button>

                {/* Sign Out */}
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/[0.04] hover:text-red-400 transition-all duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-5 h-5"
                  >
                    <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium">Wyloguj się</span>
                </button>
              </div>
            </SignedIn>
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.06]" />

          {/* Settings Section */}
          <div className="space-y-3">
            <div className="text-[11px] uppercase tracking-widest text-neutral-500">
              Ustawienia
            </div>
            <button
              onClick={toggleDarkMode}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-neutral-400 hover:bg-white/[0.04] hover:text-neutral-200 transition-all duration-300 w-full"
            >
              {isDarkMode ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5"
                >
                  <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-5 h-5"
                >
                  <path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
              <span className="text-sm font-medium">
                {isDarkMode ? 'Tryb jasny' : 'Tryb ciemny'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
