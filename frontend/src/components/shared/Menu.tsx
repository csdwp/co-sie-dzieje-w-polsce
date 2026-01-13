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
        className={`cursor-pointer absolute top-3.5 left-4 text-neutral-400 dark:text-neutral-500 max-sm:dark:text-neutral-400 transition-colors duration-300 ${
          isOpen ? 'dark:!text-neutral-100 !text-neutral-600' : ''
        }`}
        onClick={toggleMenu}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512"
          width="24"
          height="24"
        >
          <line
            x1="50"
            y1="170"
            x2={isOpen ? '400' : '450'}
            y2="170"
            stroke="currentColor"
            strokeWidth="30"
            strokeLinecap="round"
            style={{
              transform: isOpen ? 'translateY(85px) rotate(45deg)' : 'none',
              transformOrigin: 'center',
              transition: 'transform 300ms ease-out, x2 300ms ease-out',
            }}
          />
          <line
            x1="50"
            y1="340"
            x2={isOpen ? '400' : '250'}
            y2="340"
            stroke="currentColor"
            strokeWidth="30"
            strokeLinecap="round"
            style={{
              transform: isOpen ? 'translateY(-85px) rotate(-45deg)' : 'none',
              transformOrigin: 'center',
              transition: 'transform 300ms ease-out, x2 300ms ease-out',
            }}
          />
        </svg>
      </div>
      <button
        className={`cursor-pointer text-sm leading-3.5 absolute top-4.5 left-1.5 ease-out transition-color duration-300 -z-10 opacity-0 ${
          selectedTypes.includes('Ustawa')
            ? 'text-neutral-600 dark:text-neutral-100'
            : 'text-neutral-400 dark:text-neutral-500 max-sm:dark:text-neutral-400'
        }
        ${isOpen && 'opacity-100 !pointer-events-auto translate-x-11 z-0'}`}
        onClick={() => toggleType('Ustawa')}
      >
        Ustawy
      </button>
      <button
        className={`cursor-pointer text-sm leading-3.5 absolute top-5 left-1.5 ease-out transition-color duration-300 -z-10 opacity-0 ${
          selectedTypes.includes('Rozporządzenie')
            ? 'text-neutral-600 dark:text-neutral-100'
            : 'text-neutral-400 dark:text-neutral-500 max-sm:dark:text-neutral-400'
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
