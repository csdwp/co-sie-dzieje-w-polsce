import ClientWrapper from '@/components/ClientWrapper';
import { getActsAndKeywords } from '@/app/lib/acts';
import type { ActsAndKeywordsResponse } from '@/types';

export async function generateStaticParams() {
  const { acts } = await getActsAndKeywords();
  return acts.map(act => ({ id: String(act.id) }));
}

const ActPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const data: ActsAndKeywordsResponse = await getActsAndKeywords();

  return <ClientWrapper data={data} initialOpenId={Number(id)} />;
};

export default ActPage;
