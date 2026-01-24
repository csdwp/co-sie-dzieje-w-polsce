'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ANONYMOUS_DAILY_LIMIT, AUTHENTICATED_DAILY_LIMIT } from '@/lib/config';
import { SignInButton } from '@clerk/nextjs';

interface DailyLimitModalProps {
  onClose: () => void;
}

const DailyLimitModal = ({ onClose }: DailyLimitModalProps) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        data-testid="limit-modal"
        className="overflow-auto w-11/12 h-fit lg:w-5/12 lg:h-fit !max-w-[600px] rounded-3xl flex flex-col gap-6 border-none"
      >
        <DialogHeader className="h-fit">
          <DialogTitle className="text-2xl font-bold leading-tight text-left">
            🕐 &nbsp;Osiągnięto dzienny limit przeglądania
          </DialogTitle>
          <DialogDescription
            data-testid="limit-message"
            className="text-base font-light dark:text-neutral-100 md:max-w-4/5 text-left"
          >
            Wykorzystałeś swój dzienny limit{' '}
            <strong>{ANONYMOUS_DAILY_LIMIT} aktów prawnych</strong>.<br />
            Zaloguj się, aby zwiększyć limit do{' '}
            <strong>{AUTHENTICATED_DAILY_LIMIT} aktów dziennie</strong>, lub
            wróć jutro!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 text-left text-sm text-neutral-700 dark:text-neutral-300">
          <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="font-semibold mb-2 text-red-900 dark:text-red-100">
              ℹ️ &nbsp;Dobra wiadomość!
            </h3>
            <p>
              Twój limit odnawiany jest automatycznie{' '}
              <strong>co 24 godziny</strong>.<br /> Wróć później, aby
              kontynuować śledzenie zmian w polskim prawie.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full">
          <SignInButton mode="modal">
            <button className="w-full sm:w-auto px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200">
              Zaloguj się ({AUTHENTICATED_DAILY_LIMIT} aktów/dzień)
            </button>
          </SignInButton>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 font-semibold rounded-lg transition-colors duration-200"
          >
            Wrócę później
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DailyLimitModal;
