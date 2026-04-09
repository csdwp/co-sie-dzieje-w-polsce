'use client';

import SearchBar from '@/components/shared/SearchBar';
import CardGrid from '@/components/shared/CardGrid';
import Navbar from '@/components/layout/Navbar';
import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { ActsAndKeywordsResponse } from '@/types';

const ClientWrapper = ({
  data,
  initialOpenId,
}: {
  data: ActsAndKeywordsResponse;
  initialOpenId?: number;
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'Ustawa',
    'Rozporządzenie',
  ]);
  const [isNewUser, setIsNewUser] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const key = 'returning_user';
    if (!localStorage.getItem(key)) {
      setIsNewUser(true);
      localStorage.setItem(key, '1');
    }
  }, []);

  useLayoutEffect(() => {
    if (!heroRef.current) return;
    const lines = heroRef.current.querySelectorAll('[data-hero-line]');
    gsap.fromTo(
      lines,
      { opacity: 0, y: 16, scale: 0.97 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 1.1,
        ease: 'power3.out',
        stagger: 0.13,
        delay: 0.05,
        onComplete: () => {
          gsap.set(lines, { clearProps: 'transform,willChange' });
        },
      }
    );
  }, []);

  return (
    <>
      <Navbar
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />
      <div className="flex flex-col gap-8 items-center justify-items-center w-full min-h-screen pt-[90px] py-8 pb-20 font-[family-name:var(--font-geist-sans)]">
        <h1 className="sr-only">
          Co przeszło - Akty prawne w Polsce w prostym języku
        </h1>

        <div className="flex flex-col items-center gap-5 w-11/12 md:w-full max-w-[560px]">
          <div ref={heroRef} className="text-center">
            <p className="font-[family-name:var(--font-libre-bodoni)] text-3xl sm:text-4xl font-semibold text-neutral-800 dark:text-neutral-100 leading-snug">
              <span
                data-hero-line
                style={{
                  opacity: 0,
                  display: 'block',
                  willChange: 'transform, opacity',
                }}
              >
                Polskie prawo.
              </span>
              <span
                data-hero-line
                style={{
                  opacity: 0,
                  display: 'block',
                  willChange: 'transform, opacity',
                }}
              >
                W twoim języku.
              </span>
            </p>
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed tracking-wide">
              <span
                data-hero-line
                style={{
                  opacity: 0,
                  display: 'block',
                  willChange: 'transform, opacity',
                }}
              >
                Śledzimy każdą ustawę i rozporządzenie
              </span>
              <span
                data-hero-line
                style={{
                  opacity: 0,
                  display: 'block',
                  willChange: 'transform, opacity',
                }}
              >
                — i tłumaczymy je na ludzki język.
              </span>
            </p>
          </div>
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          {isNewUser && (
            <p className="animate-breathe text-xs tracking-wide text-center leading-relaxed">
              Kliknij kartę, by zobaczyć podsumowanie i wyniki głosowania w
              Sejmie &darr;
            </p>
          )}
        </div>

        <main className="w-full h-full after:pointer-events-none after:block after:fixed after:bottom-0 after:w-full after:h-1/6 after:bg-gradient-to-t after:from-background after:to-transparent">
          <CardGrid
            data={data}
            searchQuery={searchQuery}
            selectedTypes={selectedTypes}
            initialOpenId={initialOpenId}
          />
        </main>
      </div>
    </>
  );
};

export default ClientWrapper;
