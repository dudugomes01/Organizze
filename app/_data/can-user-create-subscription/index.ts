import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/app/_lib/prisma";

export const canUserCreateSubscription = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  
  const user = await clerkClient().users.getUser(userId);
  
  // Se for premium, pode criar ilimitadas
  if (user.publicMetadata.subscriptionPlan === "premium") {
    return true;
  }
  
  // Se não for premium, só pode ter até 3 assinaturas
  const subscriptionsCount = await db.recurringSubscription.count({
    where: { userId },
  });
  
  if (subscriptionsCount >= 3) {
    return false;
  }
  
  return true;
};
