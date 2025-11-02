import { z } from "zod";
import { TransactionPaymentMethod } from "@prisma/client";

export const createSubscriptionSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(50, "Nome muito longo"),
  amount: z.number().positive("Valor deve ser positivo"),
  paymentMethod: z.nativeEnum(TransactionPaymentMethod),
  startDate: z.date().default(() => new Date()),
});

export const updateSubscriptionSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Nome é obrigatório").max(50, "Nome muito longo").optional(),
  amount: z.number().positive("Valor deve ser positivo").optional(),
  paymentMethod: z.nativeEnum(TransactionPaymentMethod).optional(),
  isActive: z.boolean().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscriptionInput = z.infer<typeof updateSubscriptionSchema>;