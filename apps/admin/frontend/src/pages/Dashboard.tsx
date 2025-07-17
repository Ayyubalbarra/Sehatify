// apps/admin/frontend/src/pages/Dashboard.tsx

"use client"

import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Zap, Heart, Building, Loader2, AlertTriangle, Calendar, BarChart3 } from 'lucide-react';
import Card from '../components/Card'; 
import Button from '../components/Button'; 
import MetricCard from '../components/Dashboard/MetricCard'; 
import HealthTrendChart from '../components/charts/HealthTrendChart'; 
import HealthMetricsChart from '../components/charts/HealthMetricsChart'; 
import AIInsightCard from '../components/Dashboard/AIInsightCard'; 
import SystemInfoCard from '../components/Dashboard/SystemInfoCard'; 
import QuickActionsCard from '../components/Dashboard/QuickActionsCard'; 
import { useAuth } from '../contexts/AuthContext'; 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'; 
import toast from 'react-hot-toast'; 
import { dashboardAPI, inventoryAPI } from '../services/api';
import type { 
  ApiResponse, 
  User, 
  DashboardOverviewApiData, 
  ChartDataForRecharts, 
  FinancialSummaryData, 
  ServiceDistributionData 
} from '../types';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: isLoadingAuth, refreshUser } = useAuth();
  const queryClient = useQueryClient(); 

  React.useEffect(() => {
    // Gunakan 'User' langsung karena sudah diimpor
    if (isAuthenticated && user && !(user as User).name) {
      refreshUser(); 
    }
  }, [isAuthenticated, user, refreshUser]);

  // Sisa kode tidak perlu diubah...
  const dashboardCards = [
    {
      icon: Calendar,
      title: 'Data Pasien', 
      description: 'Kelola dan lihat data pasien', 
      link: '/data-pasien', 
      color: 'bg-blue-500'
    },
    {
      icon: BarChart3, 
      title: 'Laporan & Analisis',
      description: 'Akses laporan keuangan dan operasional',
      link: '/laporan-analisis',
      color: 'bg-green-500'
    },
    {
      icon: AlertTriangle, 
      title: 'Stok Medis',
      description: 'Pantau inventaris dan stok rendah',
      link: '/stok-medis',
      color: 'bg-purple-500'
    },
    {
      icon: Calendar, 
      title: 'Jadwal & SDM',
      description: 'Kelola jadwal dokter dan staf',
      link: '/jadwal-sdm',
      color: 'bg-red-500'
    }
  ];

  const { data: adminOverviewResponse, isLoading: isLoadingAdminOverview } = useQuery<ApiResponse<DashboardOverviewApiData>>({
    queryKey: ['adminDashboardOverview'],
    queryFn: () => dashboardAPI.getAdminDashboardOverview(), 
  });
  const adminOverviewData = adminOverviewResponse?.data;

  const { data: patientsPerWeekResponse, isLoading: isLoadingPatientsPerWeek } = useQuery<ApiResponse<ChartDataForRecharts[]>>({
    queryKey: ['patientsPerWeek'],
    queryFn: () => dashboardAPI.getPatientsPerWeek(), 
  });
  const patientsPerWeekData = patientsPerWeekResponse?.data || [];

  const { data: patientsPerHourResponse, isLoading: isLoadingPatientsPerHour } = useQuery<ApiResponse<ChartDataForRecharts[]>>({
    queryKey: ['patientsPerHour'],
    queryFn: () => dashboardAPI.getPatientsPerHour(), 
  });
  const patientsPerHourData = patientsPerHourResponse?.data || [];

  const { data: aiInsightsResponse, isLoading: isLoadingAIInsights } = useQuery<ApiResponse<{ summary: string; recommendations: { id: string; text: string; priority: "high" | "medium" | "low" }[] }>>({ 
    queryKey: ['aiInsights'],
    queryFn: () => dashboardAPI.getAIInsights(), 
  });
  const aiInsightSummary = aiInsightsResponse?.data?.summary;
  const aiRecommendations = aiInsightsResponse?.data?.recommendations || [];

  const todayAbsorption = React.useMemo(() => {
    return [
      { id: '1', text: `Stok darah O- rendah (${adminOverviewData?.bloodUnitsOminus || 0} unit tersedia)`, priority: adminOverviewData?.bloodUnitsOminus && adminOverviewData.bloodUnitsOminus <= 10 ? "high" : "low" as "high" | "medium" | "low" },
      { id: '2', text: `Pasien meningkat ${adminOverviewData?.patientTrendData?.[0]?.value || 0}% dibandingkan kemarin`, priority: "medium" as "high" | "medium" | "low" }, 
      { id: '3', text: `Shift malam perlu tambahan perawat`, priority: "low" as "high" | "medium" | "low" }, 
    ];
  }, [adminOverviewData]);

  const { data: systemHealthResponse, isLoading: isLoadingSystemHealth } = useQuery<ApiResponse<any>>({
    queryKey: ['systemHealth'],
    queryFn: () => dashboardAPI.getSystemHealth(), 
  });
  const systemHealthData = systemHealthResponse?.data;

  const seedDatabaseMutation = useMutation({
    mutationFn: async () => {
      toast.error("Seed Database API belum diimplementasikan di backend!");
      return Promise.reject("Not Implemented"); 
    },
    onSuccess: () => {
      toast.success("Database berhasil diisi dengan data sampel!");
      queryClient.invalidateQueries({ queryKey: ['adminDashboardOverview'] });
      queryClient.invalidateQueries({ queryKey: ['patientsPerWeek'] });
      queryClient.invalidateQueries({ queryKey: ['patientsPerHour'] });
      queryClient.invalidateQueries({ queryKey: ['aiInsights'] });
      queryClient.invalidateQueries({ queryKey: ['systemHealth'] });
    },
    onError: (error: any) => {
      toast.error(`Gagal mengisi database: ${error.response?.data?.message || error.message}`);
    },
  });

  const overallLoading = isLoadingAuth || isLoadingAdminOverview || isLoadingPatientsPerWeek || isLoadingPatientsPerHour || isLoadingAIInsights || isLoadingSystemHealth;

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
          summary={aiInsightSummary} 
          recommendations={aiRecommendations} 
          isLoading={isLoadingAIInsights}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {overallLoading && patientsPerHourData.length === 0 ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-lg border border-gray-100">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="ml-2 text-slate-500">Memuat grafik pasien per jam...</p>
            </div>
          ) : (
            <HealthMetricsChart title="Pasien per Jam" type="bar" data={patientsPerHourData} />
          )}
        </div>

        <SystemInfoCard healthData={systemHealthData} isLoading={isLoadingSystemHealth} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <QuickActionsCard onSeedDatabase={seedDatabaseMutation.mutate} isSeeding={seedDatabaseMutation.isPending} />
        </div>

        <AIInsightCard 
          summary="Serapan Hari Ini"
          recommendations={todayAbsorption}
          isLoading={overallLoading}
        />
      </div>
    </div>
  )
}

export default Dashboard;