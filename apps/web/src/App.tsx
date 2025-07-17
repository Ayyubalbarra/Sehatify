// apps/web/src/App.tsx

import React from 'react';
import { Routes, Route } from 'react-router-dom'; 

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute'; // <-- 1. Impor komponen

// Import semua halaman
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import ChatbotAI from './pages/ChatbotAI';
import ArticlesList from './pages/ArticlesList';
import ArticleDetail from './pages/ArticleDetail';
import MedicalRecords from './pages/MedicalRecords';
import Hospitals from './pages/Hospitals';
import About from './pages/About';
import Contact from './pages/Contact';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Rute Publik */}
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/articles" element={<ArticlesList />} />
          <Route path="/articles/:id" element={<ArticleDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* ✅ 2. Bungkus Rute yang Dilindungi */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/book-appointment" 
            element={
              <ProtectedRoute>
                <BookAppointment />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/medical-records" 
            element={
              <ProtectedRoute>
                <MedicalRecords />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/chatbot" 
            element={
              <ProtectedRoute>
                <ChatbotAI />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;