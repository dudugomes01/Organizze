"use client";

import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  selectedMonth: string;
};

export default function MonthSelector({ selectedMonth }: Props) {
  const now = new Date();
  const months = Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return {
      value: format(d, "yyyy-MM"),
      label: format(d, "MMMM yyyy"),
    };
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <form>
      <select
        name="month"
        defaultValue={selectedMonth}
        onChange={e => {
          const params = new URLSearchParams(searchParams.toString());
          params.set("month", e.target.value);
          router.replace(`?${params.toString()}`);
        }}
        className="border rounded px-2 py-1 bg-[#001a42]"
      >
        {months.map(m => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </form>
  );
}