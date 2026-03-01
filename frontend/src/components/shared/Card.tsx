'use client';

import { useRef, useState, useEffect, useMemo, memo } from 'react';
import { CardProps } from '@/types';
import { Badge } from '@/components/ui/badge';
import { useIsAdmin, isLowConfidence } from '@/lib/authHelpers';
import { Trash2 } from 'lucide-react';
import { getActStatus, getStatusColor } from '@/lib/statusHelpers';

// Memoized helper functions
const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');

const stripDateFromTitle = (title: string) =>
  title.replace(/z dnia \d{1,2} \w+ \d{4}\s*r\.\s*/i, '').trim();

const Card = ({
  id,
  title,
  content,
  summary,
  date,
  promulgation,
  isImportant = false,
  onClick,
  categories = [],
  governmentPercentage,
  confidenceScore,
  onDelete,
}: CardProps) => {
  const status = getActStatus(date, promulgation);
  const containerRef = useRef<HTMLDivElement>(null);
  const [totalDots, setTotalDots] = useState(14);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateTotalDots = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      const dotWidth = 8;
      const desiredGap = 8;
      const N = Math.round((width + desiredGap) / (dotWidth + desiredGap));
      setTotalDots(Math.max(10, N));
    };

    const resizeObserver = new ResizeObserver(() => {
      updateTotalDots();
    });

    resizeObserver.observe(containerRef.current);

    updateTotalDots();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const governmentDots = Math.round((governmentPercentage / 100) * totalDots);
  const oppositionDots = totalDots - governmentDots;

  const formattedDate = useMemo(
    () =>
      new Date(date).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [date]
  );

  const processedTitle = useMemo(() => stripDateFromTitle(title), [title]);
  const processedContent = useMemo(
    () => (content ? stripHtml(content) : ''),
    [content]
  );

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
    <article
      onClick={onClick}
      data-testid="act-card"
      aria-labelledby={`act-title-${id}`}
      className={`bg-white/[0.02] dark:bg-white/[0.03] backdrop-blur-sm mx-auto max-w-11/12 sm:max-w-80 flex flex-col gap-4 p-6 rounded-2xl premium-shadow premium-border cursor-pointer group
      transition-all duration-500 ease-out h-fit w-full hover:bg-white/[0.04] dark:hover:bg-white/[0.05]
      ${isImportant && 'border-l-2 border-l-red-500/60'}
      ${isDeleting && 'opacity-50 pointer-events-none animate-pulse'}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="text-neutral-400 dark:text-neutral-400 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors duration-500 text-xs tracking-wide uppercase">
            {formattedDate}
          </div>
          {status !== 'Nieznany' && (
            <Badge
              variant="outline"
              className={`text-[10px] px-2 py-0.5 font-medium tracking-wide ${getStatusColor(status)}`}
            >
              {status}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && needsVerification && (
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] px-2 py-0.5 font-medium"
            >
              Wymaga weryfikacji
            </Badge>
          )}
          {isAdmin && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-neutral-400 hover:text-red-500 dark:text-neutral-400 dark:hover:text-red-400 cursor-pointer"
              aria-label="Usuń akt"
              title="Usuń akt"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
      <h2
        id={`act-title-${id}`}
        data-testid="act-title"
        className="text-lg leading-snug font-medium tracking-tight line-clamp-3"
      >
        {processedTitle}
      </h2>
      <div className="space-y-1.5">
        <div className="text-neutral-400 dark:text-neutral-400 text-[11px] tracking-widest uppercase group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors duration-500">
          W skrócie
        </div>
        <div className="text-base leading-relaxed line-clamp-4 text-gradient-gloss font-normal">
          {summary}
        </div>
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.slice(0, 4).map((category, index) => (
            <span
              key={index}
              className="bg-black/[0.05] dark:bg-white/[0.06] px-2.5 py-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-300 rounded-full w-max overflow-ellipsis overflow-hidden max-w-full whitespace-nowrap tracking-wide"
            >
              {category}
            </span>
          ))}
        </div>
      )}
      <p className="line-clamp-7 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors duration-500">
        {processedContent}
      </p>
      {governmentPercentage > 0 && (
        <div className="pt-2 border-t border-white/[0.04] space-y-3">
          <div className="text-neutral-400 dark:text-neutral-400 text-[11px] tracking-widest uppercase group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors duration-500">
            Rozkład głosów &bdquo;za&rdquo;
          </div>
          <div className="flex flex-col items-center gap-2">
            <div ref={containerRef} className="flex justify-between w-full">
              {[...Array(governmentDots)].map((_, index) => (
                <div
                  key={`gov-${index}`}
                  className="w-2 h-2 bg-neutral-200 dark:bg-neutral-300 rounded-full transition-colors duration-300"
                ></div>
              ))}
              {[...Array(oppositionDots)].map((_, index) => (
                <div
                  key={`opp-${index}`}
                  className="w-2 h-2 bg-red-500/60 dark:bg-red-500/50 rounded-full transition-colors duration-300"
                ></div>
              ))}
            </div>
            <div className="flex justify-between w-full text-[11px] text-neutral-400 dark:text-neutral-400 tracking-wide group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors duration-500">
              <span>Koalicja</span>
              <span>Opozycja</span>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default memo(Card);
