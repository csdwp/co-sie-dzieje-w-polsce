import { useUser } from '@clerk/nextjs';
import { CONFIDENCE_THRESHOLD } from './config';

export const useIsAdmin = () => {
  const { user } = useUser();
  return user?.publicMetadata?.role === 'admin';
};

export const isLowConfidence = (confidenceScore?: number | null): boolean => {
  return (
    confidenceScore !== null &&
    confidenceScore !== undefined &&
    confidenceScore < CONFIDENCE_THRESHOLD
  );
};
