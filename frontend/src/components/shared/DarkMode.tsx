import React from 'react';
import { useUser } from '@clerk/nextjs';
import { DarkModeProps } from '@/types';

const DarkMode = ({ isDarkMode, toggleDarkMode }: DarkModeProps) => {
  const { isSignedIn } = useUser();

  return (
    <div
      className={`cursor-pointer transition-all duration-300  ${
        isDarkMode
          ? 'text-neutral-500 max-sm:text-neutral-400 hover:text-neutral-100 max-sm:fill-neutral-100 fill-neutral-500 hover:fill-neutral-100'
          : 'text-neutral-400 hover:text-neutral-600 fill-neutral-400 hover:fill-neutral-600'
      } ${isSignedIn && 'mb-px'}`}
      onClick={toggleDarkMode}
    >
      {isDarkMode ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height={24}
          width={24}
          viewBox="0 0 256 256"
        >
          <rect fill="none" height="24" width="24" />
          <circle
            cx="128"
            cy="128"
            fill="none"
            r="60"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
          />
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
            x1="128"
            x2="128"
            y1="36"
            y2="28"
          />
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
            x1="62.9"
            x2="57.3"
            y1="62.9"
            y2="57.3"
          />
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
            x1="36"
            x2="28"
            y1="128"
            y2="128"
          />
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
            x1="62.9"
            x2="57.3"
            y1="193.1"
            y2="198.7"
          />
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
            x1="128"
            x2="128"
            y1="220"
            y2="228"
          />
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
            x1="193.1"
            x2="198.7"
            y1="193.1"
            y2="198.7"
          />
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
            x1="220"
            x2="228"
            y1="128"
            y2="128"
          />
          <line
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="12"
            x1="193.1"
            x2="198.7"
            y1="62.9"
            y2="57.3"
          />
        </svg>
      ) : (
        <svg
          height={24}
          width={24}
          id="레이어_1"
          version="1.1"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g id="레이어_7">
            <path
              stroke="currentColor"
              strokeWidth="0.1"
              d="M51.6,82c-17.7,0-32-14.3-32.1-31.9S33.8,18,51.4,18c3.8,0,7.6,0.7,11.2,2c0.6,0.2,1.2,0.7,1.4,1.4c0.3,0.6,0.2,1.4-0.1,2   c-1.9,3.7-2.8,7.9-2.8,12c0,11.4,7.1,21.5,17.8,25.5c0.6,0.2,1.1,0.7,1.4,1.4c0.3,0.6,0.2,1.3-0.1,2C74.9,75.1,63.7,82,51.6,82z    M51.6,22.8c-15,0-27.2,12.2-27.2,27.2c0,15,12.2,27.2,27.2,27.2c9.4,0,18.2-4.9,23.1-12.9C63.5,59,56.3,47.8,56.3,35.4   c0-4,0.8-7.9,2.2-11.6C56.3,23.1,53.9,22.8,51.6,22.8z"
            />
          </g>
        </svg>
      )}
    </div>
  );
};

export default DarkMode;
