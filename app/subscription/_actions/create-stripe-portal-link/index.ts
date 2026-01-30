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

  // Função auxiliar para validar se o customer existe no Stripe
  const validateCustomerId = async (customerId: string): Promise<boolean> => {
    try {
      await stripe.customers.retrieve(customerId);
      console.log(`✅ Customer ${customerId} validado com sucesso`);
      return true;
    } catch (error) {
      console.log(`❌ Customer ${customerId} não encontrado no Stripe`);
      return false;
    }
  };

  // Se tem customer ID salvo, valida se ainda existe no Stripe
  if (stripeCustomerId) {
    console.log(`🔍 Validando customer ID existente: ${stripeCustomerId}`);
    const isValid = await validateCustomerId(stripeCustomerId);
    if (!isValid) {
      console.log("⚠️ Customer ID inválido detectado, limpando metadata...");
      // Limpa o customer ID inválido
      await clerkClient().users.updateUser(userId, {
        privateMetadata: {
          stripeCustomerId: null,
        },
      });
      stripeCustomerId = undefined;
    }
  }

  // Se não tem customer ID válido, tenta buscar pela subscription ID
  if (!stripeCustomerId) {
    const stripeSubscriptionId = user.privateMetadata.stripeSubscriptionId as string | undefined;
    
    if (stripeSubscriptionId) {
      console.log("🔍 Buscando customer ID pela subscription...");
      try {
        const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
        const customerId = subscription.customer as string;
        
        // Valida o customer antes de salvar
        const isValid = await validateCustomerId(customerId);
        if (isValid) {
          stripeCustomerId = customerId;
          
          // Salva o customer ID para não precisar buscar novamente
          await clerkClient().users.updateUser(userId, {
            privateMetadata: {
              stripeCustomerId,
            },
          });
          console.log("✅ Customer ID salvo:", stripeCustomerId);
        } else {
          console.log("❌ Customer ID encontrado mas inválido");
        }
      } catch (error) {
        console.error("❌ Erro ao buscar subscription:", error);
      }
    }
  }

  // Se ainda não tem customer ID válido, busca todas as subscriptions ativas
  if (!stripeCustomerId) {
    console.log("🔍 Buscando subscriptions ativas no Stripe por metadata...");
    try {
      // Busca apenas subscriptions ativas
      const subscriptions = await stripe.subscriptions.list({
        limit: 100,
        status: 'active',
      });

      const userSubscription = subscriptions.data.find(
        (sub) => sub.metadata.clerk_user_id === userId
      );

      if (userSubscription) {
        const customerId = userSubscription.customer as string;
        
        // Valida o customer antes de salvar
        const isValid = await validateCustomerId(customerId);
        if (isValid) {
          stripeCustomerId = customerId;
          
          // Salva ambos os IDs
          await clerkClient().users.updateUser(userId, {
            privateMetadata: {
              stripeCustomerId,
              stripeSubscriptionId: userSubscription.id,
            },
          });
          console.log("✅ Customer ID e Subscription ID salvos!");
        }
      } else {
        console.log("❌ Nenhuma subscription ativa encontrada para este usuário");
      }
    } catch (error) {
      console.error("❌ Erro ao buscar subscriptions:", error);
    }
  }

  // Se ainda não tem customer ID válido, retorna erro amigável
  if (!stripeCustomerId) {
    console.log("❌ Nenhum customer ID válido encontrado para o usuário");
    
    // Limpa completamente o metadata
    await clerkClient().users.updateUser(userId, {
      privateMetadata: {
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      },
    });
    
    throw new Error("Não encontramos uma assinatura ativa vinculada à sua conta. Por favor, adquira o plano premium.");
  }

  // Validação final antes de criar a sessão
  console.log(`🔍 Validação final do customer ${stripeCustomerId} antes de criar billing portal...`);
  const isFinalValid = await validateCustomerId(stripeCustomerId);
  
  if (!isFinalValid) {
    console.log("❌ Customer ID falhou na validação final");
    await clerkClient().users.updateUser(userId, {
      privateMetadata: {
        stripeCustomerId: null,
        stripeSubscriptionId: null,
      },
    });
    throw new Error("Erro ao validar sua assinatura. Por favor, tente novamente ou entre em contato com o suporte.");
  }

  console.log("✅ Criando billing portal session...");
  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${process.env.APP_URL}/subscription`,
  });

  console.log("✅ Billing portal criado com sucesso!");
  return { url: session.url };
};
