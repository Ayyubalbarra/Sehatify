// apps/api/src/scripts/seedBooking.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dbConnection from '../config/database';

import Hospital from '../models/Hospital';
import Polyclinic from '../models/Polyclinic';
import User from '../models/User';
import Schedule from '../models/Schedule';

dotenv.config({ path: '.env' });

const seedBookingData = async () => {
  try {
    console.log('Menghubungkan ke database...');
    await dbConnection.connect();

    console.log('Membersihkan data booking lama...');
    await Hospital.deleteMany({});
    await Polyclinic.deleteMany({});
    await User.deleteMany({ role: 'doctor' }); 
    await Schedule.deleteMany({});

    console.log('Membuat data Dokter...');
    const doctors = await User.create([
      { name: 'Dr. Budi Santoso', email: 'budi.s@sehatify.com', password: 'password123', role: 'doctor', specialization: 'Jantung', isActive: true },
      { name: 'Dr. Citra Lestari', email: 'citra.l@sehatify.com', password: 'password123', role: 'doctor', specialization: 'Anak', isActive: true },
      { name: 'Dr. Dian Permata', email: 'dian.p@sehatify.com', password: 'password123', role: 'doctor', specialization: 'Gigi', isActive: true },
      { name: 'Dr. Eko Prasetyo', email: 'eko.p@sehatify.com', password: 'password123', role: 'doctor', specialization: 'Umum', isActive: true },
      { name: 'Dr. Fina Anindita', email: 'fina.a@sehatify.com', password: 'password123', role: 'doctor', specialization: 'Jantung', isActive: true },
    ]);
    const [drBudi, drCitra, drDian, drEko, drFina] = doctors;
    console.log(`✅ ${doctors.length} dokter dibuat.`);

    console.log('Membuat data Poliklinik...');
    const polyclinics = await Polyclinic.create([
      { name: 'Poliklinik Jantung', department: 'Jantung', assignedDoctors: [{ doctorId: drBudi._id }, { doctorId: drFina._id }] },
      { name: 'Poliklinik Anak', department: 'Anak', assignedDoctors: [{ doctorId: drCitra._id }] },
      { name: 'Poliklinik Gigi', department: 'Gigi', assignedDoctors: [{ doctorId: drDian._id }] },
      { name: 'Poliklinik Umum', department: 'Umum', assignedDoctors: [{ doctorId: drEko._id }] },
    ]);
    const [poliJantung, poliAnak, poliGigi, poliUmum] = polyclinics;
    console.log(`✅ ${polyclinics.length} poliklinik dibuat.`);

    console.log('Membuat data Rumah Sakit...');
    await Hospital.create([
      { 
        name: 'Sehatify Medical Center', 
        address: '123 Healthcare Boulevard, Medical District, Jakarta 12345',
        polyclinics: [poliJantung._id, poliAnak._id, poliUmum._id]
      },
      { 
        name: 'Central General Hospital', 
        address: '456 Wellness Avenue, City Center, Jakarta 54321',
        polyclinics: [poliAnak._id, poliGigi._id, poliUmum._id]
      },
    ]);
    console.log('✅ Data Rumah Sakit dibuat.');

    console.log('Membuat data Jadwal...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextDay = new Date();
    nextDay.setDate(nextDay.getDate() + 2);
    
    await Schedule.create([
      { doctorId: drBudi._id, polyclinicId: poliJantung._id, date: tomorrow, startTime: '09:00', endTime: '12:00', totalSlots: 10, availableSlots: 10 },
      { doctorId: drFina._id, polyclinicId: poliJantung._id, date: nextDay, startTime: '10:00', endTime: '13:00', totalSlots: 8, availableSlots: 8 },
      { doctorId: drCitra._id, polyclinicId: poliAnak._id, date: tomorrow, startTime: '10:00', endTime: '13:00', totalSlots: 15, availableSlots: 15 },
      { doctorId: drDian._id, polyclinicId: poliGigi._id, date: nextDay, startTime: '14:00', endTime: '17:00', totalSlots: 5, availableSlots: 5 },
      { doctorId: drEko._id, polyclinicId: poliUmum._id, date: tomorrow, startTime: '08:00', endTime: '11:00', totalSlots: 20, availableSlots: 20 },
    ]);
    console.log('✅ Jadwal demo berhasil dibuat.');

    console.log('\n✨ Data demo untuk alur booking berhasil dibuat!');
  } catch (error) {
    console.error('❌ Gagal membuat data demo:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Koneksi database ditutup.');
  }
};

seedBookingData();