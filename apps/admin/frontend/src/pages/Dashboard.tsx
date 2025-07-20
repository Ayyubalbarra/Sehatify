// apps/admin/frontend/src/pages/Dashboard.tsx

"use client"

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Zap, Heart, Building, Loader2, Clock } from 'lucide-react';
import Card from '../components/Card';
import MetricCard from '../components/Dashboard/MetricCard';
import HealthTrendChart from '../components/charts/HealthTrendChart';
import HealthMetricsChart from '../components/charts/HealthMetricsChart';
import AIInsightCard from '../components/Dashboard/AIInsightCard';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api';
import type {
  ApiResponse,
  User,
  DashboardOverviewApiData,
  ChartDataForRecharts,
} from '../types';

// Interface untuk Today's Queue List
interface QueueListItem {
    _id: string;
    queueNumber: number;
    patientName: string;
    polyclinicName: string;
    doctorName: string;
    appointmentTime: string;
    status: 'Waiting' | 'In Progress' | 'Completed' | 'Cancelled' | 'No Show';
    patientPhone: string;
}

interface TodayQueueData {
    totalQueues: number;
    summary: {
        waiting: number;
        inProgress: number;
        completed: number;
    };
    queues: QueueListItem[];
}


const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: isLoadingAuth, refreshUser } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated && user && !(user as User).name) {
      refreshUser();
    }
  }, [isAuthenticated, user, refreshUser]);

  const { data: adminOverviewResponse, isLoading: isLoadingAdminOverview } = useQuery<ApiResponse<DashboardOverviewApiData>>({
    queryKey: ['adminDashboardOverview'],
    queryFn: () => dashboardAPI.getAdminDashboardOverview(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const adminOverviewData = adminOverviewResponse?.data;

  const { data: patientsPerWeekResponse, isLoading: isLoadingPatientsPerWeek } = useQuery<ApiResponse<ChartDataForRecharts[]>>({
    queryKey: ['patientsPerWeek'],
    queryFn: () => dashboardAPI.getPatientsPerWeek(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const patientsPerWeekData = patientsPerWeekResponse?.data || [];

  const { data: patientsPerHourResponse, isLoading: isLoadingPatientsPerHour } = useQuery<ApiResponse<ChartDataForRecharts[]>>({
    queryKey: ['patientsPerHour'],
    queryFn: () => dashboardAPI.getPatientsPerHour(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const patientsPerHourData = patientsPerHourResponse?.data || [];

  const { data: aiInsightsResponse, isLoading: isLoadingAIInsights } = useQuery<ApiResponse<{ summary: string; recommendations: { id: string; text: string; priority: "high" | "medium" | "low" }[] }>>({
    queryKey: ['aiInsights'],
    queryFn: () => dashboardAPI.getAIInsights(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const aiInsightSummary = aiInsightsResponse?.data?.summary;
  const aiRecommendations = aiInsightsResponse?.data?.recommendations || [];

  const { data: todayQueuesResponse, isLoading: isLoadingTodayQueues } = useQuery<ApiResponse<TodayQueueData>>({
    queryKey: ['todayQueues'],
    queryFn: () => dashboardAPI.getTodayQueueList(),
    staleTime: 60 * 1000,
    refetchInterval: 30 * 1000,
  });
  const todayQueuesData = todayQueuesResponse?.data;

  const overallLoading = isLoadingAuth || isLoadingAdminOverview || isLoadingPatientsPerWeek || isLoadingPatientsPerHour || isLoadingAIInsights || isLoadingTodayQueues;

  if (isLoadingAuth) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-4 text-slate-500">Memuat informasi autentikasi...</p>
      </div>
    );
  }

  if (!isAuthenticated && !isLoadingAuth) {
    return (
      <div className="min-h-screen bg-background py-8 flex items-center justify-center text-center">
        <p className="text-xl text-text-light">Silakan <Link to="/login" className="text-primary hover:underline">login</Link> untuk melihat dashboard Anda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard Overview</h1>
        <p className="text-slate-500">Selayang pandang manajemen rumah sakit Anda.</p>
      </div>

      {overallLoading && !adminOverviewData ? (
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="ml-2 text-slate-500">Memuat metrik...</p>
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard title="Total Pasien" value={adminOverviewData?.totalPatients?.toLocaleString('id-ID') || '0'} icon={Users} color="blue" trend="up" trendValue="+12%" />
          <MetricCard title="Penerimaan Gawat Darurat" value={adminOverviewData?.erAdmissions?.toLocaleString('id-ID') || '0'} icon={Zap} color="purple" trend="up" trendValue="+17%" />
          <MetricCard title="O- Satuan Darah" value={adminOverviewData?.bloodUnitsOminus?.toLocaleString('id-ID') || '0'} icon={Heart} color="red" description="Stok Rendah" />
          <MetricCard title="Tempat Tidur Tersedia" value={adminOverviewData?.availableBeds?.toLocaleString('id-ID') || '0'} icon={Building} color="green" description="Tersedia" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {overallLoading && patientsPerWeekData.length === 0 ? (
              <div className="flex justify-center items-center h-64 bg-white rounded-lg border border-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="ml-2 text-slate-500">Memuat grafik pasien per minggu...</p>
              </div>
          ) : (
            <HealthTrendChart title="Pasien Minggu Ini" data={patientsPerWeekData} dataKey="value" strokeColor="#3B82F6" />
          )}
        </div>

        <AIInsightCard
          summary={aiInsightSummary || "AI Insight sedang dimuat atau tidak tersedia."}
          recommendations={aiRecommendations}
          isLoading={isLoadingAIInsights}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PERUBAHAN: Dibuat menjadi full-width */}
        <div className="lg:col-span-3">
          {overallLoading && patientsPerHourData.length === 0 ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-lg border border-gray-100">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="ml-2 text-slate-500">Memuat grafik pasien per jam...</p>
            </div>
          ) : (
            <HealthMetricsChart title="Pasien per Jam" type="bar" data={patientsPerHourData} />
          )}
        </div>
        {/* PERUBAHAN: SystemInfoCard dihapus dari sini */}
      </div>
      
      {/* PERUBAHAN: Dibuat menjadi full-width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Antrian Hari Ini</h2>
            {isLoadingTodayQueues ? (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="ml-2 text-slate-500">Memuat data antrian...</p>
                </div>
            ) : todayQueuesData && todayQueuesData.queues.length > 0 ? (
                <>
                    <div className="grid grid-cols-3 text-sm font-semibold text-slate-600 mb-2 border-b pb-2">
                        <div className="col-span-1">No. Antrian</div>
                        <div className="col-span-1">Pasien & Poli</div>
                        <div className="col-span-1">Dokter & Waktu</div>
                    </div>
                    <ul className="space-y-3 max-h-80 overflow-y-auto">
                        {todayQueuesData.queues.map(queue => (
                            <li key={queue._id} className="grid grid-cols-3 items-start text-sm">
                                <div className="col-span-1 font-bold text-blue-600 flex items-center gap-2">
                                    <Clock size={16} />{queue.queueNumber}
                                </div>
                                <div className="col-span-1">
                                    <p className="font-medium text-slate-800">{queue.patientName}</p>
                                    <p className="text-xs text-slate-500">{queue.polyclinicName}</p>
                                    <p className="text-xs text-slate-500">{queue.patientPhone}</p>
                                </div>
                                <div className="col-span-1">
                                    <p className="font-medium text-slate-800">{queue.doctorName}</p>
                                    <p className="text-xs text-slate-500">{queue.appointmentTime}</p>
                                    <span className={`text-xs font-semibold rounded-full px-2 py-0.5 mt-1 inline-block
                                        ${queue.status === 'Waiting' ? 'bg-orange-100 text-orange-700' :
                                          queue.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                          queue.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {queue.status}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-4 text-sm text-slate-600">
                        Total antrian: {todayQueuesData.totalQueues} | Menunggu: {todayQueuesData.summary.waiting} | Dalam Proses: {todayQueuesData.summary.inProgress} | Selesai: {todayQueuesData.summary.completed}
                    </div>
                </>
            ) : (
                <div className="text-center py-8 text-slate-500">Tidak ada antrian hari ini.</div>
            )}
          </Card>
        </div>
        {/* PERUBAHAN: QuickActionsCard dihapus dari sini */}
      </div>
      {/* PERUBAHAN: Tombol Seed Database di bagian bawah juga dihapus */}
    </div>
  )
}

export default Dashboard;