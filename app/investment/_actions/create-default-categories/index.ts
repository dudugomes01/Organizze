"use server";

import { db } from "@/app/_lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";

const DEFAULT_CATEGORIES = [
  {
    name: "CDI/Selic",
    type: "FIXED_INCOME" as const,
    description: "Investimentos em renda fixa atrelados ao CDI ou Selic",
    color: "#10b981",
  },
  {
    name: "Fundos Imobiliários",
    type: "REAL_ESTATE" as const,
    description: "FIIs - Fundos de Investimento Imobiliário",
    color: "#f59e0b",
  },
  {
    name: "Ações",
    type: "STOCKS" as const,
    description: "Investimentos em renda variável (ações)",
    color: "#3b82f6",
  },
  {
    name: "Reserva de Emergência",
    type: "EMERGENCY_FUND" as const,
    description: "Reserva para emergências (liquidez imediata)",
    color: "#ef4444",
  },
];

export async function createDefaultCategories() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Verificar se o usuário já tem categorias
    const existingCategories = await db.investmentCategory.findMany({
      where: { userId },
    });

    if (existingCategories.length > 0) {
      return { success: true, message: "Usuário já possui categorias" };
    }

    // Verificar se o usuário é premium (criar 4 categorias padrão requer ser premium)
    const user = await clerkClient().users.getUser(userId);
    const isPremium = user.publicMetadata.subscriptionPlan === "premium";
    
    if (!isPremium) {
      throw new Error("Apenas usuários premium podem criar categorias padrão. Atualize seu plano para ter acesso.");
    }

    // Criar categorias padrão
    await db.investmentCategory.createMany({
      data: DEFAULT_CATEGORIES.map(category => ({
        ...category,
        userId,
      })),
    });

    return { success: true, message: "Categorias padrão criadas com sucesso" };
  } catch (error) {
    console.error("Erro ao criar categorias padrão:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro ao criar categorias padrão");
  }
}