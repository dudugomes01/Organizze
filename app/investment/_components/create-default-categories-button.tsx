"use client";

import { Button } from "@/app/_components/ui/button";
import { SparklesIcon } from "lucide-react";
import { createDefaultCategories } from "../_actions/create-default-categories";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/_components/ui/tooltip";

interface CreateDefaultCategoriesButtonProps {
  userCanCreateCategory: boolean;
}

export default function CreateDefaultCategoriesButton({ userCanCreateCategory }: CreateDefaultCategoriesButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateDefaults = async () => {
    setLoading(true);
    try {
      const result = await createDefaultCategories();
      toast.success(result.message);
      // Recarregar a página para mostrar as novas categorias
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar categorias padrão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleCreateDefaults}
            disabled={loading || !userCanCreateCategory}
            variant="outline"
            className="border-[#9600ff] text-[#9600ff] hover:border-white hover:text-[#ffffff] hover:bg-[#9600ff] transition-colors"
          >
            <SparklesIcon className="w-4 h-4 mr-2" />
            {loading ? "Criando..." : "Criar Categorias Padrão"}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {!userCanCreateCategory &&
            "Você atingiu o limite de 3 categorias. Atualize seu plano para criar ilimitadas."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}