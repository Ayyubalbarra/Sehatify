"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_1 = __importDefault(require("../config/database"));
const Patient_1 = __importDefault(require("../models/Patient"));
const Doctor_1 = __importDefault(require("../models/Doctor"));
const Polyclinic_1 = __importDefault(require("../models/Polyclinic"));
const Schedule_1 = __importDefault(require("../models/Schedule"));
const Queue_1 = __importDefault(require("../models/Queue"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const Bed_1 = __importDefault(require("../models/Bed"));
const Visit_1 = __importDefault(require("../models/Visit"));
const User_1 = __importDefault(require("../models/User"));
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
class EnhancedDataSeeder {
    async seedAll() {
        try {
            console.log("🌱 Starting enhanced database seeding...");
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
        }
        catch (error) {
            console.error("❌ Error seeding database:", error);
            throw error;
        }
    }
    async createAdminUser() {
        try {
            const existingAdmin = await User_1.default.findOne({ email: "admin@sehatify.com" });
            if (!existingAdmin) {
                console.log("Mencoba membuat admin baru...");
                const adminUser = new User_1.default({
                    name: "Administrator",
                    email: "admin@sehatify.com",
                    password: "admin123",
                    role: "admin"
                });
                await adminUser.save();
                console.log("✅ Admin user created with the correct hash!");
            }
            else {
                console.log("✅ Admin user already exists");
            }
        }
        catch (error) {
            console.error("❌ Error creating admin user:", error);
        }
    }
    async clearAllData() {
        console.log("🗑️ Clearing existing data...");
        await Promise.all([
            Visit_1.default.deleteMany({}),
            Queue_1.default.deleteMany({}),
            Schedule_1.default.deleteMany({}),
            Bed_1.default.deleteMany({}),
            Inventory_1.default.deleteMany({}),
            Patient_1.default.deleteMany({}),
            Doctor_1.default.deleteMany({}),
            Polyclinic_1.default.deleteMany({}),
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
        await Polyclinic_1.default.create(polyclinics.map(p => ({ ...p, polyclinicId: ModelHelpers.generatePolyclinicId(), description: `Pelayanan ${p.name}`, isActive: true })));
        console.log("✅ Polyclinics seeded");
    }
    async seedDoctors() {
        const doctors = [
            { employeeId: "EMP-001", name: "Dr. Ahmad Wijaya", specialization: "Umum", title: "dr." },
            { employeeId: "EMP-002", name: "Dr. Sarah Putri, Sp.JP", specialization: "Spesialis Jantung", title: "dr. Sp.JP" },
            { employeeId: "EMP-003", name: "Dr. Budi Santoso, Sp.A", specialization: "Spesialis Anak", title: "dr. Sp.A" },
            { employeeId: "EMP-004", name: "Dr. Lisa Maharani, Sp.M", specialization: "Spesialis Mata", title: "dr. Sp.M" },
        ];
        await Doctor_1.default.create(doctors.map(d => ({ ...d, doctorId: ModelHelpers.generateDoctorId(), licenseNumber: `STR${d.employeeId}`, joinDate: new Date(), phone: '08123456789', email: `${d.name.split(' ')[1].toLowerCase()}@sehatify.com`, status: 'Active' })));
        console.log("✅ Doctors seeded");
    }
    async seedPatients() {
        const patients = [
            { nik: "3201234567890001", name: "Andi Pratama", gender: "Laki-laki" },
            { nik: "3201234567890002", name: "Sari Dewi", gender: "Perempuan" },
            { nik: "3201234567890003", name: "Rudi Hermawan", gender: "Laki-laki" },
        ];
        await Patient_1.default.create(patients.map(p => ({ ...p, patientId: ModelHelpers.generatePatientId(), dateOfBirth: new Date("1990-01-01"), phone: '08123456789', address: 'Jl. Sehat No. 1', emergencyContact: { name: 'Keluarga', relationship: 'Keluarga', phone: '08123456789' } })));
        console.log("✅ Patients seeded");
    }
    async seedInventory() {
        const inventoryItems = [
            { name: "Paracetamol 500mg", category: "Obat", unit: "tablet", unitPrice: 500 },
            { name: "Syringe 5ml", category: "Alat Medis", unit: "pcs", unitPrice: 2500 },
            { name: "Amoxicillin 500mg", category: "Obat", unit: "tablet", unitPrice: 1200 },
            { name: "Masker Medis", category: "Alat Pelindung", unit: "pcs", unitPrice: 1500 },
        ];
        await Inventory_1.default.create(inventoryItems.map(i => ({ ...i, itemId: ModelHelpers.generateItemId(), currentStock: 500, minimumStock: 100, maximumStock: 2000, supplier: 'PT. Sehat Farma' })));
        console.log("✅ Inventory seeded");
    }
    async seedBeds() {
        const beds = [
            { ward: "ICU", roomNumber: "ICU-001", bedNumber: "001", bedType: "ICU", status: "available", dailyRate: 2000000 },
            { ward: "General Ward", roomNumber: "GW-101", bedNumber: "101", bedType: "Standard", status: "available", dailyRate: 500000 },
            { ward: "VIP", roomNumber: "VIP-001", bedNumber: "001", bedType: "VIP", status: "occupied", dailyRate: 1500000 },
        ];
        await Bed_1.default.create(beds);
        console.log("✅ Beds seeded");
    }
    async seedSchedules() {
        const doctors = await Doctor_1.default.find();
        const polyclinics = await Polyclinic_1.default.find();
        if (doctors.length === 0 || polyclinics.length === 0)
            return;
        const schedules = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const scheduleDate = new Date(today);
            scheduleDate.setDate(today.getDate() + i);
            if (scheduleDate.getDay() === 0)
                continue;
            for (const doctor of doctors) {
                const polyclinic = polyclinics.find(p => p.name.includes(doctor.specialization.split(' ')[1] || 'Umum'));
                if (polyclinic)
                    schedules.push({ doctorId: doctor._id, polyclinicId: polyclinic._id, date: scheduleDate, startTime: "08:00", endTime: "15:00", totalSlots: 20, bookedSlots: 0, availableSlots: 20, status: "Active" });
            }
        }
        await Schedule_1.default.create(schedules.map(s => ({ ...s, scheduleId: ModelHelpers.generateScheduleId() })));
        console.log("✅ Schedules seeded");
    }
    async seedQueues() {
        const schedules = await Schedule_1.default.find({ date: { $gte: new Date().setHours(0, 0, 0, 0) } }).limit(2);
        const patients = await Patient_1.default.find();
        if (schedules.length === 0 || patients.length === 0)
            return;
        const queues = [];
        for (const schedule of schedules) {
            for (let i = 0; i < 3; i++) {
                if (!patients[i])
                    continue;
                queues.push({ patientId: patients[i]._id, doctorId: schedule.doctorId, polyclinicId: schedule.polyclinicId, scheduleId: schedule._id, queueNumber: i + 1, queueDate: schedule.date, status: "Waiting" });
            }
        }
        await Queue_1.default.create(queues.map(q => ({ ...q, queueId: ModelHelpers.generateQueueId() })));
        console.log("✅ Queues seeded");
    }
    async seedVisits() {
        const patients = await Patient_1.default.find();
        const doctors = await Doctor_1.default.find();
        const polyclinics = await Polyclinic_1.default.find();
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
        await Visit_1.default.create(visits.map(v => ({ ...v, visitId: ModelHelpers.generateVisitId() })));
        console.log("✅ Visits seeded");
    }
}
async function runSeeder() {
    try {
        await database_1.default.connect();
        const seeder = new EnhancedDataSeeder();
        await seeder.seedAll();
    }
    catch (error) {
        // Error sudah dicatat di dalam seeder.seedAll() jika terjadi di sana
        // jadi tidak perlu log lagi kecuali untuk error koneksi
        console.error("Seeding script failed:", error);
    }
    finally {
        console.log("🔌 Disconnecting from database...");
        await database_1.default.disconnect();
    }
}
// Jalankan skrip
runSeeder();
