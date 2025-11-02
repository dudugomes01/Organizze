"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateAllocationSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().min(0, "Valor deve ser positivo"),
  targetPercentage: z.number().min(0).max(100).optional(),
});

export async function updateInvestmentAllocation(
  params: z.infer<typeof updateAllocationSchema>
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedParams = updateAllocationSchema.parse(params);
  const { categoryId, amount, targetPercentage } = validatedParams;

  // Verificar se a categoria pertence ao usuário
  const category = await db.investmentCategory.findFirst({
    where: {
      id: categoryId,
      userId,
      isActive: true,
    },
  });

  if (!category) {
    throw new Error("Categoria não encontrada");
  }

  // Obter o total real de investimentos do usuário a partir das transações
  const totalRealInvestments = await getTotalRealInvestments(userId);
  
  if (totalRealInvestments === 0) {
    throw new Error("Você não possui investimentos para alocar. Adicione transações de investimento primeiro.");
  }

  // Obter o total já alocado (excluindo a categoria atual para permitir edição)
  const currentTotalAllocated = await getTotalAllocatedExcluding(userId, categoryId);
  
  // Verificar se a nova alocação não excede o total disponível
  const maxAllowedAmount = totalRealInvestments - currentTotalAllocated;
  
  if (amount > maxAllowedAmount) {
    throw new Error(
      `Valor excede o disponível para alocação. Máximo permitido: ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(maxAllowedAmount)} (Total investido: ${new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(totalRealInvestments)})`
    );
  }

  // Calcular o percentual baseado no total real de investimentos
  const percentage = totalRealInvestments > 0 ? (amount / totalRealInvestments) * 100 : 0;

  await db.investmentAllocation.upsert({
    where: {
      userId_investmentCategoryId: {
        userId,
        investmentCategoryId: categoryId,
      },
    },
    update: {
      amount,
      percentage,
      targetPercentage,
    },
    create: {
      userId,
      investmentCategoryId: categoryId,
      amount,
      percentage,
      targetPercentage,
    },
  });

  // Recalcular percentuais de todas as alocações
  await recalculateAllPercentages(userId);

  revalidatePath("/investment");
  return { success: true };
}

export async function getAllocationsWithCategories() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const allocations = await db.investmentAllocation.findMany({
    where: {
      userId,
    },
    include: {
      investmentCategory: true,
    },
    orderBy: {
      amount: "desc",
    },
  });

  const totalAmount = allocations.reduce((sum, allocation) => sum + Number(allocation.amount), 0);

  return {
    allocations: allocations.map(allocation => ({
      ...allocation,
      amount: Number(allocation.amount),
      percentage: Number(allocation.percentage),
      targetPercentage: allocation.targetPercentage ? Number(allocation.targetPercentage) : null,
    })),
    totalAmount,
  };
}

async function getTotalRealInvestments(userId: string): Promise<number> {
  // Buscar o total real de investimentos das transações do usuário
  const result = await db.transaction.aggregate({
    where: {
      userId,
      type: "INVESTMENT",
    },
    _sum: {
      amount: true,
    },
  });

  return Number(result._sum.amount) || 0;
}

async function getTotalAllocatedExcluding(userId: string, excludeCategoryId: string): Promise<number> {
  const result = await db.investmentAllocation.aggregate({
    where: {
      userId,
      investmentCategoryId: {
        not: excludeCategoryId,
      },
    },
    _sum: {
      amount: true,
    },
  });

  return Number(result._sum.amount) || 0;
}

async function recalculateAllPercentages(userId: string) {
  const totalRealInvestments = await getTotalRealInvestments(userId);
  
  if (totalRealInvestments === 0) return;

  const allocations = await db.investmentAllocation.findMany({
    where: { userId },
  });

  for (const allocation of allocations) {
    const percentage = (Number(allocation.amount) / totalRealInvestments) * 100;
    
    await db.investmentAllocation.update({
      where: {
        id: allocation.id,
      },
      data: {
        percentage,
      },
    });
  }
}

export async function deleteAllocation(categoryId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.investmentAllocation.delete({
    where: {
      userId_investmentCategoryId: {
        userId,
        investmentCategoryId: categoryId,
      },
    },
  });

  // Recalcular percentuais após exclusão
  await recalculateAllPercentages(userId);

  revalidatePath("/investment");
  return { success: true };
}

export async function getAllocationLimits(categoryId?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const totalRealInvestments = await getTotalRealInvestments(userId);
  const totalAllocated = categoryId 
    ? await getTotalAllocatedExcluding(userId, categoryId)
    : await getTotalAllocatedIncludingAll(userId);
  
  const availableToAllocate = totalRealInvestments - totalAllocated;

  return {
    totalRealInvestments,
    totalAllocated,
    availableToAllocate,
    allocationPercentage: totalRealInvestments > 0 ? (totalAllocated / totalRealInvestments) * 100 : 0,
  };
}

async function getTotalAllocatedIncludingAll(userId: string): Promise<number> {
  const result = await db.investmentAllocation.aggregate({
    where: {
      userId,
    },
    _sum: {
      amount: true,
    },
  });

  return Number(result._sum.amount) || 0;
}