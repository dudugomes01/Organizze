"use server";

import { db } from "@/app/_lib/prisma";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createInvestmentCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(50, "Nome muito longo"),
  type: z.enum(["FIXED_INCOME", "REAL_ESTATE", "STOCKS", "CUSTOM", "EMERGENCY_FUND", "CRYPTO"]),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida").default("#9600ff"),
});

const updateInvestmentCategorySchema = createInvestmentCategorySchema.extend({
  id: z.string().uuid(),
});

export async function createInvestmentCategory(
  params: z.infer<typeof createInvestmentCategorySchema>
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedParams = createInvestmentCategorySchema.parse(params);

  try {
    // Verificar se o usuário tem permissão para criar mais categorias
    const user = await clerkClient().users.getUser(userId);
    const isPremium = user.publicMetadata.subscriptionPlan === "premium";
    
    if (!isPremium) {
      const categoriesCount = await db.investmentCategory.count({
        where: { userId },
      });
      
      if (categoriesCount >= 3) {
        throw new Error("Você atingiu o limite de 3 categorias. Atualize seu plano para criar ilimitadas.");
      }
    }

    await db.investmentCategory.create({
      data: {
        ...validatedParams,
        userId,
      },
    });

    revalidatePath("/investment");
    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      throw new Error("Já existe uma categoria com este nome");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro ao criar categoria");
  }
}

export async function updateInvestmentCategory(
  params: z.infer<typeof updateInvestmentCategorySchema>
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validatedParams = updateInvestmentCategorySchema.parse(params);
  const { id, ...updateData } = validatedParams;

  await db.investmentCategory.update({
    where: {
      id,
      userId,
    },
    data: updateData,
  });

  revalidatePath("/investment");
  return { success: true };
}

export async function deleteInvestmentCategory(categoryId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await db.investmentCategory.delete({
    where: {
      id: categoryId,
      userId,
    },
  });

  revalidatePath("/investment");
  return { success: true };
}

export async function getInvestmentCategories() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  return await db.investmentCategory.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      allocations: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}