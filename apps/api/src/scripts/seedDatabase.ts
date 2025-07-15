import dotenv from 'dotenv';
dotenv.config();

import dbConnection from "../config/database";
import Patient from "../models/Patient";
import User from '../models/User'
import Polyclinic from "../models/Polyclinic";
import Schedule from "../models/Schedule";
import Queue from "../models/Queue";
import Inventory from "../models/Inventory";
import Bed from "../models/Bed";
import Visit from "../models/Visit";

// Asumsi ModelHelpers ada dan berfungsi
const ModelHelpers = {
    generatePolyclinicId: () => `POLI-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    generateDoctorId: () => `DOC-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    generatePatientId: () => `PAT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    generateItemId: () => `ITEM-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    generateScheduleId: () => `SCH-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    generateQueueId: () => `Q-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    generateVisitId: () => `VIS-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
};

export class EnhancedDataSeeder { // <-- Tambahkan 'export' agar bisa diimpor oleh seedRoutes.ts
  private isConnected = false;

  async connect() {
    if (!this.isConnected) {
      await dbConnection.connect();
      this.isConnected = true;
    }
  }

  async disconnect() {
    if (this.isConnected) {
      await dbConnection.disconnect();
      this.isConnected = false;
    }
  }
  
  async seedAll() {
    try {
      console.log("🌱 Starting enhanced database seeding...");
      await this.connect(); // Hubungkan ke database
      
      await this.createAdminUser();
      await this.clearAllData();
      await this.seedPolyclinics();
      await this.seedDoctors();
      await this.seedPatients();
      await this.seedInventory();
      await this.seedBeds();
      await this.seedSchedules();
      await this.seedQueues();
      await this.seedVisits();
      
      console.log("✅ Enhanced database seeding completed successfully!");
    } catch (error) {
      console.error("❌ Error seeding database:", error);
      throw error;
    } finally {
      await this.disconnect(); // Pastikan untuk diskonek setelah selesai
    }
  }

  async createAdminUser() {
    try {
      const existingAdmin = await User.findOne({ email: "admin@sehatify.com" });
      if (!existingAdmin) {
        console.log("Mencoba membuat admin baru...");

        const adminUser = new User({
          name: "Administrator",
          email: "admin@sehatify.com",
          password: "admin123",
          role: "admin"
        });

        await adminUser.save();
        console.log("✅ Admin user created with the correct hash!");
      } else {
        console.log("✅ Admin user already exists");
      }
    } catch (error) {
      console.error("❌ Error creating admin user:", error);
    }
  }

  async clearAllData() {
    console.log("🗑️ Clearing existing data...");
    await Promise.all([
      Visit.deleteMany({}),
      Queue.deleteMany({}),
      Schedule.deleteMany({}),
      Bed.deleteMany({}),
      Inventory.deleteMany({}),
      Patient.deleteMany({}),
      Doctor.deleteMany({}),
      Polyclinic.deleteMany({}),
    ]);
    console.log("✅ All data cleared");
  }

  async seedPolyclinics() {
    const polyclinics = [
        { name: "Poliklinik Umum", department: "Umum" },
        { name: "Poliklinik Jantung", department: "Jantung" },
        { name: "Poliklinik Anak", department: "Anak" },
        { name: "Poliklinik Mata", department: "Mata" },
        { name: "Poliklinik Gigi", department: "Gigi" },
    ];
    await Polyclinic.create(polyclinics.map(p => ({...p, polyclinicId: ModelHelpers.generatePolyclinicId(), description: `Pelayanan ${p.name}`, isActive: true })));
    console.log("✅ Polyclinics seeded");
  }

  async seedDoctors() {
    const doctors = [
        { employeeId: "EMP-001", name: "Dr. Ahmad Wijaya", specialization: "Umum", title: "dr." },
        { employeeId: "EMP-002", name: "Dr. Sarah Putri, Sp.JP", specialization: "Spesialis Jantung", title: "dr. Sp.JP" },
        { employeeId: "EMP-003", name: "Dr. Budi Santoso, Sp.A", specialization: "Spesialis Anak", title: "dr. Sp.A" },
        { employeeId: "EMP-004", name: "Dr. Lisa Maharani, Sp.M", specialization: "Spesialis Mata", title: "dr. Sp.M" },
    ];
    await Doctor.create(doctors.map(d => ({...d, doctorId: ModelHelpers.generateDoctorId(), licenseNumber: `STR${d.employeeId}`, joinDate: new Date(), phone: '08123456789', email: `${d.name.split(' ')[1].toLowerCase()}@sehatify.com`, status: 'Active' })));
    console.log("✅ Doctors seeded");
  }

  async seedPatients() {
    const patients = [
        { nik: "3201234567890001", name: "Andi Pratama", gender: "Laki-laki" },
        { nik: "3201234567890002", name: "Sari Dewi", gender: "Perempuan" },
        { nik: "3201234567890003", name: "Rudi Hermawan", gender: "Laki-laki" },
    ];
    await Patient.create(patients.map(p => ({...p, patientId: ModelHelpers.generatePatientId(), dateOfBirth: new Date("1990-01-01"), phone: '08123456789', address: 'Jl. Sehat No. 1', emergencyContact: { name: 'Keluarga', relationship: 'Keluarga', phone: '08123456789' } })));
    console.log("✅ Patients seeded");
  }

  async seedInventory() {
    const inventoryItems = [
        { name: "Paracetamol 500mg", category: "Obat", unit: "tablet", unitPrice: 500 },
        { name: "Syringe 5ml", category: "Alat Medis", unit: "pcs", unitPrice: 2500 },
        { name: "Amoxicillin 500mg", category: "Obat", unit: "tablet", unitPrice: 1200 },
        { name: "Masker Medis", category: "Alat Pelindung", unit: "pcs", unitPrice: 1500 },
    ];
    await Inventory.create(inventoryItems.map(i => ({...i, itemId: ModelHelpers.generateItemId(), currentStock: 500, minimumStock: 100, maximumStock: 2000, supplier: 'PT. Sehat Farma' })));
    console.log("✅ Inventory seeded");
  }

  async seedBeds() {
    const beds = [
        { ward: "ICU", roomNumber: "ICU-001", bedNumber: "001", bedType: "ICU", status: "available", dailyRate: 2000000 },
        { ward: "General Ward", roomNumber: "GW-101", bedNumber: "101", bedType: "Standard", status: "available", dailyRate: 500000 },
        { ward: "VIP", roomNumber: "VIP-001", bedNumber: "001", bedType: "VIP", status: "occupied", dailyRate: 1500000 },
    ];
    await Bed.create(beds);
    console.log("✅ Beds seeded");
  }

  async seedSchedules() {
    const doctors = await Doctor.find();
    const polyclinics = await Polyclinic.find();
    if (doctors.length === 0 || polyclinics.length === 0) return;
    const schedules = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
        const scheduleDate = new Date(today);
        scheduleDate.setDate(today.getDate() + i);
        if (scheduleDate.getDay() === 0) continue;
        for (const doctor of doctors) {
            const polyclinic = polyclinics.find(p => p.name.includes(doctor.specialization.split(' ')[1] || 'Umum'));
            if(polyclinic) schedules.push({ doctorId: doctor._id, polyclinicId: polyclinic._id, date: scheduleDate, startTime: "08:00", endTime: "15:00", totalSlots: 20, bookedSlots: 0, availableSlots: 20, status: "Active"});
        }
    }
    await Schedule.create(schedules.map(s => ({...s, scheduleId: ModelHelpers.generateScheduleId() })));
    console.log("✅ Schedules seeded");
  }

  async seedQueues() {
    const schedules = await Schedule.find({ date: { $gte: new Date().setHours(0,0,0,0) } }).limit(2);
    const patients = await Patient.find();
    if(schedules.length === 0 || patients.length === 0) return;
    const queues = [];
    for(const schedule of schedules) {
      for (let i = 0; i < 3; i++) {
          if(!patients[i]) continue;
          queues.push({ patientId: patients[i]._id, doctorId: schedule.doctorId, polyclinicId: schedule.polyclinicId, scheduleId: schedule._id, queueNumber: i + 1, queueDate: schedule.date, status: "Waiting" });
      }
    }
    await Queue.create(queues.map(q => ({...q, queueId: ModelHelpers.generateQueueId() })));
    console.log("✅ Queues seeded");
  }

  async seedVisits() {
    const patients = await Patient.find();
    const doctors = await Doctor.find();
    const polyclinics = await Polyclinic.find();
    
    if (patients.length === 0 || doctors.length === 0 || polyclinics.length === 0) {
        console.log("⚠️ Skipping visit seeding due to missing patient, doctor, or polyclinic data.");
        return;
    }

    const visits = [];
    for (let i = 0; i < 15; i++) {
      const randomPatient = patients[Math.floor(Math.random() * patients.length)];
      const randomDoctor = doctors[Math.floor(Math.random() * doctors.length)];
      const randomPolyclinic = polyclinics[Math.floor(Math.random() * polyclinics.length)];

      visits.push({
        patientId: randomPatient._id,
        doctorId: randomDoctor._id,
        polyclinicId: randomPolyclinic._id,
        visitDate: new Date(),
        visitType: "Consultation",
        status: "Completed",
        chiefComplaint: "Konsultasi rutin.",
        diagnosis: { primary: "Observasi" },
        treatment: "Tidak ada tindakan khusus.",
        prescription: [{ 
            medication: "Vitamin D3 1000 IU", 
            dosage: "1x1", 
            frequency: "Sehari", 
            duration: "30 hari" 
        }],
        totalCost: 250000,
        paymentStatus: "Paid",
      });
    }

    await Visit.create(visits.map(v => ({...v, visitId: ModelHelpers.generateVisitId() })));
    console.log("✅ Visits seeded");
  }
}

// Hapus fungsi runSeeder() yang lama
// gantikan dengan blok kondisional di bawah

// -- PERBAIKAN UTAMA --
// Blok ini memastikan kode hanya berjalan saat dipanggil via `npm run seed`
if (require.main === module) {
  const seeder = new EnhancedDataSeeder();
  seeder.seedAll().catch(error => {
    console.error("❌ Seeding script failed to run:", error);
    process.exit(1);
  });
}