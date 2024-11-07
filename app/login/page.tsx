import Image from "next/image";
import { Button } from "../_components/ui/button";
import { LogInIcon } from "lucide-react";

const loginPage = () => {
  return (
    <div className="grid grid-cols-2 h-full">
      {/* Esquerda */}
      <div className="flex h-full flex-col justify-center mx-auto max-w-[550px] p-8">
        <Image src={"/logo.png"} width={173} height={39} className="mb-8" alt="Logo" />
        <h1 className="text-4x1 font-bold mb-8">Bem vindo</h1>
        <p className="text-muted-foreground mb-8">
          A Finance AI é uma plataforma de gestão financeira que utiliza IA para
          monitorar suas movimentações, e oferecer insights personalizados,
          facilitando o controle do seu orçamento.
        </p>
        <Button variant="outline">
          <LogInIcon className="mr-2"/>
          Fazer Login ou criar conta
        </Button>
      </div>

      {/* Direira */}
      <div className="relative h-full w-full">
        <Image
          src="/login.png"
          alt={"Faça Login"}
          fill
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default loginPage;
