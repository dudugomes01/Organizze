"use client";

import { Button } from "@/app/_components/ui/button";
import { SparklesIcon } from "lucide-react";
import { createDefaultCategories } from "../_actions/create-default-categories";
import { toast } from "sonner";
import { useState } from "react";

export default function CreateDefaultCategoriesButton() {
  const [loading, setLoading] = useState(false);

  const handleCreateDefaults = async () => {
    setLoading(true);
    try {
      const result = await createDefaultCategories();
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao criar categorias padrão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleCreateDefaults}
      disabled={loading}
      variant="outline"
      className="border-[#9600ff] text-[#9600ff] hover:bg-[#9600ff] hover:text-white"
    >
      <SparklesIcon className="w-4 h-4 mr-2" />
      {loading ? "Criando..." : "Criar Categorias Padrão"}
    </Button>
  );
}