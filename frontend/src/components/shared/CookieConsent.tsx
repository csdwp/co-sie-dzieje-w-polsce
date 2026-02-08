'use client';

import { useState, useEffect, useCallback } from 'react';

const CONSENT_KEY = 'cookie-consent';

type ConsentStatus = 'pending' | 'accepted' | 'rejected';

interface CookieConsentProps {
  onAccept: () => void;
}

const CookieConsent = ({ onAccept }: CookieConsentProps) => {
  const [status, setStatus] = useState<ConsentStatus>('pending');
  const [isVisible, setIsVisible] = useState(false);
  const [nudge, setNudge] = useState(false);

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

  useEffect(() => {
    if (isVisible && status === 'pending') {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isVisible, status]);

  const handleOverlayClick = useCallback(() => {
    setNudge(true);
    setTimeout(() => setNudge(false), 600);
  }, []);

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
    <>
      <div
        className="fixed inset-0 z-[9998] cursor-not-allowed"
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <div
        className={`fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 transition-transform duration-300 ${
          nudge ? '-translate-y-2' : 'translate-y-0'
        }`}
      >
        <div
          className={`mx-auto max-w-2xl bg-white/[0.03] dark:bg-white/[0.04] backdrop-blur-xl rounded-2xl premium-shadow premium-border p-4 sm:p-5 transition-all duration-300 ${
            nudge
              ? 'ring-2 ring-red-400/60 dark:ring-red-400/40 shadow-[0_0_30px_-5px_rgba(248,113,113,0.3)]'
              : ''
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-300 flex-1">
              <span
                className={`inline-block transition-opacity duration-300 ${
                  nudge ? 'opacity-100' : 'opacity-0'
                }`}
              >
                👆{' '}
              </span>
              {nudge ? (
                <span className="text-neutral-800 dark:text-neutral-100 font-medium">
                  Wybierz jedną z opcji, aby kontynuować.
                </span>
              ) : (
                <>
                  Używamy plików cookie do analizy ruchu.{' '}
                  <a
                    href="/polityka-prywatnosci"
                    className="underline underline-offset-2 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                  >
                    Polityka prywatności
                  </a>
                </>
              )}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleReject}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-all duration-300 rounded-lg ${
                  nudge ? 'bg-neutral-100 dark:bg-white/[0.06]' : ''
                }`}
              >
                Odrzuć
              </button>
              <button
                onClick={handleAccept}
                className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all duration-300 ${
                  nudge ? 'scale-105' : ''
                }`}
              >
                Akceptuję
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieConsent;
