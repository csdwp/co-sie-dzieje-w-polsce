'use client';

import React, {
  useState,
  useMemo,
  useRef,
  useLayoutEffect,
  useCallback,
  useEffect,
} from 'react';
import dynamic from 'next/dynamic';
import Masonry from 'react-masonry-css';
import Card from '@/components/shared/Card';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import { Act, CardGridProps } from '@/types';
import { useUser } from '@clerk/nextjs';
import { gsap } from 'gsap';
import { CONFIDENCE_THRESHOLD } from '@/lib/config';

// Dynamic imports for modals - loaded only when needed
const DialogModal = dynamic(() => import('./DialogModal'), { ssr: false });

const CardGrid = ({
  searchQuery,
  selectedTypes,
  data,
  initialOpenId,
}: CardGridProps) => {
  const [selectedCard, setSelectedCard] = useState<Act | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isFilterOptionsOpen, setIsFilterOptionsOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [sortByTitle, setSortByTitle] = useState<'asc' | 'desc' | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<string | number>>(new Set());
  const { user } = useUser();
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const tagsContainerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const { acts } = data || {};

  const breakpointColumnsObj = {
    default: 4,
    1200: 3,
    950: 2,
    700: 1,
  };

  const toggleFilterOptions = useCallback(() => {
    setIsFilterOptionsOpen(prev => !prev);
  }, []);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    setSortByTitle(null);
  }, []);

  const toggleSortByTitle = useCallback(() => {
    setSortByTitle(prev => {
      if (prev === null) return 'asc';
      if (prev === 'asc') return 'desc';
      return null;
    });
    setSortOrder('desc');
  }, []);

  const isAdmin = user?.publicMetadata?.role === 'admin';

  const baseFilteredActs = useMemo(() => {
    if (!acts) return [];

    return acts.filter((card: Act) => {
      const query = searchQuery.toLowerCase();
      const matchesQuery =
        card.title.toLowerCase().includes(query) ||
        (card.content && card.content.toLowerCase().includes(query)) ||
        (card.category && card.category.toLowerCase().includes(query));

      const matchesType = selectedTypes.includes(card.item_type);

      const confidenceCheck =
        isAdmin ||
        card.confidence_score === null ||
        card.confidence_score === undefined ||
        card.confidence_score >= CONFIDENCE_THRESHOLD;

      return matchesQuery && matchesType && confidenceCheck;
    });
  }, [acts, searchQuery, selectedTypes, isAdmin]);

  const availableCategories = useMemo(() => {
    if (!baseFilteredActs.length) return [];

    const categoriesSet = new Set<string>();
    baseFilteredActs.forEach((act: Act) => {
      if (act.category) {
        categoriesSet.add(act.category);
      }
    });

    return Array.from(categoriesSet).sort();
  }, [baseFilteredActs]);

  const filteredAndSortedCards = useMemo(() => {
    if (!baseFilteredActs.length) return [];

    const filtered = baseFilteredActs.filter((card: Act) => {
      const matchesCategory =
        selectedCategories.length === 0 ||
        (card.category && selectedCategories.includes(card.category));

      return matchesCategory;
    });

    if (sortByTitle) {
      return filtered.sort((a: Act, b: Act) => {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return sortByTitle === 'asc'
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      });
    } else {
      return filtered.sort((a: Act, b: Act) => {
        const dateA = new Date(a.announcement_date).getTime();
        const dateB = new Date(b.announcement_date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    }
  }, [baseFilteredActs, sortOrder, sortByTitle, selectedCategories]);

  const openModal = useCallback((card: Act) => {
    setSelectedCard(card);
    window.history.replaceState(null, '', `/${card.id}`);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedCard(null);
    window.history.replaceState(null, '', '/');
  }, []);

  useEffect(() => {
    if (!initialOpenId || !data?.acts) return;
    const act = data.acts.find(a => a.id === initialOpenId);
    if (act) setSelectedCard(act);
  }, [initialOpenId, data?.acts]);

  const handleCardDelete = useCallback((id: string | number) => {
    setDeletedIds(prev => new Set(prev).add(id));
  }, []);

  useLayoutEffect(() => {
    if (tagsContainerRef.current) {
      gsap.fromTo(
        tagsContainerRef.current,
        { opacity: 0, y: -20, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'power3.out',
          delay: 0.4,
        }
      );
    }
  }, []);

  useLayoutEffect(() => {
    if (cardsContainerRef.current && !hasAnimated.current) {
      const animationTimeout = setTimeout(() => {
        if (cardsContainerRef.current) {
          const cards =
            cardsContainerRef.current.querySelectorAll('[data-card]');

          if (cards.length > 0) {
            gsap.fromTo(
              cards,
              {
                opacity: 0,
                y: 50,
              },
              {
                opacity: 1,
                y: 0,
                duration: 1.6,
                ease: 'power3.out',
                stagger: {
                  amount: 0.8,
                  from: 'start',
                  each: 0.08,
                },
                delay: 0.6,
              }
            );
            hasAnimated.current = true;
          }
        }
      }, 100);

      return () => clearTimeout(animationTimeout);
    }
  }, []);

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      {availableCategories && availableCategories.length > 0 && (
        <div
          ref={tagsContainerRef}
          className="w-full mx-auto max-[640px]:max-w-11/12 max-[700px]:max-w-[320px] max-[950px]:max-w-[660px] max-[1200px]:max-w-[1000px] max-w-[1260px]"
        >
          <div className="text-lg relative flex flex-row items-center justify-between mb-1 gap-4 w-max">
            <button className="swiper-button-prev-custom cursor-pointer transition-all duration-500 text-neutral-400 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 dark:[text-shadow:0_0_0px_rgba(255,255,255,0)] dark:hover:[text-shadow:0_0_8px_rgba(255,255,255,0.5)]">
              ←
            </button>
            <button className="swiper-button-next-custom cursor-pointer transition-all duration-500 text-neutral-400 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 dark:[text-shadow:0_0_0px_rgba(255,255,255,0)] dark:hover:[text-shadow:0_0_8px_rgba(255,255,255,0.5)]">
              →
            </button>
          </div>
          <div className="flex items-center gap-1 justify-between">
            <Swiper
              modules={[Navigation]}
              navigation={{
                nextEl: '.swiper-button-next-custom',
                prevEl: '.swiper-button-prev-custom',
              }}
              spaceBetween={6}
              slidesPerView="auto"
              freeMode={true}
              className="!mx-0 cursor-default relative mask-alpha mask-r-from-black mask-r-from-97% mask-r-to-transparent
            mask-l-from-black mask-l-from-97% mask-l-to-transparent !pb-4 w-full flex! items-center h-[45px]"
            >
              <SwiperSlide key="wszystkie" className="!w-max">
                <span
                  onClick={() => setSelectedCategories([])}
                  className={`
                  transition-all duration-500 cursor-pointer min-w-max
                  px-3 py-1.5 text-[11px] font-medium tracking-wide rounded-full
                  ${
                    selectedCategories.length === 0
                      ? 'bg-black/[0.06] dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-200'
                      : 'text-neutral-400 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                  }
                `}
                >
                  wszystkie
                </span>
              </SwiperSlide>
              {availableCategories.map((category: string) => (
                <SwiperSlide key={category} className="!w-max">
                  <span
                    onClick={() => {
                      setSelectedCategories(prev =>
                        prev.includes(category)
                          ? prev.filter(c => c !== category)
                          : [...prev, category]
                      );
                    }}
                    className={`
                    transition-all duration-500 cursor-pointer min-w-max
                    px-3 py-1.5 text-[11px] font-medium tracking-wide rounded-full
                    ${
                      selectedCategories.includes(category)
                        ? 'bg-black/[0.06] dark:bg-white/[0.08] text-neutral-700 dark:text-neutral-200'
                        : 'text-neutral-400 dark:text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                    }
                  `}
                  >
                    {category}
                  </span>
                </SwiperSlide>
              ))}
            </Swiper>

            <div className="flex justify-end relative right-0 pb-4">
              <button
                onClick={toggleFilterOptions}
                className={`p-2 cursor-pointer transition-all duration-500 ${
                  isFilterOptionsOpen
                    ? 'text-neutral-700 dark:text-neutral-200 dark:[filter:drop-shadow(0_0_8px_rgba(255,255,255,0.5))]'
                    : 'text-neutral-400 dark:text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300 dark:[filter:drop-shadow(0_0_0px_rgba(255,255,255,0))]'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  height="18"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                  width="18"
                >
                  <path
                    d="M3.99961 3H19.9997C20.552 3 20.9997 3.44764 20.9997 3.99987L20.9999 5.58569C21 5.85097 20.8946 6.10538 20.707 6.29295L14.2925 12.7071C14.105 12.8946 13.9996 13.149 13.9996 13.4142L13.9996 19.7192C13.9996 20.3698 13.3882 20.8472 12.7571 20.6894L10.7571 20.1894C10.3119 20.0781 9.99961 19.6781 9.99961 19.2192L9.99961 13.4142C9.99961 13.149 9.89425 12.8946 9.70672 12.7071L3.2925 6.29289C3.10496 6.10536 2.99961 5.851 2.99961 5.58579V4C2.99961 3.44772 3.44732 3 3.99961 3Z"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={toggleSortOrder}
                  className={`
                  p-2 absolute top-0 right-0 ease-out opacity-0 pointer-events-none transition-all duration-500 cursor-pointer
                  ${
                    isFilterOptionsOpen &&
                    'opacity-100 !pointer-events-auto -translate-y-7 -translate-x-5 max-sm:-translate-x-7'
                  }
                  ${
                    sortOrder === 'asc'
                      ? 'text-neutral-700 dark:text-neutral-200 dark:[filter:drop-shadow(0_0_8px_rgba(255,255,255,0.5))]'
                      : 'text-neutral-400 dark:text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300 dark:[filter:drop-shadow(0_0_0px_rgba(255,255,255,0))]'
                  }
                `}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22px"
                    height="22px"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M10 7L2 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 12H2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 17H2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx="17"
                      cy="12"
                      r="5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M17 10V11.8462L18 13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={toggleSortByTitle}
                  className={`
                  p-2 absolute top-0 right-0 opacity-0 ease-out pointer-events-none transition-all duration-500 cursor-pointer
                  ${
                    isFilterOptionsOpen &&
                    'opacity-100 !pointer-events-auto -translate-y-7 translate-x-6 max-sm:translate-x-1'
                  }
                  ${
                    sortByTitle !== null
                      ? 'text-neutral-700 dark:text-neutral-200 dark:[filter:drop-shadow(0_0_8px_rgba(255,255,255,0.5))]'
                      : 'text-neutral-400 dark:text-neutral-400 hover:text-neutral-500 dark:hover:text-neutral-300 dark:[filter:drop-shadow(0_0_0px_rgba(255,255,255,0))]'
                  }
                `}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22px"
                    height="22px"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M13 7L3 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M10 12H3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M8 17H3"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M11.3161 16.6922C11.1461 17.07 11.3145 17.514 11.6922 17.6839C12.07 17.8539 12.514 17.6855 12.6839 17.3078L11.3161 16.6922ZM16.5 7L17.1839 6.69223C17.0628 6.42309 16.7951 6.25 16.5 6.25C16.2049 6.25 15.9372 6.42309 15.8161 6.69223L16.5 7ZM20.3161 17.3078C20.486 17.6855 20.93 17.8539 21.3078 17.6839C21.6855 17.514 21.8539 17.07 21.6839 16.6922L20.3161 17.3078ZM19.3636 13.3636L20.0476 13.0559L19.3636 13.3636ZM13.6364 12.6136C13.2222 12.6136 12.8864 12.9494 12.8864 13.3636C12.8864 13.7779 13.2222 14.1136 13.6364 14.1136V12.6136ZM12.6839 17.3078L17.1839 7.30777L15.8161 6.69223L11.3161 16.6922L12.6839 17.3078ZM21.6839 16.6922L20.0476 13.0559L18.6797 13.6714L20.3161 17.3078L21.6839 16.6922ZM20.0476 13.0559L17.1839 6.69223L15.8161 7.30777L18.6797 13.6714L20.0476 13.0559ZM19.3636 12.6136H13.6364V14.1136H19.3636V12.6136Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div ref={cardsContainerRef}>
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="flex w-fit justify-center relative max-w-full min-w-full"
          columnClassName="flex flex-col gap-y-5 sm:px-2.5 max-[1201px]:!w-fit"
        >
          {filteredAndSortedCards
            .filter((card: Act) => !deletedIds.has(card.id))
            .map((card: Act) => (
              <div key={card.id} data-card>
                <Card
                  id={card.id}
                  title={card.title}
                  content={card.content}
                  summary={card.simple_title}
                  date={card.announcement_date}
                  promulgation={card.promulgation}
                  categories={card.category ? [card.category] : []}
                  isImportant={
                    !!card.votes?.votesSupportByGroup?.government.yesPercentage
                  }
                  governmentPercentage={
                    card.votes?.votesSupportByGroup?.government.yesPercentage ||
                    0
                  }
                  confidenceScore={card.confidence_score}
                  onClick={() => openModal(card)}
                  onDelete={handleCardDelete}
                />
              </div>
            ))}
          {filteredAndSortedCards.length === 0 && (
            <>
              <p className="text-center w-full col-span-full text-gradient-gloss">
                Brak wyników wyszukiwania.
              </p>
            </>
          )}
        </Masonry>
      </div>

      {selectedCard && (
        <DialogModal
          isOpen={selectedCard !== null}
          onClose={closeModal}
          card={{
            id: selectedCard.id,
            title: selectedCard.title,
            content: selectedCard.content ?? '',
            announcement_date: selectedCard.announcement_date,
            promulgation: (selectedCard as Act).promulgation ?? '',
            item_type: selectedCard.item_type,
            categories: selectedCard.category ? [selectedCard.category] : [],
            votes: (selectedCard as Act).votes ?? {},
            url: (selectedCard as Act).file ?? '',
            confidence_score: selectedCard.confidence_score,
          }}
        />
      )}
    </div>
  );
};

export default CardGrid;
