import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Libre_Bodoni } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { plPL } from '@clerk/localizations';
import Analytics from '@/components/shared/Analytics';

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

const siteUrl = 'https://coprzeszlo.pl';
const siteName = 'Co przeszło';
const siteDescription =
  'Sprawdź jakie ustawy i rozporządzenia zostały uchwalone w Polsce. Proste podsumowania aktów prawnych dla każdego obywatela.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} - Polskie akty prawne w prostym języku`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: [
    'ustawy',
    'rozporządzenia',
    'prawo polskie',
    'akty prawne',
    'Sejm',
    'Polska',
    'legislacja',
    'podsumowania ustaw',
    'prawo w prostym języku',
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  formatDetection: {
    email: false,
    telephone: false,
  },
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⚖️</text></svg>',
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: siteUrl,
    siteName: siteName,
    title: `${siteName} - Polskie akty prawne w prostym języku`,
    description: siteDescription,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${siteName} - Śledź polskie prawo`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteName} - Polskie akty prawne w prostym języku`,
    description: siteDescription,
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: siteName,
      description: siteDescription,
      inLanguage: 'pl-PL',
    },
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: siteName,
      url: siteUrl,
      description:
        'Platforma obywatelska prezentująca akty prawne w przystępnym języku.',
    },
    {
      '@type': 'WebPage',
      '@id': `${siteUrl}/#webpage`,
      url: siteUrl,
      name: `${siteName} - Polskie akty prawne w prostym języku`,
      description: siteDescription,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'pl-PL',
    },
  ],
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
        <head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${libreBodoni.variable} antialiased dark before:fixed before:bg-neutral-100
        before:flex before:top-[150px] before:-translate-y-1/3
        before:left-1/2 before:-translate-x-1/2 before:bg-gradient-to-r before:from-white before:to-red-500
        before:opacity-50 before:blur-[100px] lg:before:blur-[180px] before:rounded-full before:w-120 lg:before:w-220 before:h-80 lg:before:h-180 before:rotate-45 before:-z-1 before:pointer-events-none`}
        >
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
};

export default RootLayout;
