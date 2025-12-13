'use client';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'modalOpens';
const DATE_KEY = 'modalOpensDate';

export const useModalLimit = (limit = 5) => {
  const { user } = useUser();
  const [count, setCount] = useState(0);
  const canOpen =
    user?.unsafeMetadata?.subscription_status === 'active' || count < limit;

  useEffect(() => {
    const today = new Date().toDateString();
    const savedDate = localStorage.getItem(DATE_KEY);

    if (savedDate !== today) {
      localStorage.setItem(STORAGE_KEY, '0');
      localStorage.setItem(DATE_KEY, today);
      setCount(0);
      return;
    }

    const saved = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
    setCount(saved);
  }, []);

  const registerOpen = useCallback(async () => {
    if (!canOpen) return;

    const newCount = count + 1;
    setCount(newCount);
    localStorage.setItem(STORAGE_KEY, newCount.toString());

    const today = new Date().toDateString();
    localStorage.setItem(DATE_KEY, today);

    // try {
    //   await fetch('/api/update-modal-limit', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ userId: user?.id }),
    //   });
    // } catch (err) {
    //   setCount(newCount - 1);
    //   localStorage.setItem(STORAGE_KEY, (newCount - 1).toString());
    //   console.error(err);
    // }
  }, [canOpen, count]);

  return { canOpen, count, registerOpen };
};
