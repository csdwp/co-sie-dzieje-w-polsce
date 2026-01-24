'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { loadStripe } from '@stripe/stripe-js';
import { useUser } from '@clerk/nextjs';
import SubscriptionCard from './SubscriptionCard';
import { STRIPE_CONFIG } from '@/lib/config';

interface CheckoutSessionResponse {
  sessionId: string;
}

const stripePromise = loadStripe(STRIPE_CONFIG.publishableKey!);

const SubscriptionModal = ({ onClose }: { onClose: () => void }) => {
  const { user } = useUser();

  const handleSubscribe = async (priceId: string): Promise<void> => {
    const stripe = await stripePromise;
    const { sessionId }: CheckoutSessionResponse = await fetch(
      '/api/create-checkout-session',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId, userId: user?.id }),
      }
    ).then(res => res.json());

    if (!stripe) {
      console.error('Stripe failed to load.');
      return;
    }

    const result = await stripe.redirectToCheckout({ sessionId });

    if (result.error) {
      console.error(result.error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="overflow-auto w-11/12 h-fit lg:w-5/12 lg:h-fit !max-w-[1000px] max-h-11/12 rounded-3xl flex flex-col gap-6 border-none">
        <DialogHeader className="h-fit">
          <DialogTitle className="text-2xl font-bold leading-tight text-left">
            Odblokuj pełny dostęp do aktów prawnych – bez ograniczeń!
          </DialogTitle>
          <DialogDescription className="text-base font-light dark:text-neutral-100 md:max-w-4/5 text-left">
            Z subskrypcją zyskasz nielimitowany dostęp do pełnych i skróconych
            aktów prawnych, statystyk, kategorii oraz cennych informacji – bez
            limitu 5 aktów dziennie. Oszczędzaj czas i bądź na bieżąco z prawem!
          </DialogDescription>
        </DialogHeader>
        <ProductsWrapper handleSubscribe={handleSubscribe} />
      </DialogContent>
    </Dialog>
  );
};

const ProductsWrapper = ({
  handleSubscribe,
}: {
  handleSubscribe: (priceId: string) => void;
}) => {
  return (
    <div className="flex flex-col gap-4 text-left text-sm w-full">
      <div className="max-sm:w-full max-sm:overflow-x-auto max-sm:p-8 max-sm:-m-8">
        <div className="flex flex-row gap-4 items-end w-max sm:w-fit">
          <SubscriptionCard
            title="Plan Premium"
            isBest={true}
            maxWidth={300}
            price={49}
            priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM}
            onSubscribe={handleSubscribe}
            options={[
              {
                option: 'Nielimitowany dostęp do aktów prawnych',
                active: true,
              },
              { option: 'Dostęp do statystyk i kategorii', active: true },
              { option: 'Aktualizacje na bieżąco', active: true },
              { option: 'Wsparcie klienta', active: true },
              { option: 'Dostęp mobilny', active: true },
              { option: 'Funkcje premium w przyszłości', active: true },
            ]}
          />
          <SubscriptionCard
            title="Plan Podstawowy"
            isBest={false}
            price={29}
            maxWidth={300}
            priceId={process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC}
            onSubscribe={handleSubscribe}
            options={[
              {
                option: 'Nielimitowany dostęp do aktów prawnych',
                active: true,
              },
              { option: 'Dostęp do statystyk i kategorii', active: true },
              { option: 'Aktualizacje na bieżąco', active: false },
              { option: 'Wsparcie klienta', active: false },
              { option: 'Dostęp mobilny', active: false },
            ]}
          />
        </div>
      </div>

      <label className="flex items-start gap-2 cursor-pointer group">
        <input type="checkbox" required className="hidden peer mt-1" />
        <svg
          className="w-4.5 h-4.5 flex-shrink-0 mt-px text-neutral-600 group-hover:text-neutral-900 peer-checked:text-neutral-900 peer-checked:group-hover:text-neutral-900 dark:text-neutral-500 dark:group-hover:text-neutral-100 dark:peer-checked:text-neutral-100 dark:peer-checked:group-hover:text-neutral-100 opacity-50 peer-checked:opacity-100 group-hover:opacity-100 duration-300 transition-all"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>
          Wyrażam zgodę na rozpoczęcie świadczenia usługi przed upływem terminu
          odstąpienia i przyjmuję do wiadomości, że tracę prawo do odstąpienia
          od umowy.
        </span>
      </label>

      <p className="text-xs text-neutral-500">
        Subskrypcja odnawia się automatycznie co miesiąc. Możesz anulować w
        dowolnym momencie w ustawieniach swojego konta Stripe. <br />
        <a href="/regulamin" className="underline">
          Regulamin
        </a>{' '}
        |{' '}
        <a href="/polityka-prywatnosci" className="underline">
          Polityka prywatności
        </a>
      </p>
    </div>
  );
};

export default SubscriptionModal;
