// apps/admin/frontend/src/pages/LaporanAnalisis.tsx

"use client"

import React, { useState, useRef } from "react"
import { BarChart3, TrendingUp, Download, Calendar, Filter, Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import toast from "react-hot-toast"

// Impor library untuk ekspor
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import * as XLSX from 'xlsx'

import MetricCard from "../components/Dashboard/MetricCard"
import HealthTrendChart from "../components/charts/HealthTrendChart" 
import HealthMetricsChart from "../components/charts/HealthMetricsChart" 
import { dashboardAPI } from "../services/api" 
import type { 
  ApiResponse,
  DashboardOverviewApiData, 
  ChartDataForRecharts, 
  FinancialSummaryData, 
  ServiceDistributionData 
} from '../types'

const LaporanAnalisis: React.FC = () => {
  const [dateRange, setDateRange] = useState("30d") 
  const [reportType, setReportType] = useState("overview")
  const [isExporting, setIsExporting] = useState(false) // State untuk loading ekspor

  // useRef untuk menargetkan area yang akan di-print ke PDF
  const reportContentRef = useRef<HTMLDivElement>(null);

  const reportTypes = [
    { key: "overview", label: "Overview" },
    { key: "financial", label: "Keuangan" },
  ]

  const dateRanges = [
    { key: "7d", label: "7 Hari Terakhir" },
    { key: "30d", label: "30 Hari Terakhir" },
    { key: "90d", label: "3 Bulan Terakhir" },
    { key: "1y", label: "1 Tahun Terakhir" },
  ]

  // --- Pengambilan Data (Sudah Benar) ---
  const { data: overviewResponse, isLoading: isLoadingOverview } = useQuery<ApiResponse<DashboardOverviewApiData>>({
    queryKey: ['dashboardOverview', dateRange],
    queryFn: () => dashboardAPI.getOverview(dateRange), 
  });
  const overviewData = overviewResponse?.data; 

  const { data: patientTrendResponse, isLoading: isLoadingPatientTrend } = useQuery<ApiResponse<ChartDataForRecharts[]>>({
    queryKey: ['patientTrendChart', dateRange],
    queryFn: () => dashboardAPI.getChartData('weekly-patients', dateRange), 
  });
  const patientTrendData = patientTrendResponse?.data || []; 

  const { data: serviceDistributionResponse, isLoading: isLoadingServiceDistribution } = useQuery<ApiResponse<ServiceDistributionData[]>>({
    queryKey: ['serviceDistributionChart', dateRange],
    queryFn: () => dashboardAPI.getServiceDistribution(dateRange), 
  });
  const serviceDistributionData = serviceDistributionResponse?.data || []; 

  const { data: financialSummaryResponse, isLoading: isLoadingFinancial } = useQuery<ApiResponse<FinancialSummaryData>>({
    queryKey: ['financialSummary', dateRange],
    queryFn: () => dashboardAPI.getFinancialSummary(dateRange), 
  });
  const financial = financialSummaryResponse?.data;
  
  const totalVisits = overviewData?.totalVisits || 0;
  const avgDaily = overviewData?.averageDaily || 0;
  const occupancyRate = overviewData?.occupancyRate || 0;

  const financialSummaryTableData = [
    {label: "Total Pendapatan", value: `Rp ${financial?.totalRevenue?.toLocaleString('id-ID') || '0'}`, change: "+12.5%"},
    {label: "Biaya Operasional", value: `Rp ${financial?.expenses?.toLocaleString('id-ID') || '0'}`, change: "+5.2%"},
    {label: "Profit", value: `Rp ${financial?.profit?.toLocaleString('id-ID') || '0'}`, change: "+2.1%"},
    {label: "Kepuasan Pasien", value: `${financial?.patientSatisfaction?.toFixed(1) || '0'}/5.0`, change: "+0.3"},
  ]
  
  const overallLoading = isLoadingOverview || isLoadingPatientTrend || isLoadingServiceDistribution || isLoadingFinancial;

  // --- FUNGSI EKSPOR ---

  const handleExportPDF = () => {
    if (!reportContentRef.current) {
      toast.error("Gagal mengekspor PDF: Konten tidak ditemukan.");
      return;
    }
    
    setIsExporting(true);
    toast.loading("Mempersiapkan PDF...", { id: 'pdf-export' });

    html2canvas(reportContentRef.current, { 
      scale: 2, // Meningkatkan resolusi gambar
      useCORS: true,
      backgroundColor: '#ffffff' // Latar belakang putih untuk menghindari transparansi
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan Analisis - ${new Date().toLocaleDateString('id-ID')}.pdf`);
      
      toast.success("PDF berhasil diunduh!", { id: 'pdf-export' });
    }).catch(err => {
      console.error("Error exporting PDF:", err);
      toast.error("Terjadi kesalahan saat membuat PDF.", { id: 'pdf-export' });
    }).finally(() => {
      setIsExporting(false);
    });
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    toast.loading("Mempersiapkan Excel...", { id: 'excel-export' });

    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Ringkasan Metrik
      const summaryMetrics = [
        { Metrik: 'Total Kunjungan', Nilai: totalVisits },
        { Metrik: 'Rata-rata Harian', Nilai: avgDaily },
        { Metrik: 'Tingkat Okupansi (%)', Nilai: occupancyRate.toFixed(1) },
      ];
      const ws1 = XLSX.utils.json_to_sheet(summaryMetrics);
      XLSX.utils.book_append_sheet(wb, ws1, "Ringkasan Metrik");

      // Sheet 2: Detail Keuangan
      const financialDetails = [
        { Detail: 'Total Pendapatan', Nilai: financial?.totalRevenue || 0 },
        { Detail: 'Biaya Operasional', Nilai: financial?.expenses || 0 },
        { Detail: 'Profit', Nilai: financial?.profit || 0 },
        { Detail: 'Kepuasan Pasien (skala 5)', Nilai: financial?.patientSatisfaction || 0 },
      ];
      const ws2 = XLSX.utils.json_to_sheet(financialDetails);
      XLSX.utils.book_append_sheet(wb, ws2, "Detail Keuangan");

      // Sheet 3: Tren Kunjungan Pasien
      const ws3 = XLSX.utils.json_to_sheet(patientTrendData.map(d => ({ Tanggal: d.name, Kunjungan: d.value })));
      XLSX.utils.book_append_sheet(wb, ws3, "Tren Kunjungan Pasien");

      // Sheet 4: Distribusi Layanan
      const ws4 = XLSX.utils.json_to_sheet(serviceDistributionData.map(d => ({ Layanan: d.name, Jumlah: d.value })));
      XLSX.utils.book_append_sheet(wb, ws4, "Distribusi Layanan");

      XLSX.writeFile(wb, `Laporan Keuangan & Operasional - ${new Date().toLocaleDateString('id-ID')}.xlsx`);
      toast.success("Excel berhasil diunduh!", { id: 'excel-export' });
    } catch (err) {
      console.error("Error exporting Excel:", err);
      toast.error("Terjadi kesalahan saat membuat Excel.", { id: 'excel-export' });
    } finally {
      setIsExporting(false);
    }
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Laporan dan Analisis</h1>
          <p className="text-slate-500">Hasilkan dan unduh laporan penting untuk manajemen rumah sakit.</p>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
            {/* Tombol Ekspor PDF */}
            <button onClick={handleExportPDF} disabled={isExporting || overallLoading} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto">
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Export PDF
            </button>
            <button disabled className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 md:w-auto opacity-50 cursor-not-allowed">
              <BarChart3 size={16} />
              Buat Laporan
            </button>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row">
        <div className="flex w-full items-center gap-2 md:w-auto">
          <label className="flex-shrink-0 text-sm font-medium text-slate-700">Tipe:</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)} disabled={overallLoading} className="w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">
            {reportTypes.map((type) => (<option key={type.key} value={type.key}>{type.label}</option>))}
          </select>
        </div>
        <div className="flex w-full items-center gap-2 md:w-auto">
          <label className="flex-shrink-0 text-sm font-medium text-slate-700">Periode:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} disabled={overallLoading} className="w-full rounded-md border-slate-300 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">
            {dateRanges.map((range) => (<option key={range.key} value={range.key}>{range.label}</option>))}
          </select>
        </div>
        <button disabled className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 opacity-50 cursor-not-allowed">
          <Filter size={16} />
          <span>Filter Lanjutan</span>
        </button>
      </div>
      
      {/* Wrapper untuk konten yang akan diekspor, dengan ref */}
      <div ref={reportContentRef} className="space-y-6 bg-white p-4 md:p-6 rounded-xl">
        {overallLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="ml-4 text-slate-500">Memuat laporan...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard title="Total Kunjungan" value={totalVisits.toLocaleString('id-ID')} icon={TrendingUp} color="blue" trend="up" trendValue="+15.3%" />
              <MetricCard title="Rata-rata Harian" value={avgDaily.toLocaleString('id-ID')} icon={Calendar} color="green" trend="up" trendValue="+8.2%" />
              <MetricCard title="Tingkat Okupansi" value={`${occupancyRate.toFixed(1)}%`} icon={BarChart3} color="purple" trend="up" trendValue="+3.1%" />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <HealthTrendChart title="Tren Kunjungan Pasien" data={patientTrendData} dataKey="value" strokeColor="#3B82F6" />
              <HealthMetricsChart title="Distribusi Layanan" type="bar" data={serviceDistributionData} />
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-800">Detail Laporan Keuangan</h3>
                  {/* Tombol Ekspor Excel */}
                  <button onClick={handleExportExcel} disabled={isExporting || overallLoading} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60">
                    {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                    Export Excel
                  </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                  {financialSummaryTableData.map(item => (
                      <div key={item.label} className="p-4 border-b md:border-b-0 md:border-r border-slate-100 last:border-0">
                          <p className="text-sm text-slate-500">{item.label}</p>
                          <p className="text-xl font-bold text-slate-800">{item.value}</p>
                          {/* Note: Persentase perubahan ini masih hardcoded */}
                          <p className={`text-sm font-semibold text-green-500`}>{item.change}</p>
                      </div>
                  ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default LaporanAnalisis;