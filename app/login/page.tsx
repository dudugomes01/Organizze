import Image from "next/image";
import { Button } from "../_components/ui/button";
import { LogInIcon } from "lucide-react";
import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const loginPage = async () => {
  const { userId } = await auth();
  if (userId) {
    redirect("/");
  }
  return (
    <div className="h-full">
      {/* Para telas grandes */}
      <div className="hidden md:grid grid-cols-2 h-full">
        {/* Esquerda */}
        <div className="flex h-full flex-col justify-center mx-auto max-w-[550px] p-8">
          <Image
            src={"/logo.svg"}
            width={173}
            height={39}
            className="mb-8"
            alt="Logo"
          />
          <h1 className="text-4xl font-bold mb-8">Bem-vindo</h1>
          <p className="text-muted-foreground mb-8">
            A Organizze-AI é uma plataforma de gestão financeira que utiliza IA para
            monitorar suas movimentações, e oferecer insights personalizados,
            facilitando o controle do seu orçamento.
          </p>
          <SignInButton>
            <Button variant="outline">
              <LogInIcon className="mr-2" />
              Fazer Login ou criar conta
            </Button>
          </SignInButton>
        </div>

        {/* Direita */}
        <div className="relative h-full w-full">
          <Image
            src="/login.png"
            alt={"Faça Login"}
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Para telas pequenas */}
      <div
        className="md:hidden relative w-full flex items-center justify-center"
        style={{ height: "100vh" }}
      >
        {/* Imagem de fundo */}
        <Image
          src="/login.png"
          alt="Background"
          fill
          className="object-cover -z-10"
        />

        {/* Conteúdo */}
        <div className="bg-white/90 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-[90%] text-center">
          <Image
        src={"/logo.svg"}
        width={150}
        height={34}
        className="mb-4 mx-auto"
        alt="Logo"
          />
          <h1 className="text-2xl font-bold mb-4">Bem-vindo</h1>
          <p className="text-muted-foreground text-sm mb-6">
        A Organizze-AI é uma plataforma de gestão financeira que utiliza IA para
        monitorar suas movimentações e oferecer insights personalizados.
          </p>
          <SignInButton>
        <Button variant="outline" className="w-full">
          <LogInIcon className="mr-2" />
          Fazer Login ou criar conta
        </Button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
};

export default loginPage;
