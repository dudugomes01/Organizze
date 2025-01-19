// "use client";

// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/app/_components/ui/select";
// import { useRouter, useSearchParams } from "next/navigation";

// const MONTH_OPTIONS = [
//   { value: "01", label: "January" },
//   { value: "02", label: "February" },
//   { value: "03", label: "March" },
//   { value: "04", label: "April" },
//   { value: "05", label: "May" },
//   { value: "06", label: "June" },
//   { value: "07", label: "July" },
//   { value: "08", label: "August" },
//   { value: "09", label: "September" },
//   { value: "10", label: "October" },
//   { value: "11", label: "November" },
//   { value: "12", label: "December" },
// ];

// const YEAR_OPTIONS = [
//   { value: "2024", label: "2024" },
//   { value: "2025", label: "2025" },
// ];

// const TimeSelect = () => {
//   const { push } = useRouter();
//   const searchParams = useSearchParams();
//   const month = searchParams.get("month") ?? "";
//   const year = searchParams.get("year") ?? new Date().getFullYear().toString();

//   const handleTimeChange = (newMonth: string = month, newYear: string = year) => {
//     push(`/?month=${newMonth}&year=${newYear}`);
//   };

//   return (
//     <div className="flex flex-col sm:flex-row gap-4 sm:gap-2">
//       <Select
//         onValueChange={(value) => handleTimeChange(value, year)}
//         defaultValue={month}
//       >
//         <SelectTrigger className="w-full sm:w-[150px] rounded-full">
//           <SelectValue placeholder="Mês" />
//         </SelectTrigger>
//         <SelectContent>
//           {MONTH_OPTIONS.map((option) => (
//             <SelectItem key={option.value} value={option.value}>
//               {option.label}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>

//       <Select
//         onValueChange={(value) => handleTimeChange(month, value)}
//         defaultValue={year}
//       >
//         <SelectTrigger className="w-full sm:w-[100px] rounded-full">
//           <SelectValue placeholder="Ano" />
//         </SelectTrigger>
//         <SelectContent>
//           {YEAR_OPTIONS.map((option) => (
//             <SelectItem key={option.value} value={option.value}>
//               {option.label}
//             </SelectItem>
//           ))}
//         </SelectContent>
//       </Select>
//     </div>
//   );
// };

// export default TimeSelect;


// "use client";

// import { Button } from "@/app/_components/ui/button";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useState, useEffect, useRef } from "react";
// import Navbar from "../../_components/navBarMobile";
// import NavBarUserId from "../../_components/navBarUserId";

// const MONTHS = [
//   {
//     label: "Outubro 2024",
//     value: { month: "110", year: "2024" },
//   },
//   {
//     label: "Novembro 2024",
//     value: { month: "11", year: "2024" },
//   },
//   {
//     label: "Dezembro 2024",
//     value: { month: "12", year: "2024" },
//   },
//   {
//     label: "Janeiro",
//     value: { month: "01", year: "2025" },
//   },
//   {
//     label: "Fevereiro",
//     value: { month: "02", year: "2025" },
//   },
// ];

// const TimeSelect = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const { push } = useRouter();
//   const searchParams = useSearchParams();
//   const month = searchParams.get("month") ?? "01";
//   const year = searchParams.get("year") ?? "2025";

//   const modalRef = useRef<HTMLDivElement | null>(null);

//   // Fechar o modal ao clicar fora
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         modalRef.current &&
//         !modalRef.current.contains(event.target as Node)
//       ) {
//         setIsOpen(false);
//       }
//     };

//     if (isOpen) {
//       document.body.style.overflow = "hidden"; // Desabilita o scroll lateral
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.body.style.overflow = "auto"; // Habilita o scroll lateral novamente
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.body.style.overflow = "auto"; // Certifica-se de que o scroll lateral seja liberado ao desmontar
//     };
//   }, [isOpen]);

//   const handleMonthSelect = (selectedMonth: string, selectedYear: string) => {
//     push(`/?month=${selectedMonth}&year=${selectedYear}`);
//     setIsOpen(false);
//   };

//   const getCurrentMonthLabel = () => {
//     const currentMonth = MONTHS.find(
//       (m) => m.value.month === month && m.value.year === year
//     );
//     return currentMonth?.label ?? "Janeiro";
//   };

//   return (
//     <div className="inline-block relative">
//       <div className="flex justify-between items-center w-full">
//         <NavBarUserId/>
//         <Button
//           variant="ghost"
//           onClick={() => setIsOpen(!isOpen)}
//           className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 py-2 h-auto font-normal mx-auto"
//         >
//           {getCurrentMonthLabel()}
//         </Button>

