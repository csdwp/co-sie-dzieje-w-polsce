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
      <div
        className={`cursor-pointer absolute top-3.5 left-4 text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400 transition-all duration-500 ${
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
      </div>
      <button
        className={`cursor-pointer text-[13px] tracking-wide leading-3.5 absolute top-4.5 left-1.5 ease-out transition-all duration-500 -z-10 opacity-0 ${
          selectedTypes.includes('Ustawa')
            ? 'text-neutral-700 dark:text-neutral-200 dark:[filter:drop-shadow(0_0_6px_rgba(255,255,255,0.6))]'
            : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400'
        }
        ${isOpen && 'opacity-100 !pointer-events-auto translate-x-11 z-0'}`}
        onClick={() => toggleType('Ustawa')}
      >
        Ustawy
      </button>
      <button
        className={`cursor-pointer text-[13px] tracking-wide leading-3.5 absolute top-5 left-1.5 ease-out transition-all duration-500 -z-10 opacity-0 ${
          selectedTypes.includes('Rozporządzenie')
            ? 'text-neutral-700 dark:text-neutral-200 dark:[filter:drop-shadow(0_0_6px_rgba(255,255,255,0.6))]'
            : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-500 dark:hover:text-neutral-400'
        }
        ${
          isOpen &&
          'opacity-100 !pointer-events-auto translate-x-11 translate-y-5 z-0'
        }`}
        onClick={() => toggleType('Rozporządzenie')}
      >
        Rozporządzenia
      </button>
    </>
  );
};

export default Menu;
