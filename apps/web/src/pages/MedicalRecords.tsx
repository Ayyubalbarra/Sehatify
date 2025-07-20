// apps/web/src/pages/MedicalRecords.tsx

import React, { useState, useMemo } from 'react';
import { FileText, Calendar, User, Activity, Download, Search, TrendingUp, Heart, Zap, Weight, Loader2 } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import MedicalRecordCard from '../components/MedicalRecordCard';
import HealthTrendChart from '../components/charts/HealthTrendChart'; 
import HealthMetricsChart from '../components/charts/HealthMetricsChart'; 
import { useQuery } from '@tanstack/react-query'; 
import { medicalRecordAPI } from '../services/api'; 
import type { ApiResponse, MedicalRecord as MedicalRecordType, Visit } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Helper untuk memproses data dari backend menjadi format yang dibutuhkan chart
const processChartData = (records: Visit[]) => {
    // Health Trends (Tanda Vital)
    const healthTrendData = records
        .filter(r => r.vitalSigns) // Hanya ambil data yang memiliki tanda vital
        .map(r => ({
            date: new Date(r.visitDate).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit' }), // format YYYY-MM
            bloodPressureSystolic: parseInt(r.vitalSigns?.bloodPressure?.split('/')[0] || '0'),
            bloodPressureDiastolic: parseInt(r.vitalSigns?.bloodPressure?.split('/')[1] || '0'),
            heartRate: r.vitalSigns?.heartRate || 0,
            weight: r.vitalSigns?.weight || 0,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Diagnosis Distribution
    const diagnosisCounts = records.reduce((acc, record) => {
        const diagnosis = record.diagnosis?.primary || 'Lainnya';
        acc[diagnosis] = (acc[diagnosis] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const diagnosisData = Object.entries(diagnosisCounts).map(([name, value]) => ({ name, value }));
    
    // Visit Frequency
    const visitFrequencyCounts = records.reduce((acc, record) => {
        const monthYear = new Date(record.visitDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const visitFrequencyData = Object.entries(visitFrequencyCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a,b) => new Date(b.name).getTime() - new Date(a.name).getTime()) // Urutkan dari bulan terbaru
        .slice(0, 6); // Ambil 6 bulan terakhir

    return { healthTrendData, diagnosisData, visitFrequencyData };
};


const MedicalRecords: React.FC = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState('date');
    const [selectedMetric, setSelectedMetric] = useState<'bloodPressure' | 'heartRate' | 'weight'>('bloodPressure');

    // Query untuk mendapatkan Medical Records dari API
    const { data: medicalRecordsResponse, isLoading: isLoadingRecords } = useQuery<ApiResponse<Visit[]>>({
        queryKey: ['medicalRecords', user?._id],
        // PERBAIKAN: Memanggil fungsi API yang benar tanpa parameter yang tidak perlu
        queryFn: medicalRecordAPI.getPatientMedicalRecords,
        enabled: !!user?._id,
    });

    const medicalRecords: Visit[] = medicalRecordsResponse?.data || [];

    // Mengolah data dari API untuk semua komponen menggunakan useMemo
    const { healthTrendData, diagnosisData, visitFrequencyData } = useMemo(() => {
        if (!medicalRecords || medicalRecords.length === 0) {
            return { healthTrendData: [], diagnosisData: [], visitFrequencyData: [] };
        }
        return processChartData(medicalRecords);
    }, [medicalRecords]);
    
    // Logika untuk kartu metrik
    const totalVisits = medicalRecords.length;
    const uniqueDoctors = new Set(medicalRecords.map(r => r.doctorId.name)).size;
    const totalPrescriptions = medicalRecords.reduce((acc, record) => acc + (record.prescription?.length || 0), 0);
    const lastVisit = medicalRecords[0]?.visitDate; // Sudah diurutkan dari backend

    // Logika untuk filter dan sort di sisi client
    const filteredRecords = useMemo(() => 
        medicalRecords
        .filter(record => {
            const searchTermLower = searchTerm.toLowerCase();
            return (
                record.diagnosis?.primary?.toLowerCase().includes(searchTermLower) ||
                record.doctorId.name.toLowerCase().includes(searchTermLower)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'diagnosis') {
                return (a.diagnosis?.primary || '').localeCompare(b.diagnosis?.primary || '');
            }
            return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime(); // Default sort by date
        }),
    [medicalRecords, searchTerm, sortBy]);


    if (isLoadingRecords) {
        return (
          <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-4 text-text-light">Memuat rekam medis...</p>
          </div>
        );
    }

    return (
        <div className="min-h-screen bg-background py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-text mb-4">Medical Records</h1>
                    <p className="text-lg text-text-light">Your complete medical history and health analytics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="text-center p-6"><div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4"><FileText className="h-6 w-6 text-blue-600" /></div><div className="text-3xl font-bold text-text mb-1">{totalVisits}</div><div className="text-text-light">Total Visits</div></Card>
                    <Card className="text-center p-6"><div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4"><User className="h-6 w-6 text-green-600" /></div><div className="text-3xl font-bold text-text mb-1">{uniqueDoctors}</div><div className="text-text-light">Doctors Consulted</div></Card>
                    <Card className="text-center p-6"><div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4"><Activity className="h-6 w-6 text-purple-600" /></div><div className="text-3xl font-bold text-text mb-1">{totalPrescriptions}</div><div className="text-text-light">Prescriptions</div></Card>
                    <Card className="text-center p-6"><div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4"><Calendar className="h-6 w-6 text-orange-600" /></div><div className="text-3xl font-bold text-text mb-1">{lastVisit ? new Date(lastVisit).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'N/A'}</div><div className="text-text-light">Last Visit</div></Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2">
                        <Card><div className="flex items-center justify-between mb-6 p-6 pb-0"><h2 className="text-2xl font-bold text-text flex items-center"><TrendingUp className="h-6 w-6 mr-2 text-primary" />Health Trends</h2><div className="flex space-x-2"><Button variant={selectedMetric === 'bloodPressure' ? 'primary' : 'outline'} size="sm" onClick={() => setSelectedMetric('bloodPressure')}><Heart className="h-4 w-4 mr-1" />BP</Button><Button variant={selectedMetric === 'heartRate' ? 'primary' : 'outline'} size="sm" onClick={() => setSelectedMetric('heartRate')}><Zap className="h-4 w-4 mr-1" />HR</Button><Button variant={selectedMetric === 'weight' ? 'primary' : 'outline'} size="sm" onClick={() => setSelectedMetric('weight')}><Weight className="h-4 w-4 mr-1" />Weight</Button></div></div><HealthTrendChart data={healthTrendData} metric={selectedMetric} /></Card>
                    </div>
                    <div className="space-y-6">
                        <HealthMetricsChart type="pie" data={diagnosisData} title="Diagnosis Distribution"/>
                    </div>
                </div>

                <div className="mb-8"><HealthMetricsChart type="bar" data={visitFrequencyData} title="Visit Frequency (Last 6 Months)"/></div>

                <Card className="mb-8 p-4"><div className="flex flex-col md:flex-row gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-light" /><input type="text" placeholder="Cari berdasarkan diagnosis atau dokter..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none" /></div><div className="flex gap-2"><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"><option value="date">Sort by Date</option><option value="diagnosis">Sort by Diagnosis</option></select><Button variant="outline"><Download className="h-4 w-4 mr-2" />Export All</Button></div></div></Card>

                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-text">Medical History</h2>
                    {filteredRecords.length > 0 ? (
                        filteredRecords.map((record) => (
                            <MedicalRecordCard key={record._id} record={record as MedicalRecordType} isExpanded={expandedRecord === record._id} onToggle={() => setExpandedRecord(prev => (prev === record._id ? null : record._id))}/>
                        ))
                    ) : (
                        <div className="text-center py-12"><div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4"><FileText className="h-8 w-8 text-gray-400" /></div><h3 className="text-xl font-semibold text-text mb-2">No records found</h3><p className="text-text-light">{searchTerm ? 'Try adjusting your search terms' : 'Your medical records will appear here'}</p></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MedicalRecords;