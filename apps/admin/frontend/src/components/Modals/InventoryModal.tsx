// apps/admin/frontend/src/components/Modals/InventoryModal.tsx

import React, { useState, useEffect } from "react"
import { X, Loader2 } from "lucide-react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"
import { inventoryAPI } from "../../services/api"
import type { InventoryItemData } from "../../types"

// Tipe untuk data form, tanpa _id dan status manual
type FormDataType = Omit<InventoryItemData, '_id' | 'status' | 'createdAt' | 'updatedAt'>;

interface InventoryModalProps {
  item?: InventoryItemData; 
  onClose: () => void;
}

const InventoryModal: React.FC<InventoryModalProps> = ({ item, onClose }) => {
  const queryClient = useQueryClient();
  const isEditing = !!item;

  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    category: "",
    currentStock: 0,
    minimumStock: 10, // Default stok minimum
    unit: "",
    supplier: "",
    expirationDate: undefined,
    unitPrice: 0,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        category: item.category || "",
        currentStock: item.currentStock || 0,
        minimumStock: item.minimumStock || 0,
        unit: item.unit || "",
        supplier: item.supplier || "",
        // Format tanggal untuk input type="date"
        expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : undefined,
        unitPrice: item.unitPrice || 0,
      });
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Konversi ke angka jika tipe input adalah number
    const processedValue = type === 'number' ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const mutationOptions = {
    onSuccess: () => {
      // Invalidate query untuk memuat ulang data di tabel dan statistik
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] });
      queryClient.invalidateQueries({ queryKey: ["inventoryStats"] });
      onClose(); // Tutup modal setelah sukses
    },
    onError: (error: any) => {
      // Pesan error sudah ditangani oleh interceptor global
      console.error(error);
    },
  }

  const createMutation = useMutation({
    mutationFn: inventoryAPI.createInventoryItem,
    ...mutationOptions,
    onSuccess: () => {
      toast.success("Item berhasil ditambahkan!");
      mutationOptions.onSuccess();
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string, payload: Partial<FormDataType> }) => inventoryAPI.updateInventoryItem(data.id, data.payload),
    ...mutationOptions,
    onSuccess: () => {
      toast.success("Item berhasil diperbarui!");
      mutationOptions.onSuccess();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing && item?._id) {
      updateMutation.mutate({ id: item._id, payload: formData });
    } else {
      // Saat membuat item baru, 'currentStock' sama dengan 'initialStock'
      const createPayload = { ...formData, currentStock: formData.currentStock };
      createMutation.mutate(createPayload);
    }
  };
  
  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" onClick={onClose}>
      <div className="relative w-full max-w-lg transform rounded-xl bg-white p-6 shadow-xl transition-all" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} disabled={isLoading} className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100">
          <X size={24} />
        </button>
        <h2 className="mb-1 text-2xl font-bold text-slate-800">{isEditing ? "Edit Item Inventaris" : "Tambah Item Baru"}</h2>
        <p className="mb-6 text-sm text-slate-500">Isi detail item medis di bawah ini.</p>
        
        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto pr-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">Nama Item</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
          <div>
            <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">Kategori</label>
            <input type="text" id="category" name="category" placeholder="Contoh: Obat, Alkes, Darah" value={formData.category} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="currentStock" className="mb-1 block text-sm font-medium text-slate-700">Stok Saat Ini</label>
              <input type="number" id="currentStock" name="currentStock" value={formData.currentStock} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required min="0" />
            </div>
            <div>
              <label htmlFor="minimumStock" className="mb-1 block text-sm font-medium text-slate-700">Stok Minimum</label>
              <input type="number" id="minimumStock" name="minimumStock" value={formData.minimumStock} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required min="0" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="unit" className="mb-1 block text-sm font-medium text-slate-700">Unit</label>
              <input type="text" id="unit" name="unit" placeholder="Contoh: tablet, botol, unit" value={formData.unit} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required />
            </div>
            <div>
              <label htmlFor="unitPrice" className="mb-1 block text-sm font-medium text-slate-700">Harga per Unit (Rp)</label>
              <input type="number" id="unitPrice" name="unitPrice" value={formData.unitPrice} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" required min="0" />
            </div>
          </div>
          <div>
            <label htmlFor="supplier" className="mb-1 block text-sm font-medium text-slate-700">Supplier (Opsional)</label>
            <input type="text" id="supplier" name="supplier" value={formData.supplier || ''} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div>
            <label htmlFor="expirationDate" className="mb-1 block text-sm font-medium text-slate-700">Tgl. Kadaluarsa (Opsional)</label>
            <input type="date" id="expirationDate" name="expirationDate" value={formData.expirationDate || ''} onChange={handleInputChange} className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">Batal</button>
            <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Simpan Perubahan" : "Tambah Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryModal;