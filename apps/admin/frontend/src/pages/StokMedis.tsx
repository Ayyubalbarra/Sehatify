// apps/admin/frontend/src/pages/StokMedis.tsx

"use client"

import type React from "react"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Eye, Edit, Trash2, Package, AlertTriangle, TrendingUp, Loader2, Search, Filter } from "lucide-react"
import toast from "react-hot-toast"
import MetricCard from "../components/Dashboard/MetricCard"
import DataTable from "../components/DataTable/DataTable"
import InventoryModal from "../components/Modals/InventoryModal"
import { inventoryAPI } from "../services/api"
import type { InventoryItemData, InventoryApiResponse, InventoryStatsApiResponse } from "../types"

const StokMedis: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItemData | null>(null) // Gunakan InventoryItemData
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all") // 'all', 'Available', 'Low Stock', 'Out of Stock'

  const queryClient = useQueryClient()

  // Query untuk mendapatkan data inventaris
  const { data: inventoryResponse, isLoading: isLoadingItems } = useQuery<InventoryApiResponse>({
    queryKey: ["inventory", currentPage, searchTerm, filterStatus],
    queryFn: () => inventoryAPI.getInventoryItems(currentPage, 10, searchTerm, "", filterStatus === "all" ? "" : filterStatus),
    // limit 10 disinkronkan dengan default di backend inventoryController
  })

  // Query untuk mendapatkan statistik inventaris
  const { data: statsResponse, isLoading: isLoadingStats } = useQuery<InventoryStatsApiResponse>({
    queryKey: ["inventoryStats"],
    queryFn: () => inventoryAPI.getInventoryStats(),
  })

  // Mutasi untuk menghapus item
  const deleteMutation = useMutation({
    mutationFn: async (itemId: string) => inventoryAPI.deleteInventoryItem(itemId),
    onSuccess: () => {
      toast.success("Item berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["inventory"] }); // Refresh daftar item
      queryClient.invalidateQueries({ queryKey: ["inventoryStats"] }); // Refresh statistik
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || error.message || "Gagal menghapus item";
      toast.error(message);
    },
  });

  const items = inventoryResponse?.data || [];
  const paginationData = inventoryResponse?.pagination || { currentPage: 1, totalPages: 1, total: 0 };
  const stats = statsResponse?.data || { total: 0, lowStock: 0, outOfStock: 0, totalValue: 0 };

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
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${item.status === 'Available' ? 'bg-green-100/60 text-green-700' : (item.status === 'Low Stock' ? 'bg-orange-100/60 text-orange-700' : 'bg-red-100/60 text-red-700')}`}>{item.status}</span>
      ),
    },
    { key: "totalValue", label: "Total Nilai", render: (item: InventoryItemData) => <span className="font-semibold text-slate-800">Rp {(item.currentStock * item.unitPrice).toLocaleString("id-ID")}</span> },
    { key: "actions", label: "Aksi", render: (item: InventoryItemData) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleEdit(item)} className="h-8 w-8 rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"><Eye size={16} className="mx-auto" /></button>
          <button onClick={() => handleEdit(item)} className="h-8 w-8 rounded-md text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-700"><Edit size={16} className="mx-auto" /></button>
          <button onClick={() => handleDelete(item._id)} className="h-8 w-8 rounded-md text-red-500 transition-colors hover:bg-red-100 hover:text-red-700"><Trash2 size={16} className="mx-auto" /></button>
        </div>
      ),
    },
  ]

  const filterTabs = [
    { key: "all", label: "Semua", count: stats.total },
    { key: "Available", label: "Tersedia", count: stats.total - stats.lowStock - stats.outOfStock },
    { key: "Low Stock", label: "Stok Rendah", count: stats.lowStock },
    { key: "Out of Stock", label: "Habis Stok", count: stats.outOfStock },
  ]


  const handleEdit = (item: InventoryItemData) => { setSelectedItem(item); setShowModal(true) }
  const handleAddNew = () => { setSelectedItem(null); setShowModal(true) }
  const handleDelete = (itemId: string) => { 
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      deleteMutation.mutate(itemId);
    }
  }

  const isLoading = isLoadingItems || isLoadingStats;

  if (isLoading && (!inventoryResponse || !statsResponse)) {
    return <div className="flex h-full items-center justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
  }

  return (
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
        <MetricCard title="Total Jenis Item" value={stats.total} icon={Package} color="blue" />
        <MetricCard title="Item Stok Rendah" value={stats.lowStock} icon={AlertTriangle} color="red" description="Perlu pengadaan segera" />
        <MetricCard title="Total Nilai Inventaris" value={`Rp ${stats.totalValue.toLocaleString("id-ID")}`} icon={TrendingUp} color="green" />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-lg font-semibold text-slate-800">Daftar Inventaris</h2>
            <div className="flex items-center gap-2">
                <div className="relative w-full md:w-64">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="text" placeholder="Cari item..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                        <Filter size={16} />
                        <span>Filter</span>
                    </button>
                    {/* Filter dropdown for status */}
                    <select
                        value={filterStatus}
                        onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                        className="rounded-md border border-slate-300 bg-slate-50 py-2 px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="all">Semua Status</option>
                        <option value="Available">Tersedia</option>
                        <option value="Low Stock">Stok Rendah</option>
                        <option value="Out of Stock">Habis Stok</option>
                    </select>
                </div>
            </div>
        </div>
        <DataTable
          columns={columns}
          data={items}
          loading={isLoadingItems} // Gunakan isLoadingItems untuk tabel
          pagination={{
            currentPage: paginationData.currentPage,
            totalPages: paginationData.totalPages,
            totalItems: paginationData.total,
            onPageChange: setCurrentPage,
          }}
        />
      </div>

      {showModal && (
        <InventoryModal 
          item={selectedItem || undefined} 
          onClose={() => setShowModal(false)} 
          onSave={() => { 
            setShowModal(false); 
            queryClient.invalidateQueries({ queryKey: ["inventory"] }); 
            queryClient.invalidateQueries({ queryKey: ["inventoryStats"] }); 
          }} 
        />
      )}
    </div>
  )
}

export default StokMedis