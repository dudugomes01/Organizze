import { getDashboard } from "@/app/_data/get-dashboard";
import { PiggyBankIcon } from "lucide-react";
import MobileBottomNav from '../(home)/_components/MobileBottomNav';


export default async function SettingsPage() {
  // Exemplo: Pegando mês e ano atual
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear());

  const dashboard = await getDashboard(month, year);

  return (
    <main className="max-w-xl mx-auto py-10 px-4 bg-[#0b0014] w-full h-screen">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <PiggyBankIcon className="text-[#9600ff]" /> Investimento Atual
      </h1>
      <div className="bg-white rounded-xl shadow p-6 flex flex-col gap-4">
        <div>
          <span className="text-gray-500">Total investido até agora:</span>
          <div className="text-3xl font-bold text-[#9600ff]">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(dashboard.accumulatedInvestments)}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Investido neste mês:</span>
          <div className="text-xl font-semibold">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(dashboard.investmentsTotal)}
          </div>
        </div>
      </div>
      <MobileBottomNav/>
    </main>
  );
}