import Header from "@/components/Header";
import OverviewCards from "@/components/OverviewCards";
import { WeeklyRevenueChart, ServiceDistributionChart } from "@/components/Charts";
import AppointmentsTable from "@/components/AppointmentsTable";
import DashboardCalendar from "@/components/DashboardCalendar";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-pink-50 via-white to-pink-100 overflow-y-auto">
      <Header />
      <div className="px-6 pb-6 flex-1 max-w-7xl mx-auto w-full">
        <div className="mb-6 mt-2">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Overview</h2>
          <p className="text-gray-500 mt-1 font-medium">Welcome Back, Ma'am Rose</p>
        </div>

        <OverviewCards />

        {/* Row 1: Weekly Revenue (Left) + Calendar (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 min-h-full">
            <WeeklyRevenueChart />
          </div>
          <div className="xl:col-span-1 min-h-full">
            <DashboardCalendar />
          </div>
        </div>

        {/* Row 2: Today's Appointments (Left) + Service Distribution (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 min-h-full overflow-hidden">
            <AppointmentsTable />
          </div>
          <div className="xl:col-span-1 min-h-full">
            <ServiceDistributionChart />
          </div>
        </div>
      </div>
    </div>
  );
}
