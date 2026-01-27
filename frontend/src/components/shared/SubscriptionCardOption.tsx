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
    <div className="flex items-start gap-2.5">
      {active ? (
        <span className="flex-shrink-0 w-4 h-4 mt-0.5 rounded-full bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center">
          <svg
            className="w-2.5 h-2.5 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </span>
      ) : (
        <span className="flex-shrink-0 w-4 h-4 mt-0.5 rounded-full bg-neutral-500/10 flex items-center justify-center">
          <svg
            className="w-2 h-2 text-neutral-400 dark:text-neutral-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </span>
      )}
      <span
        className={`text-sm leading-tight ${
          active
            ? 'text-neutral-800 dark:text-neutral-200'
            : 'text-neutral-400 dark:text-neutral-600 line-through decoration-neutral-300 dark:decoration-neutral-700'
        }`}
      >
        {option}
      </span>
    </div>
  );
};

export default SubscriptionCardOption;
