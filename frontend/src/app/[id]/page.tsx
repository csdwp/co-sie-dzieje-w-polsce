import ClientWrapper from '@/components/ClientWrapper';
import { getActsAndKeywords } from '@/app/lib/acts';
import type { ActsAndKeywordsResponse } from '@/types';

export const dynamic = 'force-dynamic';

const ActPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const data: ActsAndKeywordsResponse = await getActsAndKeywords();

  return <ClientWrapper data={data} initialOpenId={Number(id)} />;
};

export default ActPage;
