import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Polityka Prywatności',
  description:
    'Polityka prywatności serwisu Co przeszło. Informacje o przetwarzaniu danych osobowych i plikach cookie.',
};

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-8"
        >
          <span>←</span>
          <span>Powrót do strony głównej</span>
        </Link>

        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Polityka Prywatności
          </h1>
          <p className="text-neutral-500">
            Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>
        </header>

        <div className="prose prose-invert prose-neutral max-w-none space-y-8">
          <Section title="1. Administrator danych">
            <p>
              Administratorem Twoich danych osobowych jest serwis{' '}
              <strong>Co przeszło</strong> dostępny pod adresem{' '}
              <a
                href="https://coprzeszlo.pl"
                className="text-neutral-300 underline underline-offset-2 hover:text-white transition-colors"
              >
                coprzeszlo.pl
              </a>
              .
            </p>
          </Section>

          <Section title="2. Jakie dane zbieramy">
            <p>W ramach korzystania z serwisu możemy zbierać:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-neutral-400">
              <li>
                <strong className="text-neutral-300">Dane konta</strong> — adres
                e-mail i dane profilu przy rejestracji przez Clerk
              </li>
              <li>
                <strong className="text-neutral-300">Dane analityczne</strong> —
                anonimowe informacje o korzystaniu z serwisu (Google Analytics)
              </li>
              <li>
                <strong className="text-neutral-300">Dane techniczne</strong> —
                adres IP, typ przeglądarki, czas wizyty
              </li>
            </ul>
          </Section>

          <Section title="3. Cele przetwarzania">
            <p>Twoje dane przetwarzamy w celu:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-neutral-400">
              <li>Świadczenia usług serwisu i obsługi konta użytkownika</li>
              <li>Analizy ruchu i poprawy jakości serwisu</li>
              <li>Zapewnienia bezpieczeństwa serwisu</li>
            </ul>
          </Section>

          <Section title="4. Pliki cookie">
            <p>Serwis wykorzystuje pliki cookie do:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-neutral-400">
              <li>
                <strong className="text-neutral-300">
                  Niezbędne (sesyjne)
                </strong>{' '}
                — utrzymanie sesji logowania
              </li>
              <li>
                <strong className="text-neutral-300">Analityczne</strong> —
                Google Analytics (tylko po wyrażeniu zgody)
              </li>
            </ul>
            <p className="mt-4">
              Możesz zarządzać zgodą na pliki cookie w dowolnym momencie.
              Analityczne pliki cookie są ładowane tylko po Twojej akceptacji.
            </p>
          </Section>

          <Section title="5. Podstawy prawne">
            <p>Przetwarzamy dane na podstawie:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-neutral-400">
              <li>
                <strong className="text-neutral-300">
                  Art. 6 ust. 1 lit. a RODO
                </strong>{' '}
                — Twoja zgoda (pliki cookie analityczne)
              </li>
              <li>
                <strong className="text-neutral-300">
                  Art. 6 ust. 1 lit. b RODO
                </strong>{' '}
                — wykonanie umowy (świadczenie usług)
              </li>
              <li>
                <strong className="text-neutral-300">
                  Art. 6 ust. 1 lit. f RODO
                </strong>{' '}
                — prawnie uzasadniony interes (bezpieczeństwo)
              </li>
            </ul>
          </Section>

          <Section title="6. Twoje prawa">
            <p>Przysługuje Ci prawo do:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-neutral-400">
              <li>Dostępu do swoich danych</li>
              <li>Sprostowania danych</li>
              <li>Usunięcia danych (&quot;prawo do bycia zapomnianym&quot;)</li>
              <li>Ograniczenia przetwarzania</li>
              <li>Przenoszenia danych</li>
              <li>Sprzeciwu wobec przetwarzania</li>
              <li>Cofnięcia zgody w dowolnym momencie</li>
            </ul>
          </Section>

          <Section title="7. Okres przechowywania">
            <p>
              Dane przechowujemy przez okres niezbędny do realizacji celów, dla
              których zostały zebrane, lub do momentu wycofania zgody. Dane
              analityczne są przechowywane przez 14 miesięcy.
            </p>
          </Section>

          <Section title="8. Odbiorcy danych">
            <p>Twoje dane mogą być przekazywane:</p>
            <ul className="list-disc list-inside space-y-2 mt-3 text-neutral-400">
              <li>
                <strong className="text-neutral-300">Clerk</strong> — obsługa
                autoryzacji i kont użytkowników
              </li>
              <li>
                <strong className="text-neutral-300">Google Analytics</strong> —
                analiza ruchu (po wyrażeniu zgody)
              </li>
              <li>
                <strong className="text-neutral-300">Vercel</strong> — hosting
                serwisu
              </li>
            </ul>
          </Section>

          <Section title="9. Kontakt">
            <p>
              W sprawach związanych z ochroną danych osobowych możesz
              skontaktować się z nami poprzez e-mail lub formularz kontaktowy
              dostępny w serwisie.
            </p>
          </Section>

          <Section title="10. Zmiany polityki">
            <p>
              Zastrzegamy sobie prawo do zmiany niniejszej polityki prywatności.
              O istotnych zmianach poinformujemy poprzez powiadomienie w
              serwisie.
            </p>
          </Section>
        </div>

        <footer className="mt-16 pt-8 border-t border-white/[0.06]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <span>←</span>
            <span>Powrót do strony głównej</span>
          </Link>
        </footer>
      </article>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <section className="space-y-3">
    <h2 className="text-xl font-semibold text-neutral-200">{title}</h2>
    <div className="text-neutral-400 leading-relaxed">{children}</div>
  </section>
);

export default PrivacyPolicy;
