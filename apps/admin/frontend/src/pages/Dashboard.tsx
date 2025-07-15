import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '../services/api'; // Mengimpor objek API yang benar
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Users, AlertTriangle, Home, BedDouble } from 'lucide-react'; // Mengimpor ikon yang sesuai

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// Komponen untuk Kartu Metrik dengan isi yang lengkap dan valid
const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ElementType, color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
    <div>
      <p className="text-sm font-semibold text-slate-500 uppercase">{title}</p>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon className="text-white" size={24} />
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  // Menggunakan fungsi API yang benar dari dashboardAPI
  const { data: overviewData, isLoading: overviewLoading, error: overviewError } = useQuery({
    queryKey: ['dashboardOverview'],
    queryFn: dashboardAPI.getOverview,
  });

  const { data: chartData, isLoading: chartLoading, error: chartError } = useQuery({
    queryKey: ['weeklyPatientsChart'],
    queryFn: () => dashboardAPI.getChartData('weekly-patients'), // Memanggil dengan parameter
  });

  // Konfigurasi untuk Grafik
  const lineChartData = {
    labels: chartData?.data?.labels || [],
    datasets: [
      {
        label: chartData?.data?.datasets?.[0]?.label || 'Pasien',
        data: chartData?.data?.datasets?.[0]?.data || [],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } }
  };

  if (overviewLoading || chartLoading) {
    return <div className="text-center p-8">Memuat data dasbor...</div>;
  }

  if (overviewError || chartError) {
    return <div className="text-center p-8 text-red-500">Gagal memuat data dasbor. Coba muat ulang halaman.</div>;
  }

  const overviewMetrics = overviewData?.data;

  return (
    <div className="space-y-8">
      {/* Bagian Atas: Kartu Metrik */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard title="Kunjungan Hari Ini" value={overviewMetrics?.todayVisits || 0} icon={Users} color="bg-blue-500" />
        <MetricCard title="Antrian Hari Ini" value={overviewMetrics?.todayQueues || 0} icon={Home} color="bg-purple-500" />
        <MetricCard title="Gawat Darurat" value={overviewMetrics?.todayEmergencies || 0} icon={AlertTriangle} color="bg-red-500" />
        {/* Placeholder untuk bed, bisa dihubungkan ke API nanti */}
        <MetricCard title="Bed Tersedia" value={42} icon={BedDouble} color="bg-green-500" />
      </div>

      {/* Bagian Tengah: Grafik */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-lg text-slate-800 mb-4">Pasien 7 Hari Terakhir</h3>
        <div className="h-80">
          <Line options={lineChartOptions} data={lineChartData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;