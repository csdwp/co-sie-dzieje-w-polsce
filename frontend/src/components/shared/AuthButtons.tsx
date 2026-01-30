import React, { useState } from 'react';
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs';

const AuthButtons = ({ isDarkMode }: { isDarkMode: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      <SignedOut>
        <div className="relative h-6">
          <button
            aria-label={
              isOpen ? 'Zamknij menu użytkownika' : 'Otwórz menu użytkownika'
            }
            aria-expanded={isOpen}
            className={`cursor-pointer transition-colors duration-300 ${
              isOpen
                ? isDarkMode
                  ? 'text-neutral-100'
                  : 'text-neutral-600'
                : 'text-neutral-400 dark:text-neutral-500'
            }`}
            onClick={toggleMenu}
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
          <SignInButton>
            <button
              className={`cursor-pointer w-max text-sm leading-3.5 absolute ease-out top-0 transition-all duration-300 -z-10 opacity-0 ${
                isDarkMode
                  ? 'text-neutral-500 hover:text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-800'
              }
              ${
                isOpen &&
                'opacity-100 !pointer-events-auto -translate-x-12 translate-y-8 z-0'
              }`}
            >
              Zaloguj się
            </button>
          </SignInButton>
          <SignUpButton>
            <button
              className={`cursor-pointer w-max text-sm leading-3.5 absolute ease-out top-0 transition-all duration-300 -z-10 opacity-0 ${
                isDarkMode
                  ? 'text-neutral-500 hover:text-neutral-100'
                  : 'text-neutral-500 hover:text-neutral-800'
              }
              ${
                isOpen &&
                'opacity-100 !pointer-events-auto -translate-x-[69px] translate-y-14 z-0'
              }`}
            >
              Zarejestruj się
            </button>
          </SignUpButton>
        </div>
      </SignedOut>

      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              userButtonPopoverCard: 'max-sm:!max-w-[70%]',
              userButtonPopoverMain:
                '!bg-neutral-700/10 dark:!bg-neutral-800/40 backdrop-blur-sm dark:!text-neutral-100 !text-neutral-900',
              userButtonPopoverFooter: '!hidden',
              userButtonPopoverActionButton:
                '!text-neutral-600 hover:!text-neutral-900 dark:!text-neutral-500 dark:hover:!text-neutral-100 !transition-all !duration-300',
            },
          }}
        />
      </SignedIn>
    </>
  );
};

export default AuthButtons;
