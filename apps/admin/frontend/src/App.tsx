import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Context Providers
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout/Layout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataPasien from "./pages/DataPasien";
import StokMedis from "./pages/StokMedis";
import JadwalSDM from "./pages/JadwalSDM";
import LayananMedis from "./pages/LayananMedis";
import LaporanAnalisis from "./pages/LaporanAnalisis";
import Settings from "./pages/Settings";
import Akun from "./pages/Akun";

// Styles
import "./index.css";

const App: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 1000);

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
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
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

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "#4ade80",
                    secondary: "#fff",
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
