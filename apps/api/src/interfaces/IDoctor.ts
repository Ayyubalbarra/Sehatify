import { IUser } from './IUser';

export interface WorkSchedule {
  day: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Minggu';
  startTime: string; // Format "HH:mm"
  endTime: string;   // Format "HH:mm"
  isAvailable: boolean;
}

export interface Doctor extends IUser {
  specialization: string;
  licenseNumber: string;
  workSchedule?: WorkSchedule[];
}