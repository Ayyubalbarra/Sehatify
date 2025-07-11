import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/book-appointment" element={<BookAppointment />} />
            <Route path="/chatbot" element={<ChatbotAI />} />
            <Route path="/articles" element={<ArticlesList />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/medical-records" element={<MedicalRecords />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;