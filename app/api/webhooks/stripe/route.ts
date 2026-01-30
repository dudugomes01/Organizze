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
      // Assinatura expirada ou cancelada - remover plano premium do usuário
      console.log("🔔 Webhook customer.subscription.deleted recebido");
      console.log("📝 Subscription ID:", event.data.object.id);
      
      const subscription = await stripe.subscriptions.retrieve(
        event.data.object.id,
      );
      
      console.log("📝 Subscription metadata:", subscription.metadata);
      console.log("📝 Subscription status:", subscription.status);
      console.log("📝 Ended at:", subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : 'null');
      
      const clerkUserId = subscription.metadata.clerk_user_id;
      
      if (!clerkUserId) {
        console.error("❌ clerk_user_id não encontrado na subscription deletada");
        return NextResponse.json({ error: "No clerk_user_id found" }, { status: 400 });
      }
      
      console.log("✅ clerk_user_id encontrado:", clerkUserId);
      console.log("🔄 Removendo plano premium do usuário...");
      
      await clerkClient().users.updateUser(clerkUserId, {
        privateMetadata: {
          stripeCustomerId: null,
          stripeSubscriptionId: null,
        },
        publicMetadata: {
          subscriptionPlan: null,
        },
      });
      
      console.log("✅ Plano premium removido com sucesso!");
      console.log("👤 Usuário agora está no plano básico");
      break;
    }
    case "customer.subscription.updated": {
      // Assinatura atualizada - verificar se foi cancelada
      console.log("🔔 Webhook customer.subscription.updated recebido");
      console.log("📝 Subscription ID:", event.data.object.id);
      
      const subscription = event.data.object as Stripe.Subscription;
      
      console.log("📝 Subscription status:", subscription.status);
      console.log("📝 Cancel at period end:", subscription.cancel_at_period_end);
      console.log("📝 Current period end:", new Date(subscription.current_period_end * 1000).toISOString());
      
      const clerkUserId = subscription.metadata.clerk_user_id;
      
      if (!clerkUserId) {
        console.error("❌ clerk_user_id não encontrado na subscription");
        break;
      }
      
      console.log("✅ clerk_user_id encontrado:", clerkUserId);
      
      // Se a assinatura foi cancelada, atualizar metadata
      if (subscription.cancel_at_period_end) {
        console.log("⚠️ Assinatura marcada para cancelamento no final do período");
        console.log("🔄 Atualizando metadata do usuário...");
        
        await clerkClient().users.updateUser(clerkUserId, {
          privateMetadata: {
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            subscriptionCancelAtPeriodEnd: true,
            subscriptionCurrentPeriodEnd: subscription.current_period_end,
          },
          publicMetadata: {
            subscriptionPlan: "premium", // Mantém premium até expirar
          },
        });
        
        console.log("✅ Metadata atualizado com informação de cancelamento!");
      } else {
        // Assinatura reativada ou atualizada normalmente
        console.log("✅ Assinatura ativa ou reativada");
        
        await clerkClient().users.updateUser(clerkUserId, {
          privateMetadata: {
            stripeCustomerId: subscription.customer as string,
            stripeSubscriptionId: subscription.id,
            subscriptionCancelAtPeriodEnd: false,
            subscriptionCurrentPeriodEnd: subscription.current_period_end,
          },
          publicMetadata: {
            subscriptionPlan: "premium",
          },
        });
        
        console.log("✅ Metadata atualizado!");
      }
      break;
    }
  }
  return NextResponse.json({ received: true });
};