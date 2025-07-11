"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateReportFilename = exports.isTimeSlotAvailable = exports.calculateConsultationFee = exports.generatePaginationInfo = exports.validateDateRange = exports.sanitizeInput = exports.formatCurrency = exports.getBMICategory = exports.calculateBMI = exports.calculateOccupancyRate = exports.determineStockStatus = exports.calculateEstimatedWaitTime = exports.formatDate = exports.formatDateIndonesia = exports.calculateAge = exports.validateNIK = exports.validateEmail = exports.validatePhoneNumber = exports.generateMedicalRecordNumber = exports.generatePolyclinicId = exports.generateBedId = exports.generateItemId = exports.generateVisitId = exports.generateQueueId = exports.generateScheduleId = exports.generateDoctorId = exports.generatePatientId = exports.generateId = void 0;
// Helper functions for validation and utility
const generateId = (prefix = "ID") => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
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
    const year = new Date().getFullYear().toString().substr(-2);
    const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
    return `MR${year}${month}${random}`;
};
exports.generateMedicalRecordNumber = generateMedicalRecordNumber;
const validatePhoneNumber = (phone) => {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
};
exports.validatePhoneNumber = validatePhoneNumber;
const validateEmail = (email) => {
    const emailRegex = /^[\S]+@[\S]+\.[\S]+$/;
    return emailRegex.test(email);
};
exports.validateEmail = validateEmail;
const validateNIK = (nik) => {
    return nik && nik.length === 16 && /^\d+$/.test(nik);
};
exports.validateNIK = validateNIK;
const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
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
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
};
exports.formatDateIndonesia = formatDateIndonesia;
const formatDate = (date, includeTime = false) => {
    const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Jakarta",
    };
    if (includeTime) {
        options.hour = "2-digit";
        options.minute = "2-digit";
    }
    return new Intl.DateTimeFormat("id-ID", options).format(new Date(date));
};
exports.formatDate = formatDate;
const calculateEstimatedWaitTime = (queueNumber, priority = "Normal", polyclinicId) => {
    const baseConsultationTime = 15;
    const priorityMultipliers = {
        Emergency: 0.5,
        Urgent: 0.7,
        Normal: 1.0,
        "Non-Urgent": 1.2,
    };
    const polyclinicMultipliers = {
        default: 1.0,
    };
    const priorityMultiplier = priorityMultipliers[priority] || 1.0;
    const polyclinicMultiplier = polyclinicMultipliers[polyclinicId || "default"] || polyclinicMultipliers.default;
    const estimatedTime = Math.round((queueNumber - 1) * baseConsultationTime * priorityMultiplier * polyclinicMultiplier);
    return Math.max(0, estimatedTime);
};
exports.calculateEstimatedWaitTime = calculateEstimatedWaitTime;
const determineStockStatus = (currentStock, minimumStock) => {
    if (currentStock === 0)
        return "Out of Stock";
    if (currentStock <= minimumStock)
        return "Low Stock";
    return "Available";
};
exports.determineStockStatus = determineStockStatus;
const calculateOccupancyRate = (occupancyHistory) => {
    if (!occupancyHistory || occupancyHistory.length === 0)
        return 0;
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentOccupancy = occupancyHistory.filter((record) => new Date(record.admissionDate) >= last30Days);
    if (recentOccupancy.length === 0)
        return 0;
    const totalDays = recentOccupancy.reduce((sum, record) => {
        const discharge = record.dischargeDate || new Date();
        const admission = new Date(record.admissionDate);
        const days = Math.ceil((discharge.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24));
        return sum + days;
    }, 0);
    return Math.round((totalDays / 30) * 100);
};
exports.calculateOccupancyRate = calculateOccupancyRate;
const calculateBMI = (weight, height) => {
    if (!weight || !height)
        return null;
    const heightInMeters = height / 100;
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};
exports.calculateBMI = calculateBMI;
const getBMICategory = (bmi) => {
    if (!bmi)
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
        style: "currency",
        currency: "IDR",
    }).format(amount);
};
exports.formatCurrency = formatCurrency;
const sanitizeInput = (input) => {
    if (typeof input !== "string")
        return input;
    return input.replace(/[<>]/g, "").trim();
};
exports.sanitizeInput = sanitizeInput;
const validateDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start <= end && start <= new Date();
};
exports.validateDateRange = validateDateRange;
const generatePaginationInfo = (page, limit, total) => {
    const currentPage = Number.parseInt(page.toString()) || 1;
    const itemsPerPage = Number.parseInt(limit.toString()) || 10;
    const totalPages = Math.ceil(total / itemsPerPage);
    return {
        currentPage,
        totalPages,
        totalItems: total,
        itemsPerPage,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
    };
};
exports.generatePaginationInfo = generatePaginationInfo;
const calculateConsultationFee = (visitType, doctorSpecialization) => {
    const baseFees = {
        "General Consultation": 150000,
        "Follow Up": 100000,
        Emergency: 300000,
        "Specialist Consultation": 250000,
    };
    const specializationMultipliers = {
        "General Practitioner": 1.0,
        "Internal Medicine": 1.5,
        Pediatrics: 1.3,
        Cardiology: 2.0,
        Neurology: 2.2,
        Orthopedics: 1.8,
        Dermatology: 1.4,
        Psychiatry: 1.6,
    };
    const baseFee = baseFees[visitType] || baseFees["General Consultation"];
    const multiplier = specializationMultipliers[doctorSpecialization] || 1.0;
    return Math.round(baseFee * multiplier);
};
exports.calculateConsultationFee = calculateConsultationFee;
const isTimeSlotAvailable = (startTime, endTime, existingSlots) => {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    return !existingSlots.some((slot) => {
        const slotStart = new Date(`1970-01-01T${slot.startTime}:00`);
        const slotEnd = new Date(`1970-01-01T${slot.endTime}:00`);
        return ((start >= slotStart && start < slotEnd) ||
            (end > slotStart && end <= slotEnd) ||
            (start <= slotStart && end >= slotEnd));
    });
};
exports.isTimeSlotAvailable = isTimeSlotAvailable;
const generateReportFilename = (reportType, startDate, endDate) => {
    const start = new Date(startDate).toISOString().split("T")[0];
    const end = new Date(endDate).toISOString().split("T")[0];
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];
    return `${reportType}_${start}_to_${end}_${timestamp}.pdf`;
};
exports.generateReportFilename = generateReportFilename;
