import React from 'react';
import DarkMode from '@/components/shared/DarkMode';
import Menu from '@/components/shared/Menu';
import Logo from '@/components/shared/Logo';
import AuthButtons from '@/components/shared/AuthButtons';
import { useState, useEffect } from 'react';
import { NavbarProps } from '@/types';

const Navbar: React.FC<NavbarProps> = ({ selectedTypes, setSelectedTypes }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

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

  return (
    <div>
      <Menu
        isOpen={isOpen}
        toggleMenu={() => setIsOpen(!isOpen)}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />
      <Logo />
      <div className="h-[26px] absolute top-5 right-5 flex items-end gap-5 sm:items-center justify-center">
        <AuthButtons isDarkMode={isDarkMode} />
        <DarkMode isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      </div>
    </div>
  );
};

export default Navbar;
