export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  profilePicture?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  photo: string;
  schedule: string[];
  rating: number;
  experience: number;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  departments: string[];
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  date: string;
  time: string;
  queueNumber: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

export interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  category: string;
  publishDate: string;
  author: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  visitDate: string;
  doctorName: string;
  diagnosis: string;
  treatments: string[];
  prescriptions: string[];
}

export interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}