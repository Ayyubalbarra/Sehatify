"use client"

import React, { useState, useEffect } from "react"
import { X, Save, Package } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

// --- PERBAIKAN 1: Definisikan tipe data yang jelas ---
interface InventoryFormData {
  itemId?: string; // Opsional, hanya ada saat edit
  name: string;
  category: string;
  subcategory: string;
  description: string;
  brand: string;
  manufacturer: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  unit: string;
  unitPrice: number;
  expiryDate: string;
  batchNumber: string;
  location: {
    warehouse: string;
    shelf: string;
    section: string;
  };
  supplier: {
    name: string;
    contact: string;
    email: string;
    leadTime: number;
  };
}

interface InventoryModalProps {
  item?: Partial<InventoryFormData>; // Gunakan Partial karena item mungkin tidak lengkap
  onClose: () => void;
  onSave: () => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ item, onClose, onSave }) => {
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<InventoryFormData>({
    name: "",
    category: "Obat",
    subcategory: "",
    description: "",
    brand: "",
    manufacturer: "",
    currentStock: 0,
    minimumStock: 10,
    maximumStock: 1000,
    unit: "pcs",
    unitPrice: 0,
    expiryDate: "",
    batchNumber: "",
    location: { warehouse: "", shelf: "", section: "" },
    supplier: { name: "", contact: "", email: "", leadTime: 7 },
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category: item.category || "Obat",
        subcategory: item.subcategory || "",
        description: item.description || "",
        brand: item.brand || "",
        manufacturer: item.manufacturer || "",
        currentStock: item.currentStock || 0,
        minimumStock: item.minimumStock || 10,
        maximumStock: item.maximumStock || 1000,
        unit: item.unit || "pcs",
        unitPrice: item.unitPrice || 0,
        expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "",
        batchNumber: item.batchNumber || "",
        location: {
          warehouse: item.location?.warehouse || "",
          shelf: item.location?.shelf || "",
          section: item.location?.section || "",
        },
        supplier: {
          name: item.supplier?.name || "",
          contact: item.supplier?.contact || "",
          email: item.supplier?.email || "",
          leadTime: item.supplier?.leadTime || 7,
        },
      });
    }
  }, [item]);

  const saveMutation = useMutation({
    mutationFn: async (data: InventoryFormData) => {
      const url = item?.itemId ? `/api/inventory/${item.itemId}` : "/api/inventory";
      const method = item?.itemId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal menyimpan item");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success(item ? "Item berhasil diupdate" : "Item berhasil ditambahkan");
      queryClient.invalidateQueries({ queryKey: ["inventory"] }); // Refresh data tabel
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
  const handleInputChange = (field: string, value: string | number) => {
    const nameParts = field.split(".");

    if (nameParts.length > 1) {
      const [parent, child] = nameParts as [keyof InventoryFormData, string];
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
            <Package size={24} />
            <h2>{item ? "Edit Item" : "Tambah Item Baru"}</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* ... (Seluruh elemen form Anda tetap sama) ... */}
          <div className="form-grid">
            <div className="form-group">
              <label>Nama Item *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>
            {/* Tambahkan semua input form Anda yang lain di sini */}
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

export default InventoryModal;
