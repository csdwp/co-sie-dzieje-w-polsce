import { createClerkClient } from '@clerk/backend';
import { CLERK_CONFIG } from '@/lib/config';

const clerkClient = createClerkClient({
  secretKey: CLERK_CONFIG.secretKey,
});

export const POST = async (req: Request) => {
  const { userId } = await req.json();

  const user = await clerkClient.users.getUser(userId);
  const currentClicks = Number(user.unsafeMetadata?.clicks_this_month ?? 0);

  const newClicks = currentClicks + 1;

  await clerkClient.users.updateUserMetadata(userId, {
    unsafeMetadata: {
      clicks_this_month: newClicks,
    },
  });

  return Response.json({ success: true, clicks_this_month: newClicks });
};
