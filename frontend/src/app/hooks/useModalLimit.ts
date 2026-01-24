'use client';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';

const COOKIE_NAME = 'modalOpens';
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24 hours in seconds

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export const useModalLimit = (limit = 5) => {
  const { user } = useUser();
  const [count, setCount] = useState(0);
  const canOpen =
    user?.unsafeMetadata?.subscription_status === 'active' || count < limit;

  useEffect(() => {
    const saved = parseInt(getCookie(COOKIE_NAME) || '0', 10);
    setCount(saved);
  }, []);

  const registerOpen = useCallback(async () => {
    if (!canOpen) return;

    const newCount = count + 1;
    setCount(newCount);
    setCookie(COOKIE_NAME, newCount.toString(), COOKIE_MAX_AGE);
  }, [canOpen, count]);

  return { canOpen, count, registerOpen };
};
