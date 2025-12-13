import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';
import { z } from 'zod';
import { PrismaClient, Prisma, acts } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';
import { CLERK_CONFIG, DEPLOYMENT_CONFIG } from '@/lib/config';

const prisma = new PrismaClient();
const clerkClient = createClerkClient({
  secretKey: CLERK_CONFIG.secretKey,
});

const updateActSchema = z.object({
  actId: z.number().int().positive(),
  content: z.string().max(50000).optional(),
  simpleTitle: z.string().max(500).optional(),
  impactSection: z.string().max(10000).optional(),
});

type UpdateActRequest = z.infer<typeof updateActSchema>;

interface UpdateActResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    confidenceScore: number;
    updatedAt: string;
  };
}

export const POST = async (
  request: Request
): Promise<NextResponse<UpdateActResponse>> => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await clerkClient.users.getUser(userId);

    if (!user.publicMetadata?.role || user.publicMetadata.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin role required' },
        { status: 403 }
      );
    }

    let validatedData: UpdateActRequest;

    try {
      const requestBody = await request.json();
      validatedData = updateActSchema.parse(requestBody);
    } catch (error) {
      console.error('Validation error:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
      );
    }

    const sanitizeOptions = {
      allowedTags: ['p', 'ul', 'li', 'strong', 'em', 'br'],
      allowedAttributes: {},
    };

    if (validatedData.content !== undefined) {
      validatedData.content = sanitizeHtml(
        validatedData.content,
        sanitizeOptions
      );
    }

    try {
      const existingAct = await prisma.acts.findUnique({
        where: { id: validatedData.actId },
      });

      if (!existingAct) {
        return NextResponse.json(
          { success: false, message: 'Act not found' },
          { status: 404 }
        );
      }

      const updateData: Prisma.actsUpdateInput = {
        confidence_score: new Prisma.Decimal(0.99),
        updated_at: new Date(),
      };

      if (validatedData.content !== undefined) {
        updateData.content = validatedData.content;
      }
      if (validatedData.simpleTitle !== undefined) {
        updateData.simple_title = validatedData.simpleTitle;
      }
      if (validatedData.impactSection !== undefined) {
        updateData.impact_section = validatedData.impactSection;
      }

      const updatedAct: acts = await prisma.acts.update({
        where: { id: validatedData.actId },
        data: updateData,
      });

      try {
        const deployHookUrl = DEPLOYMENT_CONFIG.vercelDeployHookUrl;

        if (deployHookUrl) {
          fetch(deployHookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          }).catch(webhookError => {
            console.error('Webhook trigger failed:', webhookError);
          });
        } else {
          console.warn('VERCEL_DEPLOY_HOOK_URL not configured');
        }
      } catch (webhookError) {
        console.error('Webhook trigger error:', webhookError);
      }

      return NextResponse.json({
        success: true,
        message: 'Act updated successfully. Rebuild in progress (~2-5 min).',
        data: {
          id: updatedAct.id,
          confidenceScore: Number(updatedAct.confidence_score?.toString() || 0),
          updatedAt: updatedAct.updated_at.toISOString(),
        },
      });
    } catch (dbError) {
      if (dbError instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Database error details:', {
          message: dbError.message,
          code: dbError.code,
          meta: dbError.meta,
        });
        return NextResponse.json(
          {
            success: false,
            message: 'Database error',
            details:
              DEPLOYMENT_CONFIG.nodeEnv === 'development'
                ? dbError.message
                : undefined,
          },
          { status: 500 }
        );
      }

      console.error('Unexpected database error:', dbError);
      return NextResponse.json(
        { success: false, message: 'Database error' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating act:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
};
