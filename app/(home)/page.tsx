import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Navbar from "../_components/navBar";
import SummaryCards from "./_components/summary-cards";
import TimeSelect from "./_components/time-select";
import { isMatch } from "date-fns";
import TransactionsPieChart from "./_components/transactions-pie-chart";
import { getDashboard } from "../_data/get-dashboard";
import ExpensesPerCategory from "./_components/expenses-per-category";
import LastTransactions from "./_components/last-transactions";
import { canUserAddTransaction } from "../_data/can-user-add-transaction";
import AiReportButton from "./_components/ai-report-button";
import MobileBottomNav from './_components/MobileBottomNav';
import ActiveSubscriptions from "./_components/active-subscriptions";
import { getRecurringSubscriptions } from "../my-subscriptions/_actions/manage-subscription";

interface HomeProps {
  searchParams: {
    month: string;
    year: string;
  };
}

const Home = async ({ searchParams }: HomeProps) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  // Se não há parâmetros ou são inválidos, usar o mês/ano atual
  const month = searchParams.month || currentMonth;
  const year = searchParams.year || currentYear;

  const monthIsInvalid = !month || !isMatch(month, "MM");
  const yearIsInvalid = !year || !isMatch(year, "yyyy");

  if (monthIsInvalid || yearIsInvalid) {
    redirect(`?month=${currentMonth}&year=${currentYear}`);
  }
  // Paralelizar todas as chamadas assíncronas
  const [dashboard, userCanAddTransaction, user, subscriptions] = await Promise.all([
    getDashboard(month, year),
    canUserAddTransaction(),
    clerkClient().users.getUser(userId),
    getRecurringSubscriptions(),
  ]);
  return (
    <>
      <Navbar />
      <div className="flex flex-col space-y-6 p-6">
        <div className="flex justify-between mx-auto sm:mx-0">
          <h1 className="hidden lg:flex text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <TimeSelect /> 
            <div className="hidden sm:block">
              <AiReportButton
                month={month}
                hasPremiumPlan={
                  user.publicMetadata.subscriptionPlan === "premium"
                }
              />
            </div>
            {/* <TimeSelect /> */}
          </div>
        </div>

        {/* Tornar a grid responsiva */}
        <div className="grid grid-cols-1 pb-[100px] sm:grid-cols-[2fr,1fr] gap-0 sm:gap-6">
          <div className="flex flex-col gap-6 mb-4 sm:mb-0">
            <SummaryCards
             month={month}
             year={year}
             {...dashboard}
              userCanAddTransaction={userCanAddTransaction}
            />
            {/* TransactionsPieChart e ExpensesPerCategory - lado a lado no desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <TransactionsPieChart {...dashboard} />
              </div>
              <div>
                <ExpensesPerCategory
                  expensesPerCategory={dashboard.totalExpensePerCategory}
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <LastTransactions lastTransactions={dashboard.lastTransactions} />
            <ActiveSubscriptions subscriptions={subscriptions} />
          </div>
        </div>
        
        {/* <SejaPremiumMobile className="px-4 pb-6 -mt-6 mb-[70px]" /> */}
      </div>
      <MobileBottomNav />
    </>
  );
};

export default Home;
