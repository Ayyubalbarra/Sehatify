// apps/admin/frontend/src/App.tsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout/Layout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataPasien from "./pages/DataPasien";
import StokMedis from "./pages/StokMedis";
import JadwalSDM from "./pages/JadwalSDM";
import LayananMedis from "./pages/LayananMedis";
import LaporanAnalisis from "./pages/LaporanAnalisis";
import Settings from "./pages/Settings";
import Akun from "./pages/Akun";

import "./index.css";

const App: React.FC = () => {
  // Logika 'isInitializing' bisa dihapus jika tidak diperlukan lagi,
  // karena AuthContext sudah memiliki state loading sendiri.
  // Namun, kita biarkan untuk saat ini.
  const [isInitializing, setIsInitializing] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 500); // Durasi bisa dikurangi
    return () => clearTimeout(timer);
  }, []);

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-2xl font-semibold text-blue-600">
          Memuat aplikasi...
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes inside Layout */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            {/* Redirect dari root path ke dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Halaman-halaman di dalam dashboard */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="data-pasien" element={<DataPasien />} />
            <Route path="stok-medis" element={<StokMedis />} />
            <Route path="jadwal-sdm" element={<JadwalSDM />} />
            <Route path="layanan-medis" element={<LayananMedis />} />
            <Route path="laporan-analisis" element={<LaporanAnalisis />} />
            <Route path="settings" element={<Settings />} />
            <Route path="akun" element={<Akun />} />
          </Route>
        </Route>

        {/* Jika ada URL yang tidak cocok, arahkan ke dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#363636", color: "#fff" },
          success: {
            duration: 3000,
            iconTheme: { primary: "#4ade80", secondary: "#fff" },
          },
          error: {
            duration: 5000,
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />
    </div>
  );
};

export default App;