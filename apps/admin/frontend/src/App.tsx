import type React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"

// Context Providers
import { AuthProvider } from "./contexts/AuthContext.tsx"
import { NotificationProvider } from "./contexts/NotificationContext.tsx"

// Components
import ProtectedRoute from "./components/ProtectedRoute.tsx"
import Layout from "./components/Layout/Layout.tsx"

// Pages
import Login from "./pages/Login.tsx"
import Dashboard from "./pages/Dashboard.tsx"
import DataPasien from "./pages/DataPasien.tsx"
import StokMedis from "./pages/StokMedis.tsx"
import JadwalSDM from "./pages/JadwalSDM.tsx"
import LayananMedis from "./pages/LayananMedis.tsx"
import LaporanAnalisis from "./pages/LaporanAnalisis.tsx"
import Settings from "./pages/Settings.tsx"
import Akun from "./pages/Akun.tsx"

// Styles
import "./index.css"

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
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

              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

            {/* Global Toast Notifications */}
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
  )
}

export default App