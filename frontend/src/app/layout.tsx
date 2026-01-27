import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Libre_Bodoni } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { plPL } from '@clerk/localizations';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const libreBodoni = Libre_Bodoni({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-libre-bodoni',
});

export const metadata: Metadata = {
  title: 'Co przeszło',
  description:
    'Sprawdź jakie ustawy i rozporządzenia zostały uchwalone w Polsce. Proste podsumowania aktów prawnych.',
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚖️</text></svg>',
  },
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          navbar:
            '!bg-none !bg-white/[0.03] dark:!bg-white/[0.04] !backdrop-blur-xl [&_p]:dark:!text-neutral-200 [&_p]:!text-neutral-800 [&_h1]:dark:!text-neutral-100 [&_h1]:!text-neutral-900 [&_.cl-active]:!text-neutral-900 [&_.cl-active]:dark:!text-neutral-100',
          navbarButton:
            '!text-neutral-500 hover:!text-neutral-800 dark:!text-neutral-400 dark:hover:!text-neutral-100 !transition-all !duration-500',
          scrollBox:
            '!bg-white/[0.03] dark:!bg-white/[0.04] !backdrop-blur-xl [&_p]:dark:!text-neutral-200 [&_p]:!text-neutral-800 [&_h1]:dark:!text-neutral-100 [&_h1]:!text-neutral-900',
          modalCloseButton:
            '!text-neutral-400 hover:!text-neutral-700 dark:!text-neutral-500 dark:hover:!text-neutral-200 dark:hover:!bg-white/[0.05] hover:!bg-black/[0.03] !shadow-none active:!shadow-none focus:!shadow-none !transition-all !duration-500 !rounded-full',
          badge:
            '!bg-white/[0.04] dark:!bg-white/[0.06] !text-neutral-700 dark:!text-neutral-200 !rounded-full !shadow-none !border-0',
          userPreviewTextContainer: 'dark:!text-neutral-200 !text-neutral-800',
          actionCard:
            '!bg-white/[0.03] dark:!bg-white/[0.04] !shadow-none !border !border-white/[0.04]',
          avatarImageActionsUpload:
            '!border !border-white/[0.06] !shadow-none !text-neutral-500 hover:!text-neutral-700 dark:!text-neutral-400 dark:hover:!text-neutral-200 !transition-all !duration-500',
          profileSectionPrimaryButton:
            '!text-neutral-500 hover:!text-neutral-700 dark:!text-neutral-400 dark:hover:!text-neutral-200 !transition-all !duration-500',
          formButtonReset:
            '!text-neutral-500 hover:!text-neutral-700 dark:!text-neutral-400 dark:hover:!text-neutral-200 !transition-all !duration-500',
          modalBackdrop: '!backdrop-blur-xl !bg-black/40',
        },
      }}
      localization={plPL}
    >
      <html lang="pl">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${libreBodoni.variable} antialiased dark before:fixed before:bg-neutral-100
        before:flex before:top-[150px] before:-translate-y-1/3
        before:left-1/2 before:-translate-x-1/2 before:bg-gradient-to-r before:from-white before:to-red-500
        before:opacity-50 before:blur-[100px] lg:before:blur-[180px] before:rounded-full before:w-120 lg:before:w-220 before:h-80 lg:before:h-180 before:rotate-45 before:-z-1 before:pointer-events-none`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
};
export default RootLayout;
