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
  const { month, year } = searchParams;
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

  const monthIsInvalid = !month || !isMatch(month, "MM");
  const yearIsInvalid = !year || !isMatch(year, "yyyy");

  if (monthIsInvalid || yearIsInvalid) {
    redirect(`?month=${currentMonth}&year=${currentYear}`);
  }
  const dashboard = await getDashboard(month, year);
  const userCanAddTransaction = await canUserAddTransaction();
  const user = await clerkClient().users.getUser(userId);
  return (
    <>
      <Navbar />
      <div className="flex flex-col space-y-6 p-6 overflow-auto">
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
        <div className="grid grid-cols-1 sm:grid-cols-[2fr,1fr] gap-0 sm:gap-6">
          <div className="flex flex-col gap-6 mb-4 sm:mb-0">
            <SummaryCards
             month={month}
             year={year}
             {...dashboard}
              userCanAddTransaction={userCanAddTransaction}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 sm:gap-6">
              <div className="mb-4 sm:mb-0">
                <TransactionsPieChart {...dashboard} />
              </div>
              <div className="mb-4 sm:mb-0">
                <ExpensesPerCategory
                  expensesPerCategory={dashboard.totalExpensePerCategory}
                />
              </div>
            </div>
          </div>
          <LastTransactions lastTransactions={dashboard.lastTransactions} />
        </div>
      </div>
    </>
  );
};

export default Home;
