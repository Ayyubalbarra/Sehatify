// apps/web/src/pages/Dashboard.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageCircle, FileText, Heart, Clock, Activity, Bell, Loader2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext'; 
import { useQuery } from '@tanstack/react-query';
import { appointmentAPI, medicalRecordAPI } from '../services/api'; 
import type { Appointment, Visit } from '../types';

const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuth();

  const { data: upcomingAppointmentsResponse, isLoading: isLoadingAppointments } = useQuery({ 
    queryKey: ['upcomingAppointments', user?._id],
    queryFn: appointmentAPI.getPatientUpcomingAppointments,
    enabled: !!user,
  });
  const upcomingAppointments = upcomingAppointmentsResponse?.data || [];
  const nextAppointment = upcomingAppointments[0]; // Data sudah diurutkan dari backend

  const { data: healthRecordsResponse, isLoading: isLoadingHealthRecords } = useQuery({ 
    queryKey: ['patientHealthRecords', user?._id],
    queryFn: medicalRecordAPI.getPatientMedicalRecords,
    enabled: !!user,
  });
  const healthRecordsCount = healthRecordsResponse?.data?.length || 0;
  
  // --- KARTU AKSI CEPAT (Tidak Berubah) ---
  const quickActionCards = [
    { icon: Calendar, title: 'Book Appointment', description: 'Schedule a visit with your preferred doctor', link: '/hospitals' },
    { icon: MessageCircle, title: 'AI Health Assistant', description: 'Get instant health advice', link: '/chatbot' },
    { icon: FileText, title: 'Medical Records', description: 'View your complete medical history', link: '/medical-records' },
    { icon: Heart, title: 'Health Articles', description: 'Read expert health tips and articles', link: '/articles' }
  ];

  // --- AKTIVITAS TERBARU (Tidak Berubah) ---
  const recentActivities = React.useMemo(() => {
    if (isLoadingAppointments || isLoadingHealthRecords) return [];
    // Gabungkan janji temu dan rekam medis, lalu urutkan berdasarkan tanggal
    const activities = [
        ...upcomingAppointments.map(app => ({
            date: new Date(app.queueDate),
            icon: Calendar,
            message: `Janji temu dengan ${app.doctorId?.name || 'Dokter'}`,
            details: `${app.polyclinicId?.name} | Pukul ${app.appointmentTime}`
        })),
        ...(healthRecordsResponse?.data || []).slice(0, 3).map((rec: Visit) => ({
            date: new Date(rec.visitDate),
            icon: FileText,
            message: `Rekam medis baru ditambahkan`,
            details: `Konsultasi dengan ${rec.doctorId?.name}`
        }))
    ];
    return activities.sort((a,b) => b.date.getTime() - a.date.getTime()).slice(0, 4);
  }, [upcomingAppointments, healthRecordsResponse, isLoadingAppointments, isLoadingHealthRecords]);

  if (isLoadingAuth) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
  }
  if (!isAuthenticated) {
    return <div className="min-h-screen py-8 flex items-center justify-center text-center"><p className="text-xl">Silakan <Link to="/login" className="text-primary hover:underline">login</Link> untuk melihat dashboard.</p></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user?.fullName || 'User'}!</h1>
          <p className="text-slate-500 mt-1">Here's what's happening with your health today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card><div className="flex items-center"><div className="bg-blue-100 rounded-full p-3"><Calendar className="h-8 w-8 text-blue-600" /></div><div className="ml-4">{isLoadingAppointments ? <Loader2 className="h-6 w-6 animate-spin" /> : <p className="text-2xl font-bold text-slate-800">{upcomingAppointments.length}</p>}<p className="text-slate-500">Upcoming Appointments</p></div></div></Card>
          <Card><div className="flex items-center"><div className="bg-green-100 rounded-full p-3"><Activity className="h-8 w-8 text-green-600" /></div><div className="ml-4">{isLoadingHealthRecords ? <Loader2 className="h-6 w-6 animate-spin" /> : <p className="text-2xl font-bold text-slate-800">{healthRecordsCount}</p>}<p className="text-slate-500">Health Records</p></div></div></Card>
          <Card><div className="flex items-center"><div className="bg-orange-100 rounded-full p-3"><Clock className="h-8 w-8 text-orange-600" /></div><div className="ml-4"><p className="text-2xl font-bold text-slate-800">0</p><p className="text-slate-500">Pending Results</p></div></div></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quickActionCards.map((card, index) => (
                <Link key={index} to={card.link}><Card hover className="h-full p-6"><div className="flex items-center mb-4"><div className={`${card.color} rounded-full p-3 text-white`}><card.icon className="h-8 w-8" /></div></div><h3 className="text-xl font-semibold text-slate-800 mb-2">{card.title}</h3><p className="text-slate-500">{card.description}</p></Card></Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Activity</h2>
            <Card className="p-6">
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3"><div className="bg-blue-50 rounded-full p-2"><activity.icon className="h-5 w-5 text-blue-600" /></div><div className="flex-1"><p className="text-slate-800 font-medium">{activity.message}</p><p className="text-slate-500 text-sm">{activity.details}</p></div></div>
                  ))
                ) : ( <p className="text-slate-500 text-center py-4">Tidak ada aktivitas terbaru.</p> )}
              </div>
            </Card>

            <Card className="mt-6 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Next Appointment</h3>
              {isLoadingAppointments ? ( <div className="flex justify-center py-4"><Loader2 className="h-6 w-6 animate-spin" /></div> ) 
              : nextAppointment ? (
                <div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-slate-200 w-12 h-12 rounded-full flex items-center justify-center"><Heart className="w-6 h-6 text-slate-600"/></div>
                    <div>
                      {/* Tampilkan data yang sudah di-populate */}
                      <p className="font-medium text-slate-900">{nextAppointment.doctorId?.name || 'Nama Dokter'}</p>
                      <p className="text-slate-500 text-sm">{nextAppointment.doctorId?.specialization || 'Spesialisasi'}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600 space-y-1">
                    <p><Calendar className="inline h-4 w-4 mr-2" />{new Date(nextAppointment.queueDate).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p><Clock className="inline h-4 w-4 mr-2" />Pukul {nextAppointment.appointmentTime}</p>
                    <p>No. Antrian: <span className="font-medium text-primary">{nextAppointment.queueNumber}</span></p>
                  </div>
                </div>
              ) : ( <p className="text-slate-500 text-center py-4">Tidak ada janji temu mendatang.</p> )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;