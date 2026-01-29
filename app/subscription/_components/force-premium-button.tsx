"use client";

import { Button } from "@/app/_components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export default function ForcePremiumButton() {
  const [loading, setLoading] = useState(false);

  const handleForceUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/force-premium", {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Plano atualizado! Recarregue a página.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error(data.error || "Erro ao atualizar plano");
      }
    } catch {
      toast.error("Erro ao atualizar plano");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleForceUpdate}
      disabled={loading}
      variant="outline"
      className="border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white"
    >
      {loading ? "Atualizando..." : "🔧 Forçar Atualização Premium (Teste)"}
    </Button>
  );
}
