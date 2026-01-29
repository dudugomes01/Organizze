"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const createStripePortalLink = async () => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const user = await clerkClient().users.getUser(userId);
  let stripeCustomerId = user.privateMetadata.stripeCustomerId as string | undefined;

  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe secret key not found");
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });

  // Se não tem customer ID salvo, tenta buscar pela subscription ID
  if (!stripeCustomerId) {
    const stripeSubscriptionId = user.privateMetadata.stripeSubscriptionId as string | undefined;
    
    if (stripeSubscriptionId) {
      console.log("🔍 Buscando customer ID pela subscription...");
      try {
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        stripeCustomerId = subscription.customer as string;
        
        // Salva o customer ID para não precisar buscar novamente
        await clerkClient().users.updateUser(userId, {
          privateMetadata: {
            stripeCustomerId,
          },
        });
        console.log("✅ Customer ID salvo:", stripeCustomerId);
      } catch (error) {
        console.error("❌ Erro ao buscar subscription:", error);
      }
    }
  }

  // Se ainda não tem customer ID, busca todas as subscriptions do Stripe com o user_id nos metadados
  if (!stripeCustomerId) {
    console.log("🔍 Buscando subscriptions no Stripe por user_id...");
    try {
      const subscriptions = await stripe.subscriptions.list({
        limit: 10,
      });

      const userSubscription = subscriptions.data.find(
        (sub) => sub.metadata.clerk_user_id === userId
      );

      if (userSubscription) {
        stripeCustomerId = userSubscription.customer as string;
        
        // Salva ambos os IDs
        await clerkClient().users.updateUser(userId, {
          privateMetadata: {
            stripeCustomerId,
            stripeSubscriptionId: userSubscription.id,
          },
        });
        console.log("✅ Customer ID e Subscription ID salvos!");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar subscriptions:", error);
    }
  }

  if (!stripeCustomerId) {
    throw new Error("Você ainda não possui uma assinatura ativa no Stripe. Por favor, adquira o plano premium primeiro.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.APP_URL}/subscription`,
  });

  return { url: session.url };
};
