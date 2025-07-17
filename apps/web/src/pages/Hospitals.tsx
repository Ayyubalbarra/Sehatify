import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPin, 
  Phone, 
  Star, 
  Users, 
  Clock, 
  Heart,
  Search,
  Calendar,
  Loader2
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import { hospitalAPI } from '../services/api';
import type { Hospital, Polyclinic } from '../types';

const Hospitals: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const navigate = useNavigate();

  // Mengambil data rumah sakit dari backend menggunakan react-query
  const { data: hospitalsResponse, isLoading } = useQuery({
    queryKey: ['hospitals'],
    queryFn: hospitalAPI.getHospitals,
    staleTime: 5 * 60 * 1000, // Data dianggap fresh selama 5 menit
  });
  const hospitals = hospitalsResponse?.data || [];

  // Membuat daftar spesialiasi (poliklinik) yang unik dari semua rumah sakit
  const allSpecialties = useMemo(() => {
    if (!hospitals) return [];
    const specialties = hospitals.flatMap((h: Hospital) => 
      h.polyclinics.map((p: Polyclinic) => p.name)
    );
    return Array.from(new Set(specialties));
  }, [hospitals]);

  // Melakukan filter rumah sakit di sisi client berdasarkan pencarian dan spesialiasi
  const filteredHospitals = useMemo(() => {
    return hospitals.filter((hospital: Hospital) => {
      const matchesSearch = 
        hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hospital.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSpecialty = 
        selectedSpecialty === '' || 
        hospital.polyclinics.some((p: Polyclinic) => p.name === selectedSpecialty);
        
      return matchesSearch && matchesSpecialty;
    });
  }, [hospitals, searchTerm, selectedSpecialty]);

  const handleBookAppointment = (hospital: Hospital) => {
    // Navigasi ke halaman booking dengan membawa data rumah sakit yang dipilih
    navigate('/book-appointment', { 
      state: { selectedHospital: hospital } 
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-4 text-slate-500">Memuat data rumah sakit...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">Rumah Sakit Rekanan Kami</h1>
          <p className="text-lg text-slate-500 max-w-3xl mx-auto">
            Temukan jaringan fasilitas kesehatan terakreditasi kami yang siap memberikan pelayanan terbaik.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari rumah sakit berdasarkan nama atau lokasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
              />
            </div>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="">Semua Spesialisasi</option>
              {allSpecialties.map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hospitals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital._id} className="overflow-hidden flex flex-col">
              <div className="p-6 flex-grow">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">{hospital.name}</h3>
                <div className="flex items-center text-slate-500 text-sm mb-4">
                  <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>{hospital.address}</span>
                </div>

                <h4 className="font-semibold text-slate-700 mb-2">Poliklinik Tersedia:</h4>
                <div className="flex flex-wrap gap-2">
                  {hospital.polyclinics.slice(0, 5).map((poly) => (
                    <span key={poly._id} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
                      {poly.name}
                    </span>
                  ))}
                  {hospital.polyclinics.length > 5 && (
                    <span className="text-blue-800 text-xs px-3 py-1">
                      +{hospital.polyclinics.length - 5} lainnya
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-slate-50 p-4 mt-auto">
                <Button 
                  className="w-full"
                  onClick={() => handleBookAppointment(hospital)}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Buat Janji Temu
                </Button>
              </div>
            </Card>
          ))}
        </div>
        {filteredHospitals.length === 0 && !isLoading && (
            <div className="text-center py-16 col-span-full">
                <p className="text-slate-500">Tidak ada rumah sakit yang cocok dengan kriteria pencarian Anda.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Hospitals;