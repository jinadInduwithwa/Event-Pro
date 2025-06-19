import { useState, useEffect } from "react";
import customFetch from "../../../utils/customFetch";
import {
  FiUsers,
  FiPackage,
  FiCamera,
  FiHome,
  FiCoffee,
  FiMusic,
  FiUserCheck,
  FiAperture,
  FiSunset,
  FiDollarSign,
} from "react-icons/fi";
import { BounceLoader } from "react-spinners";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

interface Stats {
  users: number;
  packages: number;
  menuItems: number;
  photographers: number;
  venues: number;
  musicalGroup: number;
  staff: number;
  decorations: number;
  orders: number;
  totalIncome: number;
}

interface MonthlyIncome {
  month: string;
  income: number;
}

function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<MonthlyIncome[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await customFetch.get("/users/admin/stats");
        setStats(data.stats);

        // For demo purposes, if the API doesn't return monthly income data yet
        // We'll generate some sample data
        const demoMonthlyData = [
          { month: "Jan", income: 42500 },
          { month: "Feb", income: 38700 },
          { month: "Mar", income: 55400 },
          { month: "Apr", income: 47800 },
          { month: "May", income: 63200 },
          { month: "Jun", income: 75400 },
          { month: "Jul", income: 72100 },
          { month: "Aug", income: 84500 },
          { month: "Sep", income: 67900 },
          { month: "Oct", income: 73600 },
          { month: "Nov", income: 88200 },
          { month: "Dec", income: 95400 },
        ];

        // Replace this with actual API data when available
        setMonthlyIncome(data.monthlyIncome || demoMonthlyData);
      } catch (error) {
        console.error("Failed to fetch stats:", error);

        // Fallback demo data if API fails
        const demoMonthlyData = [
          { month: "Jan", income: 42500 },
          { month: "Feb", income: 38700 },
          { month: "Mar", income: 55400 },
          { month: "Apr", income: 47800 },
          { month: "May", income: 63200 },
          { month: "Jun", income: 75400 },
          { month: "Jul", income: 72100 },
          { month: "Aug", income: 84500 },
          { month: "Sep", income: 67900 },
          { month: "Oct", income: 73600 },
          { month: "Nov", income: 88200 },
          { month: "Dec", income: 95400 },
        ];
        setMonthlyIncome(demoMonthlyData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Users", value: stats?.users, icon: FiUsers },
    { title: "Total Packages", value: stats?.packages, icon: FiPackage },
    { title: "Menu Items", value: stats?.menuItems, icon: FiCoffee },
    { title: "Photographers", value: stats?.photographers, icon: FiCamera },
    { title: "Venues", value: stats?.venues, icon: FiHome },
    { title: "Music Group", value: stats?.musicalGroup, icon: FiMusic },
    { title: "Staff Members", value: stats?.staff, icon: FiUserCheck },
    { title: "Decoration Types", value: stats?.decorations, icon: FiAperture },
    { title: "Event Orders", value: stats?.orders, icon: FiSunset },
  ];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
      currencyDisplay: "narrowSymbol",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("LKR", "Rs");
  };

  // Calculate the total yearly income
  const yearlyTotal = monthlyIncome.reduce(
    (total, month) => total + month.income,
    0
  );

  if (isLoading)
    return (
      <div>
        {" "}
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-20 backdrop-blur-md">
          <BounceLoader size={50} color="#EE1133" />
        </div>
      </div>
    );

  return (
    <div className="p-6">
      {/* Income Overview Card */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Income Overview
          </h2>
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-semibold flex items-center">
            <FiDollarSign className="mr-1" />
            <span>Total: {formatCurrency(yearlyTotal)}</span>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyIncome}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `Rs${value / 1000}k`} />
              <Tooltip
                formatter={(value) => [
                  `${formatCurrency(value as number)}`,
                  "Income",
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                stroke="#EE1133"
                fill="#EE1133"
                fillOpacity={0.2}
                activeDot={{ r: 8 }}
                name="Monthly Income"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Income Card */}
        <div
          className="bg-gradient-to-r from-event-red to-red-700 p-6 rounded-lg shadow-sm border border-gray-100 
                   hover:shadow-md transition-all duration-300
                   transform hover:-translate-y-1 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white text-sm font-medium">Total Income</p>
              <p className="text-3xl font-bold mt-2">
                {formatCurrency(yearlyTotal)}
              </p>
              <p className="text-white text-sm mt-2 opacity-80">Year to date</p>
            </div>
            <FiDollarSign className="w-10 h-10 text-white opacity-80" />
          </div>
        </div>

        {/* Regular Stat Cards */}
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 
                     hover:shadow-md transition-all duration-300 hover:border-event-navy
                     transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-event-navy mt-2">
                  {stat.value || 0}
                </p>
              </div>
              <stat.icon className="w-8 h-8 text-event-navy opacity-80" />
            </div>
          </div>
        ))}
      </div>

      {/* Monthly Breakdown */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Monthly Income Breakdown
        </h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyIncome}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `Rs${value / 1000}k`} />
              <Tooltip
                formatter={(value) => [
                  `${formatCurrency(value as number)}`,
                  "Income",
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Bar
                dataKey="income"
                fill="#EE1133"
                name="Monthly Income"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Overview;
