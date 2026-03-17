'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'cookie-consent';

type ConsentStatus = 'pending' | 'accepted' | 'rejected';

interface CookieConsentProps {
  onAccept: () => void;
}

const CookieConsent = ({ onAccept }: CookieConsentProps) => {
  const [status, setStatus] = useState<ConsentStatus>('pending');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY) as ConsentStatus | null;
    if (stored === 'accepted') {
      onAccept();
      setStatus('accepted');
    } else if (stored === 'rejected') {
      setStatus('rejected');
    } else {
      setIsVisible(true);
    }
  }, [onAccept]);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setStatus('accepted');
    setIsVisible(false);
    onAccept();
  };

  const handleReject = () => {
    localStorage.setItem(CONSENT_KEY, 'rejected');
    setStatus('rejected');
    setIsVisible(false);
  };

  if (!isVisible || status !== 'pending') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6">
      <div className="mx-auto max-w-2xl bg-white/[0.03] dark:bg-white/[0.04] backdrop-blur-xl rounded-2xl premium-shadow premium-border p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-300 flex-1">
            Używamy plików cookie do analizy ruchu.{' '}
            <Link
              href="/polityka-prywatnosci"
              className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            >
              Polityka prywatności
            </Link>
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleReject}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all duration-300 rounded-lg"
            >
              Odrzuć
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-300"
            >
              Akceptuję
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
