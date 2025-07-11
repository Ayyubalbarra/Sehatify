import React from 'react';
import { 
  Calendar, 
  User, 
  Pill, 
  Activity, 
  FileText,
  ChevronDown,
  ChevronUp,
  Download,
  Share2
} from 'lucide-react';
import Button from './Button';

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

interface MedicalRecordCardProps {
  record: MedicalRecord;
  isExpanded: boolean;
  onToggle: () => void;
}

const MedicalRecordCard: React.FC<MedicalRecordCardProps> = ({ 
  record, 
  isExpanded, 
  onToggle 
}) => {
  const getDiagnosisColor = (diagnosis: string) => {
    const lowerDiagnosis = diagnosis.toLowerCase();
    if (lowerDiagnosis.includes('hypertension') || lowerDiagnosis.includes('high blood pressure')) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (lowerDiagnosis.includes('diabetes')) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (lowerDiagnosis.includes('headache') || lowerDiagnosis.includes('migraine')) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    if (lowerDiagnosis.includes('physical') || lowerDiagnosis.includes('checkup')) {
      return 'bg-green-100 text-green-800 border-green-200';
    }
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-3">
              <div className="bg-primary/10 rounded-full p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getDiagnosisColor(record.diagnosis)}`}>
                  {record.diagnosis}
                </div>
                <div className="flex items-center space-x-4 text-text-light text-sm mt-2">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(record.visitDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    {record.doctorName}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="ml-4"
          >
            {isExpanded ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-100 animate-fade-in">
          <div className="pt-6 space-y-6">
            {/* Lab Results */}
            {record.labResults && (
              <div>
                <h4 className="font-semibold text-text mb-3 flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-primary" />
                  Vital Signs & Lab Results
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                    <div className="text-sm text-red-600 font-medium">Blood Pressure</div>
                    <div className="text-lg font-bold text-red-700">{record.labResults.bloodPressure}</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <div className="text-sm text-blue-600 font-medium">Heart Rate</div>
                    <div className="text-lg font-bold text-blue-700">{record.labResults.heartRate}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                    <div className="text-sm text-green-600 font-medium">Temperature</div>
                    <div className="text-lg font-bold text-green-700">{record.labResults.temperature}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                    <div className="text-sm text-purple-600 font-medium">Weight</div>
                    <div className="text-lg font-bold text-purple-700">{record.labResults.weight}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Treatments */}
              <div>
                <h4 className="font-semibold text-text mb-3 flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-primary" />
                  Treatments
                </h4>
                <div className="space-y-2">
                  {record.treatments.map((treatment, index) => (
                    <div key={index} className="flex items-start bg-gray-50 rounded-lg p-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-text-light">{treatment}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescriptions */}
              <div>
                <h4 className="font-semibold text-text mb-3 flex items-center">
                  <Pill className="h-4 w-4 mr-2 text-primary" />
                  Prescriptions
                </h4>
                <div className="space-y-2">
                  {record.prescriptions.map((prescription, index) => (
                    <div key={index} className="flex items-start bg-primary/5 rounded-lg p-3 border border-primary/10">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-text-light">{prescription}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            {record.notes && (
              <div>
                <h4 className="font-semibold text-text mb-3">Doctor's Notes</h4>
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100">
                  <p className="text-text-light italic">{record.notes}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecordCard;