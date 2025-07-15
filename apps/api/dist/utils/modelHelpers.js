"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportFilename = exports.isTimeSlotAvailable = exports.calculateConsultationFee = exports.generatePaginationInfo = exports.validateDateRange = exports.sanitizeInput = exports.formatCurrency = exports.getBMICategory = exports.calculateBMI = exports.determineStockStatus = exports.calculateEstimatedWaitTime = exports.formatDateIndonesia = exports.calculateAge = exports.validateNIK = exports.validateEmail = exports.validatePhoneNumber = exports.generateMedicalRecordNumber = exports.generatePolyclinicId = exports.generateBedId = exports.generateItemId = exports.generateVisitId = exports.generateQueueId = exports.generateScheduleId = exports.generateDoctorId = exports.generatePatientId = exports.generateId = void 0;
// Helper functions for validation and utility
const generateId = (prefix = "ID") => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `${prefix}${timestamp}${random}`.toUpperCase();
};
exports.generateId = generateId;
const generatePatientId = () => (0, exports.generateId)("PAT");
exports.generatePatientId = generatePatientId;
const generateDoctorId = () => (0, exports.generateId)("DOC");
exports.generateDoctorId = generateDoctorId;
const generateScheduleId = () => (0, exports.generateId)("SCH");
exports.generateScheduleId = generateScheduleId;
const generateQueueId = () => (0, exports.generateId)("QUE");
exports.generateQueueId = generateQueueId;
const generateVisitId = () => (0, exports.generateId)("VIS");
exports.generateVisitId = generateVisitId;
const generateItemId = () => (0, exports.generateId)("ITM");
exports.generateItemId = generateItemId;
const generateBedId = () => (0, exports.generateId)("BED");
exports.generateBedId = generateBedId;
const generatePolyclinicId = () => (0, exports.generateId)("POL");
exports.generatePolyclinicId = generatePolyclinicId;
const generateMedicalRecordNumber = () => {
    const now = new Date();
    const year = now.getFullYear().toString().substring(2);
    const month = (now.getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return `MR${year}${month}${random}`;
};
exports.generateMedicalRecordNumber = generateMedicalRecordNumber;
const validatePhoneNumber = (phone) => {
    // PERBAIKAN: Menambahkan pengecekan tipe untuk keamanan
    if (typeof phone !== 'string')
        return false;
    // Regex sedikit dilonggarkan untuk mencakup lebih banyak variasi nomor
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
};
exports.validatePhoneNumber = validatePhoneNumber;
const validateEmail = (email) => {
    if (typeof email !== 'string')
        return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validateNIK = (nik) => {
    // PERBAIKAN: Menggunakan `!!` untuk memastikan nilai yang dikembalikan selalu boolean
    return !!(nik && nik.length === 16 && /^\d+$/.test(nik));
};
exports.validateNIK = validateNIK;
const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    // PERBAIKAN: Menambahkan penanganan jika tanggal tidak valid
    if (isNaN(birthDate.getTime()))
        return 0;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};
exports.calculateAge = calculateAge;
const formatDateIndonesia = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
    });
};
exports.formatDateIndonesia = formatDateIndonesia;
const calculateEstimatedWaitTime = (queueNumber, priority = "Normal") => {
    const baseConsultationTime = 15; // menit
    const priorityMultiplier = priority === "Emergency" ? 0.5 : 1.0;
    return Math.max(0, Math.round((queueNumber - 1) * baseConsultationTime * priorityMultiplier));
};
exports.calculateEstimatedWaitTime = calculateEstimatedWaitTime;
const determineStockStatus = (currentStock, minimumStock) => {
    if (currentStock <= 0)
        return "Out of Stock";
    if (currentStock <= minimumStock)
        return "Low Stock";
    return "Available";
};
exports.determineStockStatus = determineStockStatus;
const calculateBMI = (weight, height) => {
    if (!weight || !height || height <= 0)
        return null;
    const heightInMeters = height / 100;
    return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};
exports.calculateBMI = calculateBMI;
const getBMICategory = (bmi) => {
    if (bmi === null)
        return "Unknown";
    if (bmi < 18.5)
        return "Underweight";
    if (bmi < 25)
        return "Normal";
    if (bmi < 30)
        return "Overweight";
    return "Obese";
};
exports.getBMICategory = getBMICategory;
const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
        style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const sanitizeInput = (input) => {
    // PERBAIKAN: Selalu mengembalikan string untuk keamanan tipe
    if (typeof input !== "string")
        return "";
    return input.replace(/[<>&"']/g, "").trim();
};
exports.sanitizeInput = sanitizeInput;
const validateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end;
};
exports.validateDateRange = validateDateRange;
const generatePaginationInfo = (page, limit, total) => {
    const currentPage = Number(page) || 1;
    const itemsPerPage = Number(limit) || 10;
    const totalPages = Math.ceil(total / itemsPerPage);
    return {
        currentPage,
        totalPages,
        totalItems: total,
        itemsPerPage,
    };
};
exports.generatePaginationInfo = generatePaginationInfo;
const calculateConsultationFee = (visitType, doctorSpecialization) => {
    const baseFees = {
        "General Consultation": 150000,
        "Follow Up": 100000,
        "Emergency": 300000,
        "Specialist Consultation": 250000,
    };
    const specializationMultiplier = doctorSpecialization.toLowerCase().includes('spesialis') ? 1.5 : 1.0;
    const baseFee = baseFees[visitType] || baseFees["General Consultation"];
    return Math.round(baseFee * specializationMultiplier);
};
exports.calculateConsultationFee = calculateConsultationFee;
const isTimeSlotAvailable = (startTime, endTime, existingSlots) => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    return !existingSlots.some((slot) => {
        const slotStart = new Date(`1970-01-01T${slot.startTime}:00`);
        const slotEnd = new Date(`1970-01-01T${slot.endTime}:00`);
        return start < slotEnd && end > slotStart;
    });
};
exports.isTimeSlotAvailable = isTimeSlotAvailable;
const generateReportFilename = (reportType) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    return `${reportType}_Report_${timestamp}.pdf`;
};
exports.generateReportFilename = generateReportFilename;
