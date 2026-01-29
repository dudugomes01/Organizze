import { clerkClient } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = async () => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🔄 Forçando atualização para premium do usuário:", userId);

    await clerkClient().users.updateUser(userId, {
      publicMetadata: {
        subscriptionPlan: "premium",
      },
    });

    console.log("✅ Usuário atualizado para premium com sucesso!");

    return NextResponse.json({ 
      success: true, 
      message: "Plano atualizado para premium",
      userId 
    });
  } catch (error) {
    console.error("❌ Erro ao atualizar usuário:", error);
    return NextResponse.json({ 
      error: "Erro ao atualizar plano",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
};
