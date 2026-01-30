'use client';

import Script from 'next/script';
import { useState, useCallback } from 'react';
import CookieConsent from './CookieConsent';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const Analytics = () => {
  const [consentGiven, setConsentGiven] = useState(false);

  const handleAccept = useCallback(() => {
    setConsentGiven(true);
  }, []);

  return (
    <>
      {consentGiven && GA_MEASUREMENT_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
        </>
      )}
      <CookieConsent onAccept={handleAccept} />
    </>
  );
};

export default Analytics;
