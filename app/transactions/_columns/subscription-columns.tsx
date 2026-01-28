"use client";

import { RecurringSubscription } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/app/_components/ui/badge";
import { CreditCard } from "lucide-react";
import {
  TRANSACTION_PAYMENT_METHOD_LABELS,
} from "@/app/_constants/transactions";

export const subscriptionColumns: ColumnDef<RecurringSubscription>[] = [
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-white/5 p-2">
          <CreditCard className="w-4 h-4 text-white" />
        </div>
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: "paymentMethod",
    header: "Método de Pagamento",
    cell: ({ row }) =>
      TRANSACTION_PAYMENT_METHOD_LABELS[row.original.paymentMethod],
  },
  {
    accessorKey: "amount",
    header: "Valor Mensal",
    cell: ({ row }) => (
      <span className="font-bold text-red-500">
        -{new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(row.original.amount))}
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: () => (
      <Badge className="bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/10 cursor-default">
        Ativa
      </Badge>
    ),
  },
];


