import React, { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  User, 
  Activity, 
  Download,
  Search,
  Filter,
  TrendingUp,
  Heart,
  Thermometer,
  Weight,
  Zap
} from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import MedicalRecordCard from '../components/MedicalRecordCard';
import HealthTrendChart from '../components/charts/HealthTrendChart';
import HealthMetricsChart from '../components/charts/HealthMetricsChart';

interface MedicalRecord {
  id: string;
  patientId: string;
  visitDate: string;
  doctorName: string;
  diagnosis: string;
  treatments: string[];
  prescriptions: string[];
  labResults?: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    weight: string;
  };
  notes?: string;
}

const MedicalRecords: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('date');
  const [selectedMetric, setSelectedMetric] = useState<'bloodPressure' | 'heartRate' | 'weight'>('bloodPressure');

  // Enhanced medical records with lab results
  const medicalRecords: MedicalRecord[] = [
    {
      id: '1',
      patientId: '1',
      visitDate: '2024-01-15',
      doctorName: 'Dr. Sarah Johnson',
      diagnosis: 'Hypertension',
      treatments: ['Lifestyle modifications', 'Blood pressure monitoring', 'Regular exercise program'],
      prescriptions: ['Lisinopril 10mg daily', 'Hydrochlorothiazide 25mg daily'],
      labResults: {
        bloodPressure: '140/90',
        heartRate: '78 bpm',
        temperature: '36.5°C',
        weight: '75 kg'
      },
      notes: 'Patient shows improvement with medication. Continue current treatment plan and schedule follow-up in 3 months.'
    },
    {
      id: '2',
      patientId: '1',
      visitDate: '2024-01-05',
      doctorName: 'Dr. Michael Chen',
      diagnosis: 'Tension headaches',
      treatments: ['Stress management techniques', 'Physical therapy', 'Relaxation exercises'],
      prescriptions: ['Ibuprofen 400mg as needed', 'Magnesium supplement 200mg daily'],
      labResults: {
        bloodPressure: '125/80',
        heartRate: '72 bpm',
        temperature: '36.8°C',
        weight: '74.5 kg'
      },
      notes: 'Headaches likely stress-related. Recommend stress reduction techniques and regular sleep schedule.'
    },
    {
      id: '3',
      patientId: '1',
      visitDate: '2023-12-20',
      doctorName: 'Dr. Emily Rodriguez',
      diagnosis: 'Annual physical examination',
      treatments: ['Routine screening', 'Vaccinations', 'Health counseling'],
      prescriptions: ['Multivitamin daily', 'Vitamin D3 1000IU daily'],
      labResults: {
        bloodPressure: '120/75',
        heartRate: '68 bpm',
        temperature: '36.6°C',
        weight: '74 kg'
      },
      notes: 'Overall health is good. Continue healthy lifestyle habits. Next annual checkup scheduled.'
    },
    {
      id: '4',
      patientId: '1',
      visitDate: '2023-11-10',
      doctorName: 'Dr. James Wilson',
      diagnosis: 'Diabetes Type 2 - Follow up',
      treatments: ['Blood glucose monitoring', 'Dietary counseling', 'Exercise program'],
      prescriptions: ['Metformin 500mg twice daily', 'Glucose test strips'],
      labResults: {
        bloodPressure: '130/85',
        heartRate: '75 bpm',
        temperature: '36.4°C',
        weight: '76 kg'
      },
      notes: 'Blood sugar levels improving with medication and lifestyle changes. Continue current management plan.'
    }
  ];

  // Sample health trend data
  const healthTrendData = [
    { date: '2023-11', bloodPressureSystolic: 130, bloodPressureDiastolic: 85, heartRate: 75, weight: 76 },
    { date: '2023-12', bloodPressureSystolic: 120, bloodPressureDiastolic: 75, heartRate: 68, weight: 74 },
    { date: '2024-01', bloodPressureSystolic: 125, bloodPressureDiastolic: 80, heartRate: 72, weight: 74.5 },
    { date: '2024-01', bloodPressureSystolic: 140, bloodPressureDiastolic: 90, heartRate: 78, weight: 75 },
  ];

  // Health metrics data for charts
  const diagnosisData = [
    { name: 'Hypertension', value: 1, color: '#ef4444' },
    { name: 'Headaches', value: 1, color: '#f59e0b' },
    { name: 'Diabetes', value: 1, color: '#8b5cf6' },
    { name: 'Routine Checkup', value: 1, color: '#10b981' }
  ];

  const visitFrequencyData = [
    { name: 'Jan 2024', value: 2 },
    { name: 'Dec 2023', value: 1 },
    { name: 'Nov 2023', value: 1 },
    { name: 'Oct 2023', value: 0 },
    { name: 'Sep 2023', value: 1 }
  ];

  const filteredRecords = medicalRecords
    .filter(record => 
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime();
      }
      return a.diagnosis.localeCompare(b.diagnosis);
    });

  const toggleRecord = (recordId: string) => {
    setExpandedRecord(expandedRecord === recordId ? null : recordId);
  };

  // Calculate health statistics
  const totalVisits = medicalRecords.length;
  const uniqueDoctors = new Set(medicalRecords.map(r => r.doctorName)).size;
  const totalPrescriptions = medicalRecords.reduce((acc, record) => acc + record.prescriptions.length, 0);
  const recentVisit = medicalRecords.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())[0];

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text mb-4">Medical Records</h1>
          <p className="text-lg text-text-light">Your complete medical history and health analytics</p>
        </div>

        {/* Health Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="text-center">
            <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-text mb-1">{totalVisits}</div>
            <div className="text-text-light">Total Visits</div>
          </Card>

          <Card className="text-center">
            <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-text mb-1">{uniqueDoctors}</div>
            <div className="text-text-light">Doctors Consulted</div>
          </Card>

          <Card className="text-center">
            <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-text mb-1">{totalPrescriptions}</div>
            <div className="text-text-light">Prescriptions</div>
          </Card>

          <Card className="text-center">
            <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-text mb-1">
              {recentVisit ? new Date(recentVisit.visitDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
            </div>
            <div className="text-text-light">Last Visit</div>
          </Card>
        </div>

        {/* Health Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Health Trends Chart */}
          <div className="lg:col-span-2">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text flex items-center">
                  <TrendingUp className="h-6 w-6 mr-2 text-primary" />
                  Health Trends
                </h2>
                <div className="flex space-x-2">
                  <Button
                    variant={selectedMetric === 'bloodPressure' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('bloodPressure')}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    BP
                  </Button>
                  <Button
                    variant={selectedMetric === 'heartRate' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('heartRate')}
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    HR
                  </Button>
                  <Button
                    variant={selectedMetric === 'weight' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedMetric('weight')}
                  >
                    <Weight className="h-4 w-4 mr-1" />
                    Weight
                  </Button>
                </div>
              </div>
              <HealthTrendChart data={healthTrendData} metric={selectedMetric} />
            </Card>
          </div>

          {/* Health Metrics */}
          <div className="space-y-6">
            <HealthMetricsChart
              type="pie"
              data={diagnosisData}
              title="Diagnosis Distribution"
            />
          </div>
        </div>

        {/* Visit Frequency Chart */}
        <div className="mb-8">
          <HealthMetricsChart
            type="bar"
            data={visitFrequencyData}
            title="Visit Frequency (Last 5 Months)"
          />
        </div>

        {/* Search and Filter */}
        <Card className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-text-light" />
              <input
                type="text"
                placeholder="Search by diagnosis or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="date">Sort by Date</option>
                <option value="diagnosis">Sort by Diagnosis</option>
              </select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </Card>

        {/* Medical Records List */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-text">Medical History</h2>
          {filteredRecords.map((record) => (
            <MedicalRecordCard
              key={record.id}
              record={record}
              isExpanded={expandedRecord === record.id}
              onToggle={() => toggleRecord(record.id)}
            />
          ))}
        </div>

        {/* No Records */}
        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-text mb-2">No records found</h3>
            <p className="text-text-light">
              {searchTerm ? 'Try adjusting your search terms' : 'Your medical records will appear here'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalRecords;