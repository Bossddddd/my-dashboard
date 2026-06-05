import { getDashboardStats } from "./actions";
import ClientPage from "./ClientPage";

export const dynamic = 'force-dynamic'; // Ensure it fetches fresh data

export default async function Page() {
  const initialStats = await getDashboardStats({ dateRange: '30d' });
  return <ClientPage initialStats={initialStats} />;
}
