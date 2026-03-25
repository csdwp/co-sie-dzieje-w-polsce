import { PrismaClient, Prisma } from '@prisma/client';
import type { ActsAndKeywordsResponse, Act, Category } from '@/types';

const prisma = new PrismaClient();

const actSelect = {
  id: true,
  title: true,
  simple_title: true,
  content: true,
  announcement_date: true,
  promulgation: true,
  keywords: true,
  item_type: true,
  file: true,
  votes: true,
  category: true,
  confidence_score: true,
  created_at: true,
  change_date: true,
} as const;

type PrismaAct = Prisma.actsGetPayload<{ select: typeof actSelect }>;
type PrismaCategory = Prisma.categoryGetPayload<{ select: { category: true } }>;

const mapPrismaActToAct = (prismaAct: PrismaAct): Act => {
  return {
    id: prismaAct.id,
    title: prismaAct.title ?? '',
    simple_title: prismaAct.simple_title ?? undefined,
    content: prismaAct.content ?? undefined,
    item_type: prismaAct.item_type ?? '',
    announcement_date:
      prismaAct.announcement_date?.toISOString().split('T')[0] ?? '',
    promulgation: prismaAct.promulgation?.toISOString().split('T')[0],
    keywords: prismaAct.keywords,
    file: prismaAct.file ?? '',
    votes: prismaAct.votes as Act['votes'],
    category: prismaAct.category,
    confidence_score: prismaAct.confidence_score
      ? Number(prismaAct.confidence_score)
      : null,
    created_at: prismaAct.created_at.toISOString(),
    change_date: prismaAct.change_date?.toISOString() ?? undefined,
  };
};

const mapPrismaCategoryToCategory = (
  prismaCategory: PrismaCategory
): Category => {
  return {
    category: prismaCategory.category ?? '',
  };
};

export const getActsAndKeywords = async (
  retries = 3
): Promise<ActsAndKeywordsResponse> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const [prismaActs, prismaCategories] = await Promise.all([
        prisma.acts.findMany({
          where: {
            deleted_at: null,
          },
          select: actSelect,
        }),
        prisma.category.findMany({ select: { category: true } }),
      ]);

      const acts = prismaActs.map(mapPrismaActToAct);
      const categories = prismaCategories.map(mapPrismaCategoryToCategory);

      return { acts, categories };
    } catch (error) {
      console.error(`Attempt ${attempt}/${retries} failed:`, error);
      if (attempt === retries) {
        throw new Error('Failed to download data');
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw new Error('Failed to download data');
};
