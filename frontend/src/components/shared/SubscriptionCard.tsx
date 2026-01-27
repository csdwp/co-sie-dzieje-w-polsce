import React from 'react';
import SubscriptionCardOption from './SubscriptionCardOption';

interface SubscriptionCardProps {
  title: string;
  isBest: boolean;
  options: { option: string; active: boolean }[];
  maxWidth?: number;
  price: number;
  priceId?: string;
  onSubscribe?: (priceId: string) => void;
}

const SubscriptionCard = ({
  title,
  isBest,
  options,
  maxWidth,
  price,
  priceId,
  onSubscribe,
}: SubscriptionCardProps) => {
  return (
    <div
      className={`relative flex flex-col gap-y-4 rounded-2xl p-6 w-full h-fit transition-all duration-500 group
        ${
          isBest
            ? 'subscription-card-premium bg-gradient-to-br from-white/[0.08] to-white/[0.02] dark:from-white/[0.06] dark:to-white/[0.01] border border-white/[0.08]'
            : 'bg-white/[0.03] dark:bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08]'
        }`}
      style={{ maxWidth: maxWidth ? `${maxWidth}px` : 'auto' }}
    >
      {isBest && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 text-[10px] font-semibold uppercase tracking-widest text-white red-background-gloss rounded-full shadow-lg shadow-red-500/20">
            Popularny
          </span>
        </div>
      )}

      <div className="gap-1.5 flex flex-col pt-2">
        <span className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-medium">
          Plan
        </span>
        <h4 className="text-xl font-semibold tracking-tight">{title}</h4>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold tracking-tight">{price}</span>
          <span className="text-sm text-neutral-400 dark:text-neutral-500 font-medium">
            PLN
          </span>
        </div>
        <span className="text-xs text-neutral-400 dark:text-neutral-500">
          miesięcznie
        </span>
      </div>

      <button
        onClick={() => priceId && onSubscribe?.(priceId)}
        disabled={!priceId || !onSubscribe}
        className={`w-full flex justify-center text-sm px-6 py-3.5 font-semibold rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
            ${
              isBest
                ? 'text-white red-background-gloss hover:shadow-xl hover:shadow-red-500/25 hover:-translate-y-0.5 active:translate-y-0'
                : 'bg-white/[0.06] dark:bg-white/[0.04] text-neutral-700 dark:text-neutral-200 border border-white/[0.08] hover:bg-white/[0.1] dark:hover:bg-white/[0.08] hover:-translate-y-0.5 active:translate-y-0'
            }`}
      >
        <span>Subskrybuj</span>
      </button>

      <div className="flex flex-col gap-2 pt-2">
        <span className="text-[10px] uppercase tracking-widest text-neutral-400 dark:text-neutral-500 font-medium">
          W zestawie
        </span>
        <div className="flex flex-col gap-2.5">
          {options.map((option, index) => (
            <SubscriptionCardOption
              key={index}
              active={option.active}
              option={option.option}
            />
          ))}
        </div>
      </div>

      {isBest && (
        <div className="absolute inset-0 rounded-2xl subscription-card-glow pointer-events-none" />
      )}
    </div>
  );
};

export default SubscriptionCard;
