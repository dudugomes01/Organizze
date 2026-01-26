import { TransactionCategory } from "@prisma/client";

// Usando strings literais em vez do enum para compatibilidade com componentes do cliente
export type TransactionPercentagePerType = {
  DEPOSIT: number;
  EXPENSE: number;
  INVESTMENT: number;
};

export interface TotalExpensePerCategory {
  category: TransactionCategory;
  totalAmount: number;
  percentageOfTotal: number;
}