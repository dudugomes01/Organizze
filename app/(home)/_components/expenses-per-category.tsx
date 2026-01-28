import { Card, CardContent, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Progress } from "@/app/_components/ui/progress";
import { ScrollArea } from "@/app/_components/ui/scroll-area";
import { TRANSACTION_CATEGORY_LABELS } from "@/app/_constants/transactions";
import { TotalExpensePerCategory } from "@/app/_data/get-dashboard/types";

interface ExpensesPerCategoryProps {
  expensesPerCategory: TotalExpensePerCategory[];
}

const ExpensesPerCategory = ({
  expensesPerCategory,
}: ExpensesPerCategoryProps) => {
  return (
    <Card className="rounded-xl border bg-[#000f29] shadow-sm h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="font-bold text-white">Gastos por Categoria</CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <CardContent className="space-y-4 pt-0">
          {expensesPerCategory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Nenhum gasto registrado neste mês</p>
            </div>
          ) : (
            expensesPerCategory.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex w-full justify-between items-center">
                  <p className="text-sm font-semibold text-white">
                    {TRANSACTION_CATEGORY_LABELS[category.category]}
                  </p>
                  <p className="text-sm font-bold text-white">{category.percentageOfTotal}%</p>
                </div>
                <Progress 
                  value={category.percentageOfTotal} 
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(category.totalAmount)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default ExpensesPerCategory;