import { z } from "zod";

export const createInvestmentCategorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(50, "Nome muito longo"),
  type: z.enum(["FIXED_INCOME", "REAL_ESTATE", "STOCKS", "CUSTOM", "EMERGENCY_FUND", "CRYPTO"]),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Cor inválida").default("#9600ff"),
});

export const updateInvestmentCategorySchema = createInvestmentCategorySchema.extend({
  id: z.string().uuid(),
});

export const updateAllocationSchema = z.object({
  categoryId: z.string().uuid(),
  amount: z.number().min(0, "Valor deve ser positivo"),
  targetPercentage: z.number().min(0).max(100).optional(),
});

export type CreateInvestmentCategoryInput = z.infer<typeof createInvestmentCategorySchema>;
export type UpdateInvestmentCategoryInput = z.infer<typeof updateInvestmentCategorySchema>;
export type UpdateAllocationInput = z.infer<typeof updateAllocationSchema>;