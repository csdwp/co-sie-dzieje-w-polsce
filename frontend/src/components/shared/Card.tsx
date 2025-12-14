'use client';

import { useRef, useState, useEffect } from 'react';
import { CardProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useIsAdmin, isLowConfidence } from '@/lib/authHelpers';
import { Trash2 } from 'lucide-react';

const Card = ({
  id,
  title,
  content,
  summary,
  date,
  isImportant = false,
  onClick,
  categories = [],
  governmentPercentage,
  confidenceScore,
  onDelete,
}: CardProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalDots, setTotalDots] = useState(14);

  const updateTotalDots = () => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth;
    const dotWidth = 8;
    const desiredGap = 8;
    const N = Math.round((width + desiredGap) / (dotWidth + desiredGap));
    setTotalDots(Math.max(10, N));
  };

  useEffect(() => {
    window.addEventListener('resize', updateTotalDots);
    updateTotalDots();

    return () => window.removeEventListener('resize', updateTotalDots);
  }, []);

  const governmentDots = Math.round((governmentPercentage / 100) * totalDots);
  const oppositionDots = totalDots - governmentDots;

  const formattedDate = new Date(date).toLocaleDateString('pl-PL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const stripDateFromTitle = (title: string) => {
    const titleWithoutDate = title
      .replace(/z dnia \d{1,2} \w+ \d{4}\s*r\.\s*/i, '')
      .trim();
    return titleWithoutDate;
  };

  const isAdmin = useIsAdmin();
  const needsVerification = isLowConfidence(confidenceScore);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const confirmed = window.confirm(
      'Czy na pewno chcesz usunąć ten akt?\n\n' +
        'Ta operacja oznacza akt jako usunięty i wymaga rebuildu (~2-5 min).'
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch('/api/admin/delete-act', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actId: Number(id) }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to delete act');

      if (onDelete) onDelete(id);

      alert('Akt został usunięty. Rebuild w toku (~2-5 min).');
    } catch (error) {
      console.error('Error deleting act:', error);
      alert('Błąd podczas usuwania aktu. Spróbuj ponownie.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={onClick}
      data-testid="act-card"
      className={`bg-neutral-700/10 dark:bg-neutral-800/40 mx-auto max-w-11/12 sm:max-w-80 flex flex-col gap-3 p-5 rounded-3xl shadow-xl cursor-pointer hover:ring-2 
      dark:hover:ring-neutral-100 hover:ring-neutral-300 hover:!border-transparent transition-all duration-300 h-fit w-full
      ${isImportant && 'border-2 border-red-500/70 shadow-red-500/10'}
      ${isDeleting && 'opacity-50 pointer-events-none animate-pulse'}`}
    >
      <div className="flex items-center justify-between">
        <div className="dark:text-neutral-600 text-neutral-500 text-xs">
          {formattedDate}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && needsVerification && (
            <Badge
              variant="outline"
              className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/50 text-[10px] px-1.5 py-0"
            >
              ⚠️ Wymaga weryfikacji
            </Badge>
          )}
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-lg hover:bg-red-500/20 transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-red-500 hover:text-red-600 dark:text-red-400 cursor-pointer"
              aria-label="Usuń akt"
              title="Usuń akt"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      <h3
        data-testid="act-title"
        className="text-lg leading-snug font-semibold tracking-tight line-clamp-3 -mt-2.5"
      >
        {stripDateFromTitle(title)}
      </h3>
      <div className="dark:text-neutral-600 text-neutral-500 text-xs">
        W skrócie
      </div>
      <div className="text-sm text-muted-foreground leading-snug line-clamp-4 text-gradient-gloss font-medium -mt-2.5">
        &quot;{summary}&quot;
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {categories.slice(0, 4).map((category, index) => (
            <span
              key={index}
              className="dark:bg-neutral-700/50 bg-neutral-600/10 px-2 py-1 text-xs font-medium text-neutral-900 dark:text-neutral-100 rounded-full w-max overflow-ellipsis overflow-hidden max-w-full whitespace-nowrap"
            >
              {category}
            </span>
          ))}
        </div>
      )}
      <p className="line-clamp-7 font-light text-sm">
        {content && stripHtml(content)}
      </p>
      {governmentPercentage > 0 && (
        <>
          <div className="dark:text-neutral-600 text-neutral-500 text-xs">
            Rozkład głosów &quot;za&quot;
          </div>
          <div className="flex flex-col items-center gap-1 -mt-1.5">
            <div ref={containerRef} className="flex justify-between w-full">
              {[...Array(governmentDots)].map((_, index) => (
                <div
                  key={`gov-${index}`}
                  className="w-2 h-2 bg-neutral-100 rounded-full"
                ></div>
              ))}
              {[...Array(oppositionDots)].map((_, index) => (
                <div
                  key={`opp-${index}`}
                  className="w-2 h-2 bg-red-500/70 rounded-full"
                ></div>
              ))}
            </div>
            <div className="flex justify-between w-full dark:text-neutral-600 text-neutral-500 text-xs">
              <span>Rządz.</span>
              <span>Opoz.</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Card;
