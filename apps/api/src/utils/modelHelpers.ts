// Helper functions for validation and utility
export const generateId = (prefix: string = "ID"): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}${timestamp}${random}`.toUpperCase();
};

export const generatePatientId = (): string => generateId("PAT");
export const generateDoctorId = (): string => generateId("DOC");
export const generateScheduleId = (): string => generateId("SCH");
export const generateQueueId = (): string => generateId("QUE");
export const generateVisitId = (): string => generateId("VIS");
export const generateItemId = (): string => generateId("ITM");
export const generateBedId = (): string => generateId("BED");
export const generatePolyclinicId = (): string => generateId("POL");
export const generateMedicalRecordNumber = (): string => {
  const year = new Date().getFullYear().toString().substr(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  return `MR${year}${month}${random}`;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[\S]+@[\S]+\.[\S]+$/;
  return emailRegex.test(email);
};

export const validateNIK = (nik: string): boolean => {
  return nik && nik.length === 16 && /^\d+$/.test(nik);
};

export const calculateAge = (dateOfBirth: Date | string): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export const formatDateIndonesia = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDate = (date: Date | string, includeTime: boolean = false): string => {
  const options: Intl.DateTimeFormatOptions = {
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

export const calculateEstimatedWaitTime = (queueNumber: number, priority: string = "Normal", polyclinicId?: string): number => {
  const baseConsultationTime = 15;
  const priorityMultipliers: { [key: string]: number } = {
    Emergency: 0.5,
    Urgent: 0.7,
    Normal: 1.0,
    "Non-Urgent": 1.2,
  };
  const polyclinicMultipliers: { [key: string]: number } = {
    default: 1.0,
  };

  const priorityMultiplier = priorityMultipliers[priority] || 1.0;
  const polyclinicMultiplier = polyclinicMultipliers[polyclinicId || "default"] || polyclinicMultipliers.default;

  const estimatedTime = Math.round(
    (queueNumber - 1) * baseConsultationTime * priorityMultiplier * polyclinicMultiplier,
  );

  return Math.max(0, estimatedTime);
};

export const determineStockStatus = (currentStock: number, minimumStock: number): string => {
  if (currentStock === 0) return "Out of Stock";
  if (currentStock <= minimumStock) return "Low Stock";
  return "Available";
};

export const calculateOccupancyRate = (occupancyHistory: any[]): number => {
  if (!occupancyHistory || occupancyHistory.length === 0) return 0;

  const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentOccupancy = occupancyHistory.filter((record) => new Date(record.admissionDate) >= last30Days);

  if (recentOccupancy.length === 0) return 0;

  const totalDays = recentOccupancy.reduce((sum, record) => {
    const discharge = record.dischargeDate || new Date();
    const admission = new Date(record.admissionDate);
    const days = Math.ceil((discharge.getTime() - admission.getTime()) / (1000 * 60 * 60 * 24));
    return sum + days;
  }, 0);

  return Math.round((totalDays / 30) * 100);
};

export const calculateBMI = (weight: number, height: number): number | null => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

export const getBMICategory = (bmi: number | null): string => {
  if (!bmi) return "Unknown";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

export const sanitizeInput = (input: string): string => {
  if (typeof input !== "string") return input;
  return input.replace(/[<>]/g, "").trim();
};

export const validateDateRange = (startDate: Date | string, endDate: Date | string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end && start <= new Date();
};

export const generatePaginationInfo = (page: string | number, limit: string | number, total: number) => {
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

export const calculateConsultationFee = (visitType: string, doctorSpecialization: string): number => {
  const baseFees: { [key: string]: number } = {
    "General Consultation": 150000,
    "Follow Up": 100000,
    Emergency: 300000,
    "Specialist Consultation": 250000,
  };

  const specializationMultipliers: { [key: string]: number } = {
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

export const isTimeSlotAvailable = (startTime: string, endTime: string, existingSlots: { startTime: string; endTime: string }[]): boolean => {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  return !existingSlots.some((slot) => {
    const slotStart = new Date(`1970-01-01T${slot.startTime}:00`);
    const slotEnd = new Date(`1970-01-01T${slot.endTime}:00`);

    return (
      (start >= slotStart && start < slotEnd) ||
      (end > slotStart && end <= slotEnd) ||
      (start <= slotStart && end >= slotEnd)
    );
  });
};

export const generateReportFilename = (reportType: string, startDate: Date | string, endDate: Date | string): string => {
  const start = new Date(startDate).toISOString().split("T")[0];
  const end = new Date(endDate).toISOString().split("T")[0];
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("T")[0];

  return `${reportType}_${start}_to_${end}_${timestamp}.pdf`;
};