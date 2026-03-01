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

const AuthButtons = ({
  isDarkMode,
  isOpen,
  onToggle,
}: {
  isDarkMode: boolean;
  isOpen: boolean;
  onToggle: () => void;
}) => {
  const { openUserProfile, signOut } = useClerk();
  const { user } = useUser();

  const handleManageAccount = () => {
    openUserProfile();
    onToggle();
  };

  const handleSignOut = () => {
    signOut();
    onToggle();
  };

  const backdrop = (
    <div
      className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onToggle}
    />
  );

  const panel = (
    <div
      className={`fixed top-0 right-0 z-40 w-[200px] h-auto rounded-bl-3xl bg-neutral-50 dark:bg-white/[0.04] backdrop-blur-xl border border-black/[0.09] dark:border-white/[0.06] shadow-2xl transition-all duration-500 ease-out ${
        isOpen
          ? 'opacity-100 translate-x-0 scale-100'
          : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
      }`}
    >
      <div className="p-6 pt-16 space-y-4">
        <div className="text-[11px] uppercase tracking-widest text-neutral-500">
          Konto
        </div>
        <div className="flex flex-col gap-3 px-1">
          <SignInButton>
            <button
              className="text-left text-[15px] tracking-wide transition-all duration-500 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              onClick={onToggle}
            >
              Zaloguj się
            </button>
          </SignInButton>
          <SignUpButton>
            <button
              className="text-left text-[15px] tracking-wide transition-all duration-500 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              onClick={onToggle}
            >
              Zarejestruj się
            </button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SignedOut>
        <button
          aria-label={isOpen ? 'Zamknij menu użytkownika' : 'Otwórz menu użytkownika'}
          aria-expanded={isOpen}
          className={`cursor-pointer z-50 relative transition-all duration-300 ${
            isOpen
              ? isDarkMode
                ? 'text-neutral-100 [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.5))]'
                : 'text-neutral-600'
              : 'text-neutral-400 dark:text-neutral-400'
          }`}
          onClick={onToggle}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="21"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        {backdrop}
        {panel}
      </SignedOut>

      <SignedIn>
        <button
          aria-label={isOpen ? 'Zamknij menu konta' : 'Otwórz menu konta'}
          aria-expanded={isOpen}
          onClick={onToggle}
          className="cursor-pointer z-50 relative rounded-full overflow-hidden transition-all duration-300 w-6 h-6 flex items-center justify-center"
        >
          {user?.imageUrl ? (
            <Image
              src={user.imageUrl}
              alt="Avatar"
              width={24}
              height={24}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-white/[0.1] flex items-center justify-center text-neutral-400 text-xs">
              {user?.firstName?.[0] ?? '?'}
            </div>
          )}
        </button>

        {backdrop}

        <div
          className={`fixed top-0 right-0 z-40 w-[200px] h-auto rounded-bl-3xl bg-neutral-50 dark:bg-white/[0.04] backdrop-blur-xl border border-black/[0.09] dark:border-white/[0.06] shadow-2xl transition-all duration-500 ease-out ${
            isOpen
              ? 'opacity-100 translate-x-0 scale-100'
              : 'opacity-0 translate-x-4 scale-95 pointer-events-none'
          }`}
        >
          <div className="p-6 pt-16 space-y-4">
            <div className="text-[11px] uppercase tracking-widest text-neutral-500">
              Konto
            </div>
            <div className="flex flex-col gap-3 px-1">
              <button
                onClick={handleManageAccount}
                className="text-left text-[15px] tracking-wide transition-all duration-500 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Zarządzaj kontem
              </button>
              <button
                onClick={handleSignOut}
                className="text-left text-[15px] tracking-wide transition-all duration-500 text-neutral-500 hover:text-red-400 dark:hover:text-red-400"
              >
                Wyloguj się
              </button>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
};

export default AuthButtons;