//         <Navbar />
//       </div>
//       {isOpen && (
//         <div
//           ref={modalRef}
//           className="absolute left-1/2 -translate-x-1/2 top-full mt-2 mb-8 z-50 sm:w-[100%] bg-white rounded-lg shadow-lg"
//         >
//           {/* Container para o scroll */}
//           <div className="w-full overflow-x-auto max-w-full scrollbar-hide">
//             <div className="flex gap-2 p-2 w-[150%]">
//               {MONTHS.map((monthOption) => (
//                 <Button
//                   key={`${monthOption.value.month}-${monthOption.value.year}`}
//                   variant="ghost"
//                   className={`px-6 py-2 rounded-full whitespace-nowrap min-w-[150px] ${
//                     month === monthOption.value.month &&
//                     year === monthOption.value.year
//                       ? "bg-violet-600 text-white hover:bg-violet-700"
//                       : "bg-red-700 hover:bg-violet-200"
//                   }`}
//                   onClick={() =>
//                     handleMonthSelect(
//                       monthOption.value.month,
//                       monthOption.value.year
//                     )
//                   }
//                 >
//                   {monthOption.label}
//                 </Button>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TimeSelect;


"use client";

import { Button } from "@/app/_components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Navbar from "../../_components/navBarMobile";
import NavBarUserId from "../../_components/navBarUserId";

const MONTHS = [
  { label: "Outubro 2024", value: { month: "110", year: "2024" } },
  { label: "Novembro 2024", value: { month: "11", year: "2024" } },
  { label: "Dezembro 2024", value: { month: "12", year: "2024" } },
  { label: "Janeiro", value: { month: "01", year: "2025" } },
  { label: "Fevereiro", value: { month: "02", year: "2025" } },
  { label: "Março", value: { month: "03", year: "2025" } },
  { label: "Abril", value: { month: "04", year: "2025" } },
  { label: "Maio", value: { month: "05", year: "2025" } },
];

const TimeSelect = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { push } = useRouter();
  const searchParams = useSearchParams();
  const month = searchParams.get("month") ?? "01";
  const year = searchParams.get("year") ?? "2025";

  const modalRef = useRef<HTMLDivElement | null>(null);

  // Fechar o modal ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden"; // Desabilita o scroll lateral
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.body.style.overflow = "auto"; // Habilita o scroll lateral novamente
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto"; // Certifica-se de que o scroll lateral seja liberado ao desmontar
    };
  }, [isOpen]);

  const handleMonthSelect = (selectedMonth: string, selectedYear: string) => {
    push(`/?month=${selectedMonth}&year=${selectedYear}`);
    setIsOpen(false);
  };

  const getCurrentMonthLabel = () => {
    const currentMonth = MONTHS.find(
      (m) => m.value.month === month && m.value.year === year
    );
    return currentMonth?.label ?? "Janeiro";
  };

  return (
    <div className="inline-block relative">
      <div className="flex justify-between items-center w-full">
        <NavBarUserId />
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-full px-6 py-2 h-auto font-normal mx-auto"
        >
          {getCurrentMonthLabel()}
        </Button>
        <Navbar />
      </div>

      {/* Tela escurecida ao abrir o modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40">
          <div
            ref={modalRef}
            className="absolute left-1/2 -translate-x-1/2 top-[20%] sm:top-1/4 z-50 sm:w-[100%] bg-white rounded-lg shadow-lg"
          >
            {/* Container para o scroll */}
            <div
              className="w-full overflow-x-auto max-w-full scrollbar-hide touch-pan-x"
              style={{ WebkitOverflowScrolling: "touch", scrollSnapType: "x mandatory" }}
            >
              <div className="flex gap-2 p-2">
                {MONTHS.map((monthOption) => (
                  <Button
                    key={`${monthOption.value.month}-${monthOption.value.year}`}
                    variant="ghost"
                    className={`px-6 py-2 rounded-full whitespace-nowrap min-w-[150px] sm:min-w-[180px] ${
                      month === monthOption.value.month &&
                      year === monthOption.value.year
                        ? "bg-violet-600 text-white hover:bg-violet-700"
                        : "bg-red-700 hover:bg-violet-200"
                    }`}
                    onClick={() =>
                      handleMonthSelect(
                        monthOption.value.month,
                        monthOption.value.year
                      )
                    }
                  >
                    {monthOption.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSelect;

