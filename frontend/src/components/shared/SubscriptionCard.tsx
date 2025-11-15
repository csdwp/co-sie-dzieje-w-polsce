import React from 'react';
import SubscriptionCardOption from './SubscriptionCardOption';

interface SubscriptionCardProps {
  isBest: boolean;
  options: { option: string; active: boolean }[];
  maxWidth?: number;
}

const SubscriptionCard = ({
  isBest,
  options,
  maxWidth,
}: SubscriptionCardProps) => {
  return (
    <div
      className={`flex flex-col gap-y-3 rounded-3xl p-5 shadow-xl border-2
        ${
          isBest ? ' border-red-500/70 shadow-red-500/10' : 'border-neutral-600'
        }`}
      style={{ maxWidth: maxWidth ? `${maxWidth}px` : 'auto' }}
    >
      <div className="gap-1 flex flex-col">
        <span className="dark:text-neutral-600 text-neutral-500 text-xs">
          Nazwa
        </span>
        <h4 className="text-xl font-semibold">Subscription plan</h4>
      </div>
      <div className="flex flex-col gap-1">
        <span className="dark:text-neutral-600 text-neutral-500 text-xs">
          Cena
        </span>
        <div className="space-x-2">
          <span className="text-3xl font-bold">19.99</span>
          <span className="dark:text-neutral-100/50 text-neutral-900/50">
            PLN / miesiąc
          </span>
        </div>
      </div>
      <button className="w-ffull flex justify-center text-lg px-6 py-3 red-background-gloss font-semibold text-white rounded-lg shadow-none hover:shadow-2xl hover:shadow-red-500/60 focus:shadow-none active:shadow-none transition-shadow duration-300 cursor-pointer">
        <div className="description Box-root text-start">
          <h5>Subskrybuj</h5>
        </div>
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
