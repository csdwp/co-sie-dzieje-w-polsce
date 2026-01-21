import ClientWrapper from '@/components/ClientWrapper';
import { getActsAndKeywords } from '@/app/lib/acts';
import type { ActsAndKeywordsResponse } from '@/types';

const Home = async () => {
  const data: ActsAndKeywordsResponse = await getActsAndKeywords();

  return <ClientWrapper data={data} />;
};

export default Home;
