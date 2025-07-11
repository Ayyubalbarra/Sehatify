"use client"

import React, { useState, useEffect } from "react"
import { X, Save, User } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"


// --- PERBAIKAN 1: Definisikan dan ekspor tipe data yang jelas ---
export interface PatientFormData {
  patientId?: string;
  name: string;
  nik: string;
  dateOfBirth: string;
  gender: "Laki-laki" | "Perempuan";
  phone: string;
  email: string;
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
  };
  bloodType: string;
  allergies: string[];
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

interface PatientModalProps {
  patient?: Partial<PatientFormData>; // Gunakan Partial karena data mungkin tidak lengkap
  onClose: () => void;
  onSave: () => void;
}

const PatientModal: React.FC<PatientModalProps> = ({ patient, onClose, onSave }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PatientFormData>({
    name: "",
    nik: "",
    dateOfBirth: "",
    gender: "Laki-laki",
    phone: "",
    email: "",
    address: { street: "", city: "", province: "", postalCode: "" },
    bloodType: "",
    allergies: [],
    emergencyContact: { name: "", relationship: "", phone: "" },
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name || "",
        nik: patient.nik || "",
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split("T")[0] : "",
        gender: patient.gender || "Laki-laki",
        phone: patient.phone || "",
        email: patient.email || "",
        address: {
          street: patient.address?.street || "",
          city: patient.address?.city || "",
          province: patient.address?.province || "",
          postalCode: patient.address?.postalCode || "",
        },
        bloodType: patient.bloodType || "",
        allergies: patient.allergies || [],
        emergencyContact: {
          name: patient.emergencyContact?.name || "",
          relationship: patient.emergencyContact?.relationship || "",
          phone: patient.emergencyContact?.phone || "",
        },
      });
    }
  }, [patient]);

  const saveMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const url = patient?.patientId ? `/api/patients/${patient.patientId}` : "/api/patients";
      const method = patient?.patientId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyimpan data pasien");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(patient ? "Pasien berhasil diupdate" : "Pasien berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["patients"] }); // Refresh data tabel pasien
      onSave();
    },
    onError: (error: Error) => {
      toast.error(`Gagal: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  // --- PERBAIKAN 2: Gunakan logika update state yang aman ---
  const handleInputChange = (field: string, value: any) => {
    const nameParts = field.split(".");

    if (nameParts.length > 1) {
      const [parent, child] = nameParts as [keyof PatientFormData, string];
      setFormData((prev) => {
        const parentObject = prev[parent];
        const updatedParent =
          typeof parentObject === "object" && parentObject !== null
            ? { ...parentObject, [child]: value }
            : { [child]: value };
        return { ...prev, [parent]: updatedParent };
      });
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container large">
        <div className="modal-header">
          <div className="modal-title">
            <User size={24} />
            <h2>{patient ? "Edit Pasien" : "Tambah Pasien Baru"}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Seluruh elemen form Anda tidak perlu diubah. Saya hanya menyertakan satu contoh untuk kelengkapan. */}
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Lengkap *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            {/* ... Tambahkan semua input form Anda yang lain di sini ... */}
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="primary-btn" disabled={saveMutation.isPending}>
              <Save size={20} />
              {saveMutation.isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
