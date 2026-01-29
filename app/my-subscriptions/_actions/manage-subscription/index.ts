"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { db } from "@/app/_lib/prisma";
import { createSubscriptionSchema, updateSubscriptionSchema, CreateSubscriptionInput, UpdateSubscriptionInput } from "./schema";
import { revalidatePath } from "next/cache";

export async function createRecurringSubscription(data: CreateSubscriptionInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  const validatedData = createSubscriptionSchema.parse(data);

  try {
    // Verificar se o usuário tem permissão para criar mais assinaturas
    const user = await clerkClient().users.getUser(userId);
    const isPremium = user.publicMetadata.subscriptionPlan === "premium";
    
    if (!isPremium) {
      const subscriptionsCount = await db.recurringSubscription.count({
        where: { userId },
      });
      
      if (subscriptionsCount >= 3) {
        throw new Error("Você atingiu o limite de 3 assinaturas. Atualize seu plano para criar ilimitadas.");
      }
    }

    const subscription = await db.recurringSubscription.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        paymentMethod: validatedData.paymentMethod,
        category: "OTHER", // Categoria padrão para assinaturas
        startDate: validatedData.startDate,
        userId,
      },
    });

    revalidatePath("/my-subscriptions");
    return subscription;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      throw new Error("Já existe uma assinatura com este nome");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro ao criar assinatura");
  }
}

export async function updateRecurringSubscription(data: UpdateSubscriptionInput) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  const validatedData = updateSubscriptionSchema.parse(data);
  const { id, ...updateData } = validatedData;

  try {
    const subscription = await db.recurringSubscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      throw new Error("Assinatura não encontrada");
    }

    const updatedSubscription = await db.recurringSubscription.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/my-subscriptions");
    return updatedSubscription;
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === "P2002") {
      throw new Error("Já existe uma assinatura com este nome");
    }
    throw new Error("Erro ao atualizar assinatura");
  }
}

export async function deleteRecurringSubscription(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  try {
    const subscription = await db.recurringSubscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      throw new Error("Assinatura não encontrada");
    }

    await db.recurringSubscription.delete({
      where: { id },
    });

    revalidatePath("/my-subscriptions");
    return { success: true };
  } catch {
    throw new Error("Erro ao excluir assinatura");
  }
}

export async function getRecurringSubscriptions() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  try {
    const subscriptions = await db.recurringSubscription.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return subscriptions;
  } catch (error) {
    console.error("Erro ao buscar assinaturas:", error);
    return [];
  }
}

export async function toggleSubscriptionStatus(id: string) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Usuário não autenticado");
  }

  try {
    const subscription = await db.recurringSubscription.findFirst({
      where: { id, userId },
    });

    if (!subscription) {
      throw new Error("Assinatura não encontrada");
    }

    const updatedSubscription = await db.recurringSubscription.update({
      where: { id },
      data: { isActive: !subscription.isActive },
    });

    revalidatePath("/my-subscriptions");
    return updatedSubscription;
  } catch {
    throw new Error("Erro ao alterar status da assinatura");
  }
}