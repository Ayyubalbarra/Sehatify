//
// SEHATIFY - DATABASE SEEDER SCRIPT (FINAL VERSION)
// Jalankan dengan: npm run seed
//
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import dbConnection from '../config/database';
import PatientUser from '../models/patientUser.model';
import User from '../models/User';
import Polyclinic from '../models/Polyclinic';
import Schedule from '../models/Schedule';
import Queue from '../models/Queue';
import Inventory from '../models/Inventory';
import Bed from '../models/Bed';
import Visit from '../models/Visit';
import Hospital from '../models/Hospital';

class EnhancedDataSeeder {
  private isConnected = false;

  private async connect() {
    if (!this.isConnected) {
      await dbConnection.connect();
      this.isConnected = true;
    }
  }

  private async disconnect() {
    if (this.isConnected) {
      await dbConnection.disconnect();
      this.isConnected = false;
    }
  }

  public async seedAll() {
    try {
      console.log("🌱 Memulai proses seeding database (versi multi-rumah sakit)...");
      await this.connect();
      
      await this.clearAllData();
      
      const hospitals = await this.seedHospitals();
      const allPolyclinics = await this.seedPolyclinics(hospitals);
      const { allDoctors } = await this.seedUsers(hospitals, allPolyclinics);
      const allPatients = await this.seedPatients();
      await this.seedInventory();
      await this.seedBeds(hospitals, allPatients);
      const allSchedules = await this.seedSchedules(allDoctors);
      await this.seedQueues(allSchedules, allPatients);
      await this.seedVisits(allPatients, allDoctors, allPolyclinics);
      
      console.log("✅ Proses seeding database berhasil diselesaikan!");
    } catch (error) {
      console.error("❌ Terjadi kesalahan saat seeding database:", error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }

  private async clearAllData() {
    console.log("🗑️ Menghapus data lama...");
    const collections = [ Visit, Queue, Schedule, Bed, Inventory, PatientUser, Polyclinic, Hospital ];
    for (const model of collections) await model.deleteMany({});
    const adminUser = await User.findOne({ email: "admin@sehatify.com" });
    await User.deleteMany(adminUser ? { _id: { $ne: adminUser._id } } : {});
    console.log("✅ Data lama berhasil dibersihkan.");
  }

  private async seedHospitals() {
    console.log("🏥 Membuat data 3 rumah sakit...");
    const hospitalsData = [
        { name: "RS Sehatify Jakarta Pusat", address: "Jl. Jenderal Sudirman No. 123, Jakarta Pusat", phone: "021-1111-2222", email: "info.pusat@sehatify.com" },
        { name: "RS Sehatify Bekasi", address: "Jl. Ahmad Yani No. 1, Bekasi", phone: "021-3333-4444", email: "info.bekasi@sehatify.com" },
        { name: "RS Sehatify Bandung", address: "Jl. Asia Afrika No. 50, Bandung", phone: "022-5555-6666", email: "info.bandung@sehatify.com" },
    ];
    const hospitals = await Hospital.create(hospitalsData);
    console.log(`✅ ${hospitals.length} rumah sakit berhasil dibuat.`);
    return hospitals;
  }

  private async seedPolyclinics(hospitals: any[]) {
    console.log("🩺 Membuat data poliklinik untuk setiap rumah sakit...");
    const polyclinicTemplates = [
      { name: "Poliklinik Umum", department: "Umum", tarif: 150000 },
      { name: "Poliklinik Gigi", department: "Gigi", tarif: 250000 },
      { name: "Poliklinik Anak", department: "Anak", tarif: 200000 },
    ];
    let allCreatedPolyclinics = [];

    for (const hospital of hospitals) {
        const polyclinicsToCreate = polyclinicTemplates.map(p => ({
            ...p,
            name: `${p.name} (${hospital.name.split(' ')[2]})`,
            hospitalId: hospital._id
        }));
        const created = await Polyclinic.create(polyclinicsToCreate);
        allCreatedPolyclinics.push(...created);
    }
    
    console.log(`✅ ${allCreatedPolyclinics.length} poliklinik berhasil dibuat.`);
    return allCreatedPolyclinics;
  }
  
  private async seedUsers(hospitals: any[], allPolyclinics: any[]) {
    console.log("👨‍⚕️ Membuat data pengguna (admin, dokter, staf)...");
    let allCreatedUsers = [];

    const adminExists = await User.findOne({ email: "admin@sehatify.com" });
    if (!adminExists) {
        const admin = await User.create({ name: "Ayyub Albarra", email: "admin@sehatify.com", password: "password123", role: "Super Admin", isActive: true });
        allCreatedUsers.push(admin);
        console.log("🔑 Admin utama berhasil dibuat.");
    }

    const userTemplates = [
      { name: "Staff Pendaftaran", role: "staff" },
      { name: "dr. Budi Santoso", role: "doctor", specialization: "Umum" },
      { name: "drg. Citra Lestari", role: "doctor", specialization: "Gigi" },
      { name: "dr. Dian Anggraini, Sp.A", role: "doctor", specialization: "Anak" },
    ];

    for (const hospital of hospitals) {
        for (const userTemplate of userTemplates) {
            const location_suffix = hospital.name.split(' ')[2].toLowerCase();
            
            let email;
            if (userTemplate.role === 'doctor') {
                const namePart = userTemplate.name.split(' ')[1].replace(',', '').toLowerCase();
                email = `${namePart}.${location_suffix}@sehatify.com`;
            } else {
                email = `${userTemplate.role}.${location_suffix}@sehatify.com`;
            }

            const isDoctor = userTemplate.role === 'doctor';
            const polyclinic = isDoctor ? allPolyclinics.find(p => p.hospitalId.equals(hospital._id) && p.department === userTemplate.specialization) : null;
            
            if (isDoctor && !polyclinic) continue;

            const user = await User.create({
                ...userTemplate,
                name: `${userTemplate.name} (${location_suffix.charAt(0).toUpperCase() + location_suffix.slice(1)})`,
                email, password: "password123", hospitalId: hospital._id,
                polyclinicId: polyclinic?._id, isActive: true,
            });
            allCreatedUsers.push(user);
        }
    }
    
    console.log(`✅ ${allCreatedUsers.length} pengguna berhasil dibuat.`);
    return {
      allDoctors: allCreatedUsers.filter(u => u.role === 'doctor'),
      allStaff: allCreatedUsers.filter(u => u.role === 'staff'),
    };
  }
  
  private async seedPatients() {
    console.log("🧍 Membuat data pasien...");
    const firstNames = ["Ahmad", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hasan", "Indah", "Joko"];
    const lastNames = ["Santoso", "Wijaya", "Lestari", "Pratama", "Nugroho", "Setiawan", "Kusuma", "Halim"];
    const patientsData = Array.from({ length: 20 }, (_, i) => ({
        fullName: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
        email: `pasien${i + 1}@example.com`,
        phone: `0812100020${i.toString().padStart(2, '0')}`,
        password: "password123",
        dateOfBirth: new Date(1970 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        address: `Jl. Sehat Sejahtera No. ${i + 1}, Jakarta`
    }));
    const patients = await PatientUser.create(patientsData);
    console.log(`✅ ${patients.length} pasien berhasil dibuat.`);
    return patients;
  }
  
  private async seedInventory() {
    console.log("📦 Membuat data inventaris (global)...");
    const inventoryData = [
      { name: "Paracetamol 500mg", category: "Obat", currentStock: 200, minimumStock: 50, unit: "tablet", unitPrice: 500 },
      { name: "Amoxicillin 500mg", category: "Obat", currentStock: 45, minimumStock: 50, unit: "kapsul", unitPrice: 1500 },
      { name: "Masker Medis N95", category: "Alkes", currentStock: 500, minimumStock: 100, unit: "pcs", unitPrice: 2500 },
      { name: "Darah O+", category: "Darah", currentStock: 8, minimumStock: 10, unit: "kantong", unitPrice: 360000 },
    ];
    await Inventory.create(inventoryData);
    console.log(`✅ ${inventoryData.length} item inventaris berhasil dibuat.`);
  }

  private async seedBeds(hospitals: any[], patients: any[]) {
    console.log("🛏️ Membuat data tempat tidur...");
    let allCreatedBeds = [];
    const bedTemplates = [
      { ward: "General Ward", roomNumber: "201", bedNumber: "A", bedType: "Standard", dailyRate: 500000 },
      { ward: "General Ward", roomNumber: "201", bedNumber: "B", bedType: "Standard", dailyRate: 500000 },
      { ward: "VIP", roomNumber: "301", bedNumber: "A", bedType: "VIP", dailyRate: 1500000 },
    ];
    
    let patientIndex = 0;
    for (const hospital of hospitals) {
        const hospitalSuffix = hospital.name.split(' ')[2].substring(0, 3).toUpperCase();
        
        const bedsToCreate = bedTemplates.map(b => {
            const isOccupied = Math.random() > 0.5;
            const bed = { ...b, roomNumber: `${b.roomNumber}-${hospitalSuffix}`, hospitalId: hospital._id, status: isOccupied ? 'occupied' : 'available', currentPatient: isOccupied ? patients[patientIndex % patients.length]._id : null };
            if(isOccupied) patientIndex++;
            return bed;
        });
        const created = await Bed.create(bedsToCreate);
        allCreatedBeds.push(...created);
    }
    console.log(`✅ ${allCreatedBeds.length} tempat tidur berhasil dibuat.`);
  }
  
  private async seedSchedules(doctors: any[]) {
    console.log("🗓️ Membuat data jadwal dokter...");
    const schedules = [];
    const today = new Date();
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    for (let i = -7; i <= 7; i++) {
      const scheduleDate = new Date();
      scheduleDate.setDate(today.getDate() + i);
      if (scheduleDate.getDay() === 0) continue; 

      for (const doctor of doctors) {
        if (!doctor.polyclinicId || Math.random() > 0.8) continue;
        schedules.push({
          doctorId: doctor._id, polyclinicId: doctor.polyclinicId,
          dayOfWeek: days[scheduleDate.getDay()], date: scheduleDate,
          startTime: (Math.random() > 0.5 ? "09:00" : "14:00"), endTime: (Math.random() > 0.5 ? "12:00" : "17:00"),
          quota: 20, status: "Active"
        });
      }
    }
    const createdSchedules = await Schedule.create(schedules);
    console.log(`✅ ${createdSchedules.length} jadwal berhasil dibuat.`);
    return createdSchedules;
  }
  
  // --- PERBAIKAN UTAMA DI FUNGSI INI ---
  private async seedQueues(schedules: any[], patients: any[]) {
    console.log("🚶 Membuat data antrean...");
    const today = new Date();
    today.setHours(0,0,0,0);
    const upcomingSchedules = schedules.filter(s => s.date >= today);
    if (upcomingSchedules.length === 0 || patients.length === 0) {
        console.log("🟡 Tidak ada jadwal mendatang atau pasien untuk dibuatkan antrean.");
        return;
    }

    const queues = [];
    for (let i = 0; i < 30; i++) {
        const patient = patients[i % patients.length];
        const schedule = upcomingSchedules[i % upcomingSchedules.length];
        
        // Menambahkan field yang hilang
        queues.push({
            patientId: patient._id,
            doctorId: schedule.doctorId,
            polyclinicId: schedule.polyclinicId,
            scheduleId: schedule._id,
            queueDate: schedule.date,
            status: "Waiting",
            appointmentTime: schedule.startTime, // <-- Ditambahkan
            createdBy: patient._id,             // <-- Ditambahkan
        });
    }
    await Queue.create(queues);
    console.log(`✅ ${queues.length} antrean berhasil dibuat.`);
  }
  
  private async seedVisits(patients: any[], doctors: any[], polyclinics: any[]) {
    console.log("📝 Membuat data riwayat kunjungan...");
    const visits = [];
    const visitTypes = ["Consultation", "Follow-up", "Emergency", "Check-up", "Treatment"];
    for (let i = 0; i < 200; i++) {
      const visitDate = new Date();
      visitDate.setDate(visitDate.getDate() - Math.floor(Math.random() * 180));
      
      const patient = patients[i % patients.length];
      const doctor = doctors[i % doctors.length];
      const polyclinic = polyclinics.find(p => p._id.equals(doctor.polyclinicId));

      if (patient && doctor && polyclinic) {
        visits.push({
          patientId: patient._id, doctorId: doctor._id, polyclinicId: doctor.polyclinicId,
          visitDate: visitDate, visitType: visitTypes[i % visitTypes.length],
          status: "Completed", totalCost: polyclinic.tarif + (Math.floor(Math.random() * 10) * 50000),
          paymentStatus: "Paid",
        });
      }
    }
    await Visit.create(visits);
    console.log(`✅ ${visits.length} riwayat kunjungan berhasil dibuat.`);
  }
}

if (require.main === module) {
  const seeder = new EnhancedDataSeeder();
  seeder.seedAll().catch(error => {
    console.error("❌ Gagal menjalankan skrip seeding:", error);
    process.exit(1);
  });
}