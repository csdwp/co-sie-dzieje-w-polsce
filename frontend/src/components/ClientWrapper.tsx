'use client';

import SearchBar from '@/components/shared/SearchBar';
import CardGrid from '@/components/shared/CardGrid';
import Navbar from '@/components/layout/Navbar';
import { useState } from 'react';
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

  return (
    <>
      <Navbar
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
      />
      <div className="overflow-hidden flex flex-col gap-4 sm:gap-20 items-center justify-items-center w-full min-h-screen pt-[110px] py-8 pb-20 font-[family-name:var(--font-geist-sans)]">
        <h1 className="sr-only">
          Co przeszło - Akty prawne w Polsce w prostym języku
        </h1>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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
