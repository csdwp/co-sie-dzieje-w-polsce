'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useUser } from '@clerk/nextjs';
import { SignInButton } from '@clerk/nextjs';

interface DailyLimitModalProps {
  onClose: () => void;
}

const DailyLimitModal = ({ onClose }: DailyLimitModalProps) => {
  const { isSignedIn } = useUser();

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="overflow-auto w-11/12 h-fit lg:w-5/12 lg:h-fit !max-w-[600px] rounded-3xl flex flex-col gap-6 border-none">
        <DialogHeader className="h-fit">
          <DialogTitle className="text-2xl font-bold leading-tight tracking-tighter text-left">
            🕐 Osiągnięto dzienny limit przeglądania
          </DialogTitle>
          <DialogDescription className="text-base font-light dark:text-neutral-100 md:max-w-4/5 text-left">
            {isSignedIn ? (
              <>
                Wykorzystałeś swój dzienny limit{' '}
                <strong>5 aktów prawnych</strong>. Wróć jutro, aby kontynuować
                przeglądanie najnowszych zmian w prawie.
              </>
            ) : (
              <>
                Wykorzystałeś swój dzienny limit{' '}
                <strong>3 aktów prawnych</strong>. Zaloguj się, aby zwiększyć
                limit do <strong>5 aktów dziennie</strong>, lub wróć jutro!
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 text-left text-sm text-neutral-700 dark:text-neutral-300">
          <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-neutral-900 dark:text-neutral-100">
              💡 Dlaczego wprowadziliśmy limity?
            </h3>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Chronimy jakość naszej usługi przed nadmiernym obciążeniem
              </li>
              <li>Zapewniamy równy dostęp wszystkim obywatelom</li>
              <li>Utrzymujemy infrastrukturę i koszty przetwarzania AI</li>
            </ul>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
              ℹ️ Dobre wiadomości!
            </h3>
            <p>
              Twój limit odnawiany jest automatycznie{' '}
              <strong>każdego dnia o północy</strong>. Wróć jutro, aby
              kontynuować śledzenie zmian w polskim prawie.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 w-full">
          {!isSignedIn && (
            <SignInButton mode="modal">
              <button className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200">
                Zaloguj się (5 aktów/dzień)
              </button>
            </SignInButton>
          )}
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 font-semibold rounded-lg transition-colors duration-200"
          >
            {isSignedIn ? 'Zamknij' : 'Wrócę jutro'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DailyLimitModal;
