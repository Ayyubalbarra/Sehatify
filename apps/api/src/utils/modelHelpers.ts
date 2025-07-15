// Helper functions for validation and utility
export const generateId = (prefix = "ID"): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 5);
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
  const now = new Date();
  const year = now.getFullYear().toString().substring(2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
  return `MR${year}${month}${random}`;
};

export const validatePhoneNumber = (phone: string): boolean => {
  // PERBAIKAN: Menambahkan pengecekan tipe untuk keamanan
  if (typeof phone !== 'string') return false;
  // Regex sedikit dilonggarkan untuk mencakup lebih banyak variasi nomor
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{7,11}$/; 
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const validateEmail = (email: string): boolean => {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateNIK = (nik: string): boolean => {
  // PERBAIKAN: Menggunakan `!!` untuk memastikan nilai yang dikembalikan selalu boolean
  return !!(nik && nik.length === 16 && /^\d+$/.test(nik));
};

export const calculateAge = (dateOfBirth: Date | string): number => {
  const birthDate = new Date(dateOfBirth);
  // PERBAIKAN: Menambahkan penanganan jika tanggal tidak valid
  if (isNaN(birthDate.getTime())) return 0; 

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const formatDateIndonesia = (date: Date | string): string => {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
};

export const calculateEstimatedWaitTime = (queueNumber: number, priority = "Normal"): number => {
  const baseConsultationTime = 15; // menit
  const priorityMultiplier = priority === "Emergency" ? 0.5 : 1.0;
  return Math.max(0, Math.round((queueNumber - 1) * baseConsultationTime * priorityMultiplier));
};

export const determineStockStatus = (currentStock: number, minimumStock: number): 'Available' | 'Low Stock' | 'Out of Stock' => {
  if (currentStock <= 0) return "Out of Stock";
  if (currentStock <= minimumStock) return "Low Stock";
  return "Available";
};

export const calculateBMI = (weight: number, height: number): number | null => {
  if (!weight || !height || height <= 0) return null;
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
};

export const getBMICategory = (bmi: number | null): string => {
  if (bmi === null) return "Unknown";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency", currency: "IDR", minimumFractionDigits: 0,
  }).format(amount);
};

export const sanitizeInput = (input: any): string => {
  // PERBAIKAN: Selalu mengembalikan string untuk keamanan tipe
  if (typeof input !== "string") return "";
  return input.replace(/[<>&"']/g, "").trim();
};

export const validateDateRange = (startDate: Date | string, endDate: Date | string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const generatePaginationInfo = (page: string | number, limit: string | number, total: number) => {
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

export const calculateConsultationFee = (visitType: string, doctorSpecialization: string): number => {
  const baseFees: { [key: string]: number } = {
    "General Consultation": 150000,
    "Follow Up": 100000,
    "Emergency": 300000,
    "Specialist Consultation": 250000,
  };
  const specializationMultiplier = doctorSpecialization.toLowerCase().includes('spesialis') ? 1.5 : 1.0;
  const baseFee = baseFees[visitType] || baseFees["General Consultation"];
  return Math.round(baseFee * specializationMultiplier);
};

export const isTimeSlotAvailable = (startTime: string, endTime: string, existingSlots: { startTime: string; endTime: string }[]): boolean => {
  const start = new Date(`1970-01-01T${startTime}:00`);
  const end = new Date(`1970-01-01T${endTime}:00`);

  return !existingSlots.some((slot) => {
    const slotStart = new Date(`1970-01-01T${slot.startTime}:00`);
    const slotEnd = new Date(`1970-01-01T${slot.endTime}:00`);
    return start < slotEnd && end > slotStart;
  });
};

export const generateReportFilename = (reportType: string): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `${reportType}_Report_${timestamp}.pdf`;
};