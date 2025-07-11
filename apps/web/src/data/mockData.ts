import { Doctor, Hospital, Article, MedicalRecord } from '../types';

export const hospitals: Hospital[] = [
  {
    id: '1',
    name: 'HealthCare Plus Medical Center',
    address: '123 Medical Drive, Downtown',
    phone: '(555) 123-4567',
    departments: ['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Emergency']
  },
  {
    id: '2',
    name: 'City General Hospital',
    address: '456 Hospital Ave, Midtown',
    phone: '(555) 987-6543',
    departments: ['Surgery', 'Internal Medicine', 'Radiology', 'Oncology', 'Psychiatry']
  },
  {
    id: '3',
    name: 'Wellness Medical Center',
    address: '789 Health Blvd, Uptown',
    phone: '(555) 456-7890',
    departments: ['Dermatology', 'Gynecology', 'Ophthalmology', 'ENT', 'Gastroenterology']
  }
];

export const doctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiology',
    photo: 'https://images.pexels.com/photos/5327921/pexels-photo-5327921.jpeg?auto=compress&cs=tinysrgb&w=300',
    schedule: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
    rating: 4.8,
    experience: 12
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialization: 'Neurology',
    photo: 'https://images.pexels.com/photos/5327580/pexels-photo-5327580.jpeg?auto=compress&cs=tinysrgb&w=300',
    schedule: ['10:00 AM', '1:00 PM', '3:00 PM', '5:00 PM'],
    rating: 4.9,
    experience: 15
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialization: 'Pediatrics',
    photo: 'https://images.pexels.com/photos/5327656/pexels-photo-5327656.jpeg?auto=compress&cs=tinysrgb&w=300',
    schedule: ['8:00 AM', '10:00 AM', '1:00 PM', '3:00 PM'],
    rating: 4.7,
    experience: 8
  },
  {
    id: '4',
    name: 'Dr. David Wilson',
    specialization: 'Orthopedics',
    photo: 'https://images.pexels.com/photos/5327647/pexels-photo-5327647.jpeg?auto=compress&cs=tinysrgb&w=300',
    schedule: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
    rating: 4.6,
    experience: 10
  }
];

export const articles: Article[] = [
  {
    id: '1',
    title: 'Understanding Heart Health: Prevention and Care',
    summary: 'Learn about maintaining cardiovascular health through lifestyle changes and regular check-ups.',
    content: 'Heart disease remains one of the leading causes of death worldwide. However, many heart conditions can be prevented through proper lifestyle choices and regular medical care...',
    image: 'https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Cardiology',
    publishDate: '2024-01-15',
    author: 'Dr. Sarah Johnson'
  },
  {
    id: '2',
    title: 'Mental Health Awareness: Breaking the Stigma',
    summary: 'Exploring the importance of mental health and creating supportive environments for healing.',
    content: 'Mental health is just as important as physical health, yet it often carries a stigma that prevents people from seeking help...',
    image: 'https://images.pexels.com/photos/3768131/pexels-photo-3768131.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Mental Health',
    publishDate: '2024-01-10',
    author: 'Dr. Rachel Green'
  },
  {
    id: '3',
    title: 'Nutrition for Optimal Health',
    summary: 'Discover how proper nutrition can improve your overall well-being and prevent disease.',
    content: 'Good nutrition is fundamental to good health. The foods we eat provide the energy and nutrients our bodies need to function properly...',
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Nutrition',
    publishDate: '2024-01-05',
    author: 'Dr. James Miller'
  },
  {
    id: '4',
    title: 'Exercise and Physical Fitness',
    summary: 'Learn about the benefits of regular exercise and how to create a sustainable fitness routine.',
    content: 'Regular physical activity is one of the most important things you can do for your health. It can help control your weight, reduce your risk of heart disease...',
    image: 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=600',
    category: 'Fitness',
    publishDate: '2024-01-01',
    author: 'Dr. Lisa Thompson'
  }
];

export const medicalRecords: MedicalRecord[] = [
  {
    id: '1',
    patientId: '1',
    visitDate: '2024-01-15',
    doctorName: 'Dr. Sarah Johnson',
    diagnosis: 'Hypertension',
    treatments: ['Lifestyle modifications', 'Blood pressure monitoring'],
    prescriptions: ['Lisinopril 10mg daily', 'Hydrochlorothiazide 25mg daily']
  },
  {
    id: '2',
    patientId: '1',
    visitDate: '2024-01-05',
    doctorName: 'Dr. Michael Chen',
    diagnosis: 'Tension headaches',
    treatments: ['Stress management techniques', 'Physical therapy'],
    prescriptions: ['Ibuprofen 400mg as needed']
  },
  {
    id: '3',
    patientId: '1',
    visitDate: '2023-12-20',
    doctorName: 'Dr. Emily Rodriguez',
    diagnosis: 'Annual physical exam',
    treatments: ['Routine screening', 'Vaccinations'],
    prescriptions: ['Multivitamin daily']
  }
];