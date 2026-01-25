import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { SearchBarProps } from '@/types';
import { gsap } from 'gsap';

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => {
  const searchBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery === '2137') {
      document.body.style.backgroundImage = 'url("/papaj.jpg")';
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
    } else {
      document.body.style.backgroundImage = '';
      document.body.style.backgroundSize = '';
      document.body.style.backgroundPosition = '';
    }
  }, [searchQuery]);

  useLayoutEffect(() => {
    if (searchBarRef.current) {
      gsap.fromTo(
        searchBarRef.current,
        {
          opacity: 0,
          y: -30,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          delay: 0.2,
        }
      );
    }
  }, []);

  return (
    <div
      ref={searchBarRef}
      className="w-11/12 md:w-full max-w-[560px] relative
        focus-within:text-neutral-800 dark:focus-within:text-neutral-100
        text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-100 duration-500 transition-colors"
    >
      <div
        className="bg-white/[0.03] dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl px-6 py-0 w-full
            transition-all duration-500 premium-shadow premium-border flex items-center
            focus-within:bg-white/[0.05] dark:focus-within:bg-white/[0.06]"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Szukaj aktów prawnych..."
          className="hover:outline-none focus:outline-none bg-transparent w-full pr-4 py-4 text-inherit placeholder:text-inherit tracking-wide"
          aria-label="Wyszukaj"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-60"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
    </div>
  );
};

export default SearchBar;
