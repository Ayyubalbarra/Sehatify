// apps/admin/frontend/src/pages/StokMedis.tsx

"use client"

import React, { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Eye, Edit, Trash2, Package, AlertTriangle, TrendingUp, Loader2, Search } from "lucide-react"
import toast from "react-hot-toast"
import { debounce } from 'lodash'

import MetricCard from "../components/Dashboard/MetricCard"
import DataTable from "../components/DataTable/DataTable"
import InventoryModal from "../components/Modals/InventoryModal"
import { inventoryAPI } from "../services/api"
import type { InventoryItemData, InventoryApiResponse, InventoryStatsApiResponse, ApiResponse } from "../types"

const StokMedis: React.FC = () => { 
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItemData | null>(null) 
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") 

  const queryClient = useQueryClient();
  const pageSize = 10;

  // Debounce search function
  const debounceSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
      setCurrentPage(1); // Reset halaman saat searching
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debounceSearch(e.target.value);
  };

  const { data: inventoryResponse, isLoading: isLoadingItems } = useQuery<InventoryApiResponse>({
    queryKey: ["inventoryItems", currentPage, debouncedSearchTerm, filterStatus], 
    queryFn: () => inventoryAPI.getInventoryItems(currentPage, pageSize, debouncedSearchTerm, "", filterStatus === "all" ? "" : filterStatus),
    keepPreviousData: true,
  })

  const { data: statsResponse, isLoading: isLoadingStats } = useQuery<ApiResponse<InventoryStatsApiResponse>>({
    queryKey: ["inventoryStats"],
    queryFn: inventoryAPI.getInventoryStats, 
  })

  const deleteMutation = useMutation({
    mutationFn: inventoryAPI.deleteInventoryItem,
    onSuccess: () => {
      toast.success("Item berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["inventoryItems"] }); 
      queryClient.invalidateQueries({ queryKey: ["inventoryStats"] }); 
    },
    onError: () => {
      // Error sudah ditangani global interceptor
    },
  });

  const items = inventoryResponse?.data || [];
  const paginationData = inventoryResponse?.pagination || { currentPage: 1, totalPages: 1, total: 0 };
  
  // PERBAIKAN: Mapping data stats sesuai response controller
  const statsData = statsResponse?.data || { total: 0, lowStock: 0, outOfStock: 0, totalValue: 0 }; 

  const columns = [
    { key: "name", label: "Nama Item", render: (item: InventoryItemData) => (
        <div>
          <div className="font-semibold text-slate-800">{item.name}</div>
          <div className="text-xs text-slate-500">{item.category}</div>
        </div>
      ),
    },
    { key: "stock", label: "Stok", render: (item: InventoryItemData) => (
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-bold ${item.status === 'Low Stock' || item.status === 'Out of Stock' ? 'text-red-600' : 'text-slate-800'}`}>{item.currentStock}</span> 
          <span className="text-xs text-slate-500">{item.unit}</span>
        </div>
      ),
    },
    { key: "status", label: "Status", render: (item: InventoryItemData) => (
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
            item.status === 'Available' ? 'bg-green-100/60 text-green-700' : 
            item.status === 'Low Stock' ? 'bg-orange-100/60 text-orange-700' : 
            'bg-red-100/60 text-red-700'}`}>{item.status.replace('_', ' ')}</span> 
      )
    },
    { key: "totalValue", label: "Total Nilai", render: (item: InventoryItemData) => <span className="font-semibold text-slate-800">Rp {(item.currentStock * item.unitPrice).toLocaleString("id-ID")}</span> }, 
    { key: "actions", label: "Aksi", render: (item: InventoryItemData) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleEdit(item)} className="h-8 w-8 rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"><Eye size={16} className="mx-auto" /></button>
          <button onClick={() => handleEdit(item)} className="h-8 w-8 rounded-md text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-700"><Edit size={16} className="mx-auto" /></button>
          <button onClick={() => handleDelete(item._id)} disabled={deleteMutation.isPending} className="h-8 w-8 rounded-md text-red-500 transition-colors hover:bg-red-100 hover:text-red-700"><Trash2 size={16} className="mx-auto" /></button>
        </div>
      ),
    },
  ];

  const handleEdit = (item: InventoryItemData) => { setSelectedItem(item); setIsModalOpen(true); }; 
  const handleAddNew = () => { setSelectedItem(null); setIsModalOpen(true); }; 
  const handleDelete = (itemId: string) => { 
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan.")) {
      deleteMutation.mutate(itemId);
    }
  }; 

  const isLoading = isLoadingItems || isLoadingStats;

  // Tampilkan loader utama hanya jika data awal belum ada
  if (isLoading && !inventoryResponse) {
    return <div className="flex h-full items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>; 
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">Manajemen Stok Medis</h1>
            <p className="text-slate-500">Monitor dan kelola semua inventaris obat dan alat medis.</p>
          </div>
          <button onClick={handleAddNew} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700">
            <Plus size={18} />
            Tambah Item Baru
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <MetricCard title="Total Jenis Item" value={statsData.total.toLocaleString("id-ID")} icon={Package} color="blue" /> 
          <MetricCard title="Item Stok Rendah" value={statsData.lowStock.toLocaleString("id-ID")} icon={AlertTriangle} color="red" description="Perlu pengadaan segera" /> 
          <MetricCard title="Total Nilai Inventaris" value={`Rp ${statsData.totalValue.toLocaleString("id-ID")}`} icon={TrendingUp} color="green" /> 
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Daftar Inventaris</h2>
              <div className="flex items-center gap-2">
                  <div className="relative w-full md:w-64">
                      <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input type="text" placeholder="Cari nama atau ID item..." value={searchTerm} onChange={handleSearchChange} className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                  </div>
                  <select
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                      className="w-full rounded-md border border-slate-300 bg-white py-2 px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 md:w-auto"
                  >
                      <option value="all">Semua Status</option>
                      {/* PERBAIKAN: Menggunakan 'Available' agar cocok dengan backend */}
                      <option value="Available">Tersedia</option> 
                      <option value="Low Stock">Stok Rendah</option>
                      <option value="Out of Stock">Habis</option>
                  </select>
              </div>
          </div>
          <DataTable
            columns={columns}
            data={items}
            loading={isLoadingItems} 
            pagination={{
              currentPage: paginationData.currentPage,
              totalPages: paginationData.totalPages,
              totalItems: paginationData.total,
              onPageChange: setCurrentPage,
            }}
          />
        </div>
      </div>
      
      {isModalOpen && (
        <InventoryModal 
          item={selectedItem || undefined} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  )
}

export default StokMedis;