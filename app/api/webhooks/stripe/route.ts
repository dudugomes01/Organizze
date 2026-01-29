import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.error();
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.error();
  }
  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });
  const event = stripe.webhooks.constructEvent(
    text,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  switch (event.type) {
    case "checkout.session.completed": {
      // Primeira compra - atualizar o usuário com o plano premium
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionId = session.subscription as string;
      
      console.log("🔔 Webhook checkout.session.completed recebido");
      console.log("📝 Session ID:", session.id);
      console.log("📝 Subscription ID:", subscriptionId);
      console.log("📝 Customer ID:", session.customer);
      
      if (!subscriptionId) {
        console.error("❌ Subscription ID não encontrado");
        return NextResponse.json({ error: "No subscription ID" }, { status: 400 });
      }

      // Tentar buscar clerk_user_id dos metadados da subscription
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      console.log("📝 Subscription metadata:", subscription.metadata);
      
      let clerkUserId = subscription.metadata.clerk_user_id;
      
      // Fallback: Se não encontrou nos metadados da subscription, buscar nos metadados da session
      if (!clerkUserId && session.metadata) {
        console.log("⚠️ clerk_user_id não encontrado na subscription, tentando session metadata...");
        console.log("📝 Session metadata:", session.metadata);
        clerkUserId = session.metadata.clerk_user_id;
      }
      
      // Fallback 2: Se ainda não encontrou, buscar pelo customer
      if (!clerkUserId && session.customer) {
        console.log("⚠️ clerk_user_id não encontrado, tentando buscar pelo customer...");
        try {
          const customer = await stripe.customers.retrieve(session.customer as string);
          if ('metadata' in customer) {
            clerkUserId = customer.metadata.clerk_user_id;
            console.log("📝 Customer metadata:", customer.metadata);
          }
        } catch (err) {
          console.error("Erro ao buscar customer:", err);
        }
      }
      
      if (!clerkUserId) {
        console.error("❌ clerk_user_id não encontrado em nenhum lugar");
        console.error("Session metadata:", session.metadata);
        console.error("Subscription metadata:", subscription.metadata);
        return NextResponse.json({ error: "No clerk_user_id found" }, { status: 400 });
      }

      console.log("✅ clerk_user_id encontrado:", clerkUserId);
      console.log("🔄 Atualizando usuário no Clerk...");

      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: subscriptionId,
        },
        publicMetadata: {
          subscriptionPlan: "premium",
        },
      });
      
      console.log("✅ Usuário atualizado com sucesso!");
      break;
    }
    case "invoice.paid": {
      // Renovação - garantir que o plano continua premium
      const { customer, subscription } = event.data.object;
      
      if (!subscription) {
        break;
      }

      const subscriptionObj = await stripe.subscriptions.retrieve(
        subscription as string,
      );
      const clerkUserId = subscriptionObj.metadata.clerk_user_id;
      
      if (!clerkUserId) {
        break;
      }

      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: customer,
          stripeSubscriptionId: subscription,
        },
        publicMetadata: {
          subscriptionPlan: "premium",
        },
      });
      break;
    }
    case "customer.subscription.deleted": {
      // Remover plano premium do usuário
      const subscription = await stripe.subscriptions.retrieve(
        event.data.object.id,
      );
      const clerkUserId = subscription.metadata.clerk_user_id;
      if (!clerkUserId) {
        return NextResponse.error();
      }
      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        publicMetadata: {
          subscriptionPlan: null,
        },
      });
      break;
    }
  }
  return NextResponse.json({ received: true });
};