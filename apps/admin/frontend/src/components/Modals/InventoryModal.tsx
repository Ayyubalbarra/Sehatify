// apps/admin/frontend/src/components/Modals/InventoryModal.tsx

"use client"


import React, { useState, useEffect } from "react"
import { X, Save, Package, Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { inventoryAPI } from "../../services/api"
import type { InventoryItemData } from "../../types"
// Definisikan tipe data yang jelas sesuai dengan backend IInventory
// Ini adalah data yang akan dikirim/diterima dari API untuk create/update
export interface InventoryFormData {
  _id?: string; // Untuk item yang sudah ada
  itemId?: string; // Ini akan di-generate oleh backend saat create
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  unit: string;
  unitPrice: number;
  // PERBAIKAN: Menambahkan status di sini dan menjadikannya WAJIB
  status: 'Available' | 'Low Stock' | 'Out of Stock'; 
  // Properti tambahan yang ada di form tapi tidak di IInventory basic (misal: subcategory, description, brand, etc.)
  // Jika ini diperlukan di backend, Anda perlu menambahkannya ke model Inventory.ts
  subcategory?: string; 
  description?: string;
  brand?: string;
  manufacturer?: string;
  maximumStock?: number; 
  expiryDate?: string; // Dari Date menjadi string ISO
  batchNumber?: string;
  location?: { // Jika location juga ada di model Inventory
    warehouse?: string;
    shelf?: string;
    section?: string;
  };
  supplier?: { // Jika supplier juga ada di model Inventory
    name?: string;
    contact?: string;
    email?: string;
    leadTime?: number;
  };
}

interface InventoryModalProps {
  item?: Partial<InventoryFormData>; // Gunakan Partial karena item mungkin tidak lengkap
  onClose: () => void;
  onSave: () => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ item, onClose, onSave }) => {
  const queryClient = useQueryClient();
  const isEditMode = !!item?._id; // Tentukan mode edit/tambah berdasarkan adanya _id

  const [formData, setFormData] = useState<InventoryFormData>({
    name: "",
    category: "Obat",
    currentStock: 0,
    minimumStock: 10,
    unit: "pcs",
    unitPrice: 0,
    status: "Available", // Set nilai default di sini (seharusnya diatur otomatis oleh backend pre-save hook)
    subcategory: "",
    description: "",
    brand: "",
    manufacturer: "",
    maximumStock: 1000,
    expiryDate: "",
    batchNumber: "",
    location: { warehouse: "", shelf: "", section: "" },
    supplier: { name: "", contact: "", email: "", leadTime: 7 },
  });

  useEffect(() => {
    if (item) {
      setFormData({
        _id: item._id, // Sertakan _id saat edit
        itemId: item.itemId, // Sertakan itemId saat edit
        name: item.name || "",
        category: item.category || "Obat",
        currentStock: item.currentStock || 0,
        minimumStock: item.minimumStock || 10,
        unit: item.unit || "pcs",
        unitPrice: item.unitPrice || 0,
        status: item.status || "Available", // Pastikan ini di-map dari item yang ada
        subcategory: item.subcategory || "",
        description: item.description || "",
        brand: item.brand || "",
        manufacturer: item.manufacturer || "",
        maximumStock: item.maximumStock || 1000,
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

  const createMutation = useMutation({
    // Argument of type 'InventoryFormData' is not assignable to parameter of type 'InventoryItemData'.
    // Properti 'status' missing. Dulu ini masalahnya.
    // Sekarang InventoryFormData punya status, jadi harusnya OK.
    mutationFn: async (data: InventoryFormData) => inventoryAPI.createInventoryItem(data as InventoryItemData), // Cast ke InventoryItemData
    onSuccess: () => {
      toast.success("Item berhasil ditambahkan");
      onSave(); // Tutup modal dan refresh data
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal menambahkan item");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InventoryFormData) => inventoryAPI.updateInventoryItem(data._id as string, data as Partial<InventoryItemData>), // Cast
    onSuccess: () => {
      toast.success("Item berhasil diupdate");
      onSave(); // Tutup modal dan refresh data
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal mengupdate item");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validasi dasar (opsional, bisa lebih lengkap)
    if (!formData.name || !formData.category || formData.currentStock < 0 || formData.minimumStock < 0 || formData.unitPrice < 0) {
      toast.error("Mohon isi semua field wajib dengan benar.");
      return;
    }

    if (isEditMode) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Konversi nilai ke angka jika tipe inputnya number
    const processedValue = type === 'number' ? Number(value) : value;

    // Handle nested properties (location, supplier)
    const nameParts = name.split(".");
    if (nameParts.length > 1) {
      const [parent, child] = nameParts as [keyof InventoryFormData, string];
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...((prev[parent] as object) || {}), // Pastikan objek induk ada
          [child]: processedValue,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: processedValue }));
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Package size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-slate-800">{isEditMode ? "Edit Item Inventaris" : "Tambah Item Baru"}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nama Item */}
            <div className="col-span-full">
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nama Item *</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>

            {/* Kategori */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Kategori *</label>
              <select
                name="category"
                id="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full border border-slate-300 rounded-md p-2"
              >
                <option value="Obat">Obat</option>
                <option value="Alat Medis">Alat Medis</option>
                <option value="Habis Pakai">Habis Pakai</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            {/* Stok Saat Ini */}
            <div>
              <label htmlFor="currentStock" className="block text-sm font-medium text-slate-700 mb-1">Stok Saat Ini *</label>
              <input
                type="number"
                name="currentStock"
                id="currentStock"
                value={formData.currentStock}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>

            {/* Stok Minimum */}
            <div>
              <label htmlFor="minimumStock" className="block text-sm font-medium text-slate-700 mb-1">Stok Minimum *</label>
              <input
                type="number"
                name="minimumStock"
                id="minimumStock"
                value={formData.minimumStock}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>

            {/* Unit */}
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-slate-700 mb-1">Unit *</label>
              <input
                type="text"
                name="unit"
                id="unit"
                value={formData.unit}
                onChange={handleInputChange}
                required
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>

            {/* Harga per Unit */}
            <div>
              <label htmlFor="unitPrice" className="block text-sm font-medium text-slate-700 mb-1">Harga per Unit *</label>
              <input
                type="number"
                name="unitPrice"
                id="unitPrice"
                value={formData.unitPrice}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>

            {/* Subcategory (opsional) */}
            <div>
              <label htmlFor="subcategory" className="block text-sm font-medium text-slate-700 mb-1">Subkategori</label>
              <input
                type="text"
                name="subcategory"
                id="subcategory"
                value={formData.subcategory || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>

            {/* Description (opsional) */}
            <div className="col-span-full">
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
              <textarea
                name="description"
                id="description"
                value={formData.description || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-slate-300 rounded-md p-2"
              ></textarea>
            </div>

            {/* Brand (opsional) */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-slate-700 mb-1">Merek</label>
              <input
                type="text"
                name="brand"
                id="brand"
                value={formData.brand || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>

            {/* Manufacturer (opsional) */}
            <div>
              <label htmlFor="manufacturer" className="block text-sm font-medium text-slate-700 mb-1">Manufaktur</label>
              <input
                type="text"
                name="manufacturer"
                id="manufacturer"
                value={formData.manufacturer || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>

            {/* Expiry Date (opsional) */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Kedaluwarsa</label>
              <input
                type="date"
                name="expiryDate"
                id="expiryDate"
                value={formData.expiryDate || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>

            {/* Batch Number (opsional) */}
            <div>
              <label htmlFor="batchNumber" className="block text-sm font-medium text-slate-700 mb-1">Nomor Batch</label>
              <input
                type="text"
                name="batchNumber"
                id="batchNumber"
                value={formData.batchNumber || ''}
                onChange={handleInputChange}
                className="w-full border border-slate-300 rounded-md p-2"
              />
            </div>

            {/* Location */}
            <div className="col-span-full pt-4 border-t border-slate-200">
                <h3 className="text-md font-semibold text-slate-800 mb-2">Lokasi Penyimpanan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="location.warehouse" className="block text-sm font-medium text-slate-700 mb-1">Gudang</label>
                        <input
                          type="text"
                          name="location.warehouse"
                          id="location.warehouse"
                          value={formData.location?.warehouse || ''}
                          onChange={handleInputChange}
                          className="w-full border border-slate-300 rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="location.shelf" className="block text-sm font-medium text-slate-700 mb-1">Rak</label>
                        <input
                          type="text"
                          name="location.shelf"
                          id="location.shelf"
                          value={formData.location?.shelf || ''}
                          onChange={handleInputChange}
                          className="w-full border border-slate-300 rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="location.section" className="block text-sm font-medium text-slate-700 mb-1">Seksi</label>
                        <input
                          type="text"
                          name="location.section"
                          id="location.section"
                          value={formData.location?.section || ''}
                          onChange={handleInputChange}
                          className="w-full border border-slate-300 rounded-md p-2"
                        />
                    </div>
                </div>
            </div>

            {/* Supplier */}
            <div className="col-span-full pt-4 border-t border-slate-200">
                <h3 className="text-md font-semibold text-slate-800 mb-2">Informasi Pemasok</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="supplier.name" className="block text-sm font-medium text-slate-700 mb-1">Nama Pemasok</label>
                        <input
                          type="text"
                          name="supplier.name"
                          id="supplier.name"
                          value={formData.supplier?.name || ''}
                          onChange={handleInputChange}
                          className="w-full border border-slate-300 rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="supplier.contact" className="block text-sm font-medium text-slate-700 mb-1">Kontak Pemasok</label>
                        <input
                          type="text"
                          name="supplier.contact"
                          id="supplier.contact"
                          value={formData.supplier?.contact || ''}
                          onChange={handleInputChange}
                          className="w-full border border-slate-300 rounded-md p-2"
                        />
                    </div>
                    <div>
                        <label htmlFor="supplier.email" className="block text-sm font-medium text-slate-700 mb-1">Email Pemasok</label>
                        <input
                          type="email"
                          name="supplier.email"
                          id="supplier.email"
                          value={formData.supplier?.email || ''}
                          onChange={handleInputChange}
                          className="w-full border border-slate-300 rounded-md p-2"
                        />
                    </div>
                    <div className="md:col-span-1">
                        <label htmlFor="supplier.leadTime" className="block text-sm font-medium text-slate-700 mb-1">Lead Time (Hari)</label>
                        <input
                          type="number"
                          name="supplier.leadTime"
                          id="supplier.leadTime"
                          value={formData.supplier?.leadTime || 0}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full border border-slate-300 rounded-md p-2"
                        />
                    </div>
                </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Batal
            </button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin inline-block" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;