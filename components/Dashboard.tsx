import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  collegeApi,
  examApi,
  blogApi,
  enquiryApi,
  eventApi,
} from "../services/apiService";
import { dashboardApi } from "../services/apiService";

import {
  Building,
  BookOpen,
  PenSquare,
  FileText,
  MessageSquare,
  Loader2,
} from "lucide-react";
import type { Enquiry } from "../types";

/* ---------------- STAT CARD ---------------- */

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.FC<any>;
  color: string;
  loading: boolean;
}> = ({ title, value, icon: Icon, color, loading }) => (
  <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      {loading ? (
        <Loader2 className="h-8 w-8 animate-spin text-gray-400 mt-1" />
      ) : (
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      )}
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
  </div>
);

/* ---------------- STATIC DATA ---------------- */

const courseDistributionData = [
  { name: "Undergraduate", value: 400 },
  { name: "Postgraduate", value: 300 },
  { name: "Diploma", value: 200 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

/* ---------------- DASHBOARD ---------------- */

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    colleges: 0,
    courses: 0,
    exams: 0,
    blogs: 0,
    enquiries: 0,
  });

  const [loading, setLoading] = useState(true);
  const [recentEnquiries, setRecentEnquiries] = useState<Enquiry[]>([]);
  const [monthlyEnquiries, setMonthlyEnquiries] = useState<any[]>([]);

  /* -------- Monthly enquiry helper -------- */

  const generateMonthlyEnquiries = (enquiries: any[]) => {
    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec",
    ];

    const monthCount: Record<string, number> = {};
    months.forEach((m) => (monthCount[m] = 0));

    enquiries.forEach((enq: any) => {
      if (!enq?.date) return;
      const date = new Date(enq.date);
      const monthName = months[date.getMonth()];
      monthCount[monthName] += 1;
    });

    return months.map((m) => ({
      name: m,
      enquiries: monthCount[m],
    }));
  };

 const fetchStats = async () => {
  try {
    setLoading(true);

    const res = await dashboardApi.getStats();

    setStats(res.stats);
    setMonthlyEnquiries(res.monthlyEnquiries);

  } catch (err) {
    console.error("Dashboard stats error:", err);
  } finally {
    setLoading(false);
  }
};


  /* -------- IMPORTANT: ACTUAL CALL -------- */

  useEffect(() => {
    fetchStats();
  }, []);

  /* ---------------- UI ---------------- */

  const statCardsData = [
    { title: "Total Colleges", value: stats.colleges, icon: Building, color: "bg-blue-500" },
    { title: "Total Courses", value: stats.courses, icon: BookOpen, color: "bg-green-500" },
    { title: "Total Exams", value: stats.exams, icon: PenSquare, color: "bg-yellow-500" },
    { title: "Total Blogs", value: stats.blogs, icon: FileText, color: "bg-purple-500" },
    { title: "New Enquiries", value: stats.enquiries, icon: MessageSquare, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {statCardsData.map((card) => (
          <StatCard key={card.title} {...card} loading={loading} />
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Monthly Enquiries
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyEnquiries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="enquiries" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            Course Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseDistributionData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {courseDistributionData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECENT ENQUIRIES */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Recent Enquiries
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentEnquiries.map((enquiry) => (
                <tr key={enquiry.id} className="border-b">
                  <td className="px-6 py-4 font-medium">{enquiry.name}</td>
                  <td className="px-6 py-4">{enquiry.email}</td>
                  <td className="px-6 py-4">{enquiry.date}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        enquiry.status === "Resolved"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {enquiry.status}
                    </span>
                  </td>
                </tr>
              ))}
              {recentEnquiries.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    No enquiries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
