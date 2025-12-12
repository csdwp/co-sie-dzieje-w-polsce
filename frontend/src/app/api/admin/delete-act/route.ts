import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';
import { z } from 'zod';
import { PrismaClient, Prisma, acts } from '@prisma/client';

const prisma = new PrismaClient();
const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const deleteActSchema = z.object({
  actId: z.number().int().positive(),
});

type DeleteActRequest = z.infer<typeof deleteActSchema>;

interface DeleteActResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    deletedAt: string;
  };
}

export const POST = async (
  request: Request
): Promise<NextResponse<DeleteActResponse>> => {
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

    let validatedData: DeleteActRequest;

    try {
      const requestBody = await request.json();
      validatedData = deleteActSchema.parse(requestBody);
    } catch (error) {
      console.error('Validation error:', error);
      return NextResponse.json(
        { success: false, message: 'Invalid request data' },
        { status: 400 }
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

      if (existingAct.deleted_at) {
        return NextResponse.json(
          { success: false, message: 'Act already deleted' },
          { status: 400 }
        );
      }

      const deletedAt = new Date();

      const deletedAct: acts = await prisma.acts.update({
        where: { id: validatedData.actId },
        data: {
          deleted_at: deletedAt,
          updated_at: deletedAt,
        },
      });

      /* TODO: Uncomment when we have a deploy hook */
      // try {
      //   const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;

      //   if (deployHookUrl) {
      //     fetch(deployHookUrl, {
      //       method: 'POST',
      //       headers: {
      //         'Content-Type': 'application/json',
      //       },
      //     }).catch(webhookError => {
      //       console.error('Webhook trigger failed:', webhookError);
      //     });
      //   } else {
      //     console.warn('VERCEL_DEPLOY_HOOK_URL not configured');
      //   }
      // } catch (webhookError) {
      //   console.error('Webhook trigger error:', webhookError);
      // }

      console.log('ACT_DELETED', {
        actId: deletedAct.id,
        adminUserId: userId,
        deletedAt: deletedAt.toISOString(),
        title: deletedAct.title,
      });

      return NextResponse.json({
        success: true,
        message: 'Act deleted successfully. Rebuild in progress (~2-5 min).',
        data: {
          id: deletedAct.id,
          deletedAt: deletedAt.toISOString(),
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
    console.error('Error deleting act:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
};
