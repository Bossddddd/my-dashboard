import { cookies } from "next/headers";
import { getDashboardStats } from "./actions";
import ClientPage from "./ClientPage";

export const dynamic = "force-dynamic";

export default async function Page() {
  const cookieStore = await cookies();
  const dateRange = cookieStore.get("dateRange")?.value || "30d";
  const customStart = cookieStore.get("customDateStart")?.value || "";
  const customEnd = cookieStore.get("customDateEnd")?.value || "";

  const initialStats = await getDashboardStats({
    dateRange,
    customStart,
    customEnd,
  });
  return (
    <ClientPage
      initialStats={initialStats}
      initialDateRange={dateRange}
      initialCustomStart={customStart}
      initialCustomEnd={customEnd}
    />
  );
}
