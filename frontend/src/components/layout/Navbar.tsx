'use client';

import React from 'react';
import DarkMode from '@/components/shared/DarkMode';
import Menu from '@/components/shared/Menu';
import MobileMenu from '@/components/shared/MobileMenu';
import Logo from '@/components/shared/Logo';
import AuthButtons from '@/components/shared/AuthButtons';
import { useState, useEffect } from 'react';
import { NavbarProps } from '@/types';

const Navbar: React.FC<NavbarProps> = ({ selectedTypes, setSelectedTypes }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [openPanel, setOpenPanel] = useState<'menu' | 'auth' | 'mobile' | null>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640 && openPanel !== null) {
        setOpenPanel(null);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [openPanel]);

  return (
    <header role="banner">
      <nav aria-label="Główna nawigacja">
        {/* Mobile Menu - only visible on mobile */}
        <div className="sm:hidden">
          <MobileMenu
            isOpen={openPanel === 'mobile'}
            toggleMenu={() => setOpenPanel(p => p === 'mobile' ? null : 'mobile')}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
            isDarkMode={isDarkMode}
            toggleDarkMode={toggleDarkMode}
          />
        </div>

        {/* Desktop Menu - hidden on mobile */}
        <div className="hidden sm:block">
          <Menu
            isOpen={openPanel === 'menu'}
            toggleMenu={() => setOpenPanel(p => p === 'menu' ? null : 'menu')}
            selectedTypes={selectedTypes}
            setSelectedTypes={setSelectedTypes}
          />
        </div>

        <Logo />

        {/* Desktop Controls - hidden on mobile */}
        <div className="hidden sm:flex absolute top-5 right-5 items-center gap-5">
          <AuthButtons
            isDarkMode={isDarkMode}
            isOpen={openPanel === 'auth'}
            onToggle={() => setOpenPanel(p => p === 'auth' ? null : 'auth')}
          />
          <DarkMode isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
