import React from 'react';
import { MenuProps } from '@/types';

const Menu = ({
  isOpen,
  toggleMenu,
  selectedTypes,
  setSelectedTypes,
}: MenuProps) => {
  const toggleType = (type: string) => {
    setSelectedTypes(prev => {
      if (prev.length === 1 && prev[0] === type) {
        return ['Ustawa', 'Rozporządzenie'];
      }
      return [type];
    });
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        aria-label={isOpen ? 'Zamknij menu' : 'Otwórz menu'}
        aria-expanded={isOpen}
        className={`cursor-pointer absolute top-5 left-4 z-50 text-neutral-400 dark:text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300 transition-all duration-500 ${
          isOpen
            ? 'dark:!text-neutral-200 !text-neutral-700 dark:[filter:drop-shadow(0_0_6px_rgba(255,255,255,0.6))]'
            : ''
        }`}
        onClick={toggleMenu}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width="22"
          height="22"
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
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={toggleMenu}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 left-0 z-40 w-[220px] h-auto rounded-br-3xl bg-neutral-50 dark:bg-white/[0.04] backdrop-blur-xl border border-black/[0.09] dark:border-white/[0.06] shadow-2xl transition-all duration-500 ease-out ${
          isOpen
            ? 'opacity-100 translate-x-0 scale-100'
            : 'opacity-0 -translate-x-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="p-6 pt-16 space-y-4">
          <div className="text-[11px] uppercase tracking-widest text-neutral-500">
            Filtruj według
          </div>
          <div className="flex flex-col gap-3 px-1">
            <button
              onClick={() => toggleType('Ustawa')}
              className={`text-left text-[15px] tracking-wide transition-all duration-500 ${
                selectedTypes.includes('Ustawa')
                  ? 'text-neutral-800 dark:text-neutral-200 dark:[text-shadow:0_0_8px_rgba(255,255,255,0.6)]'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              Ustawy
            </button>
            <button
              onClick={() => toggleType('Rozporządzenie')}
              className={`text-left text-[15px] tracking-wide transition-all duration-500 ${
                selectedTypes.includes('Rozporządzenie')
                  ? 'text-neutral-800 dark:text-neutral-200 dark:[text-shadow:0_0_8px_rgba(255,255,255,0.6)]'
                  : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              Rozporządzenia
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Menu;
