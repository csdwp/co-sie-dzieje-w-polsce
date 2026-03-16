// types/index.ts
// Wszystkie typy aplikacji w jednym miejscu

import React from 'react';

export interface Act {
  id: string | number;
  title: string;
  act_number?: string;
  simple_title?: string;
  content?: string;
  refs?: ActReferences;
  texts?: ActText[];
  item_type: string;
  announcement_date: string;
  change_date?: string;
  promulgation?: string;
  item_status?: string;
  comments?: string | null;
  keywords?: string[];
  file: string;
  votes?: Votes | null;
  category?: string | null;
  confidence_score?: number | null;
  created_at?: string;
}

export interface ActReferences {
  'Akty zmienione'?: ActReference[];
  'Podstawa prawna'?: ActReference[];
  'Podstawa prawna z art.'?: ActReference[];
  [key: string]: ActReference[] | undefined;
}

export interface ActReference {
  id: string;
  date?: string;
  art?: string;
}

export interface ActText {
  type: string;
  fileName: string;
}

export interface Votes {
  parties?: Record<
    string,
    {
      votes: { no: number; yes: number; absent: number; abstain: number };
      percentages: {
        no: number;
        yes: number;
        absent: number;
        abstain: number;
      };
      totalMembers: number;
    }
  >;
  summary?: {
    no: number;
    yes: number;
    total: number;
    absent: number;
    abstain: number;
    percentages: { no: number; yes: number; absent: number; abstain: number };
  };
  government?: {
    parties?: string[];
    votesPercentage?: {
      no?: number;
      yes?: number;
      absent?: number;
      abstain?: number;
    };
  };
  votesSupportByGroup?: {
    [government: string]: {
      yesVotes: number;
      yesPercentage: number;
    };
  };
}

export interface Category {
  category: string;
}

export interface ActsAndKeywordsResponse {
  acts: Act[];
  categories: { category: string }[];
}

export interface CardProps {
  id: string | number;
  title: string;
  content?: string;
  summary?: string;
  date: string;
  promulgation?: string;
  isImportant?: boolean;
  onClick: () => void;
  categories?: string[];
  governmentPercentage: number;
  confidenceScore?: number | null;
  onDelete?: (id: string | number) => void;
  createdAt?: string;
}

export interface DialogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  card: {
    id: string | number;
    title: string;
    content: string;
    announcement_date: string;
    promulgation: string;
    item_type?: string;
    categories?: string[];
    votes?: Votes;
    url: string;
    confidence_score?: number | null;
  } | null;
}

export interface CardGridProps {
  searchQuery: string;
  selectedTypes: string[];
  data: ActsAndKeywordsResponse;
  initialOpenId?: number;
}

export interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export interface NavbarProps {
  selectedTypes: string[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

export interface ClientWrapperProps {
  data: ActsAndKeywordsResponse;
}

export interface MenuProps {
  isOpen: boolean;
  toggleMenu: () => void;
  selectedTypes: string[];
  setSelectedTypes: React.Dispatch<React.SetStateAction<string[]>>;
}

export interface DarkModeProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export type SortOrder = 'asc' | 'desc';
export type ItemType = 'Ustawa' | 'Rozporządzenie' | 'Obwieszczenie';

export interface DatabaseAct {
  id: number;
  title: string | null;
  act_number: string | null;
  simple_title: string | null;
  content: string | null;
  refs: ActReferences | null;
  texts: ActText[] | null;
  item_type: string | null;
  announcement_date: Date | null;
  change_date: Date | null;
  promulgation: Date | null;
  item_status: string | null;
  comments: string | null;
  keywords: string[];
  file: string | null;
  votes: Votes | null;
  category: string | null;
  idempotency_key: string | null;
  impact_section: string | null;
  confidence_score: number | null;
  needs_reprocess: boolean;
  created_at: Date;
  updated_at: Date;
  ingested_at: Date | null;
  deleted_at: Date | null;
}

export interface DatabaseCategory {
  id: number;
  category: string | null;
  keywords: string[] | null;
}
