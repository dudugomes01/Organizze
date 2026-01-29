"use server";

import { auth } from "@clerk/nextjs/server";
import Stripe from "stripe";

export const createStripeCheckout = async () => {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }
    
    console.log("🛒 Criando checkout para usuário:", userId);
    
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Stripe secret key not found");
    }
    
    if (!process.env.STRIPE_PREMIUM_PLAN_PRICE_ID) {
      throw new Error("Stripe premium plan price ID not found");
    }
    
    if (!process.env.APP_URL) {
      throw new Error("APP_URL not found");
    }
    
    console.log("✅ Variáveis de ambiente OK");
    
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });
    
    console.log("🔄 Criando sessão do Stripe...");
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      success_url: process.env.APP_URL,
      cancel_url: process.env.APP_URL,
      metadata: {
        clerk_user_id: userId,
      },
      subscription_data: {
        metadata: {
          clerk_user_id: userId,
        },
      },
      line_items: [
        {
          price: process.env.STRIPE_PREMIUM_PLAN_PRICE_ID,
          quantity: 1,
        },
      ],
    });
    
    console.log("✅ Sessão criada com sucesso:", session.id);
    
    return { sessionId: session.id };
  } catch (error) {
    console.error("❌ Erro ao criar checkout:", error);
    throw error;
  }
};