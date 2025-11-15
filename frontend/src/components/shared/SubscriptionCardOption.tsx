import React from 'react';

interface SubscriptionCardOptionProps {
  active: boolean;
  option: React.ReactNode;
}

const SubscriptionCardOption: React.FC<SubscriptionCardOptionProps> = ({
  active,
  option,
}) => {
  return (
    <div className="flex items-start gap-2">
      {active ? (
        <span>
          <svg
            className="w-4.5 h-4.5 flex-shrink-0 mt-px text-neutral-900 dark:text-neutral-100 opacity-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
      ) : (
        <span>
          <svg
            className="w-4.5 h-4.5 flex-shrink-0 mt-px text-neutral-600 dark:text-neutral-500 opacity-100"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </span>
      )}{' '}
      <div
        className={`${
          active
            ? 'text-neutral-900 dark:text-neutral-100'
            : 'text-neutral-600 dark:text-neutral-500'
        }`}
      >
        {option}
      </div>
    </div>
  );
};

export default SubscriptionCardOption;
