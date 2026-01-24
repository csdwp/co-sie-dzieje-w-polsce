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
      className={`flex flex-col gap-y-3 rounded-3xl p-5 shadow-lg border-2 w-full h-fit
        ${
          isBest ? ' border-red-500/70 shadow-red-500/50' : 'border-neutral-600'
        }`}
      style={{ maxWidth: maxWidth ? `${maxWidth}px` : 'auto' }}
    >
      <div className="gap-1 flex flex-col">
        <span className="dark:text-neutral-600 text-neutral-500 text-xs">
          Nazwa
        </span>
        <h4 className="text-xl font-semibold">{title}</h4>
      </div>
      <div className="flex flex-col gap-1">
        <span className="dark:text-neutral-600 text-neutral-500 text-xs">
          Cena
        </span>
        <div className="space-x-1.5">
          <span className="text-3xl font-bold">{price}</span>
          <span className="dark:text-neutral-100/50 text-neutral-900/50">
            PLN / miesiąc
          </span>
        </div>
      </div>
      <button
        onClick={() => priceId && onSubscribe?.(priceId)}
        disabled={!priceId || !onSubscribe}
        className={`w-full flex justify-center text-lg px-6 py-3 font-semibold text-white rounded-lg hover:shadow-2xl active:opacity-90 active:shadow-none hover:shadow-red-500/60 transition-shadow duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none
            ${isBest ? 'red-background-gloss' : 'bg-[#b91c1c]'}`}
      >
        <span>Subskrybuj</span>
      </button>
      <div className="flex flex-col gap-1">
        <span className="dark:text-neutral-600 text-neutral-500 text-xs">
          Cechy
        </span>
        <div className="flex flex-col gap-3">
          {options.map((option, index) => (
            <SubscriptionCardOption
              key={index}
              active={option.active}
              option={option.option}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionCard;
