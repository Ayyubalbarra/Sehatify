"use client"

import type React from "react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Eye, Edit, Trash2, Package, AlertTriangle, TrendingUp, Loader2, Search, Filter } from "lucide-react"
import MetricCard from "../components/Dashboard/MetricCard.tsx"
import DataTable from "../components/DataTable/DataTable.tsx"
import InventoryModal from "../components/Modals/InventoryModal.tsx"

interface InventoryItem {
  _id: string;
  name: string;
  category: string;
  status: "Available" | "Low Stock" | "Out of Stock";
  currentStock: number;
  minimumStock: number;
  unit: string;
  unitPrice: number;
}

const mockInventoryData = {
  success: true,
  data: {
    items: [
      { _id: "1", name: "Paracetamol 500mg", category: "Obat", status: "Available" as const, currentStock: 500, minimumStock: 100, unit: "tablet", unitPrice: 500 },
      { _id: "2", name: "Stetoskop", category: "Alat Medis", status: "Available" as const, currentStock: 15, minimumStock: 5, unit: "unit", unitPrice: 250000 },
      { _id: "3", name: "Sarung Tangan Latex", category: "Habis Pakai", status: "Low Stock" as const, currentStock: 50, minimumStock: 100, unit: "box", unitPrice: 25000 },
    ],
    stats: { total: 156, lowStock: 12, totalValue: 45000000 },
    pagination: { totalPages: 1, totalItems: 3 },
  },
}

const StokMedis: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory", currentPage, searchTerm],
    queryFn: async () => mockInventoryData, // Ganti dengan fetch API Anda
    initialData: mockInventoryData
  })

  const data = inventoryData?.data || mockInventoryData.data
  const stats = data.stats

  const columns = [
    { key: "name", label: "Nama Item", render: (item: InventoryItem) => (
        <div>
          <div className="font-semibold text-slate-800">{item.name}</div>
          <div className="text-xs text-slate-500">{item.category}</div>
        </div>
      ),
    },
    { key: "stock", label: "Stok", render: (item: InventoryItem) => (
        <div className="flex items-baseline gap-1">
          <span className={`text-lg font-bold ${item.currentStock <= item.minimumStock ? 'text-red-600' : 'text-slate-800'}`}>{item.currentStock}</span>
          <span className="text-xs text-slate-500">{item.unit}</span>
        </div>
      ),
    },
    { key: "status", label: "Status", render: (item: InventoryItem) => (
        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${item.status === 'Available' ? 'bg-green-100/60 text-green-700' : 'bg-red-100/60 text-red-700'}`}>{item.status}</span>
      ),
    },
    { key: "totalValue", label: "Total Nilai", render: (item: InventoryItem) => <span className="font-semibold text-slate-800">Rp {(item.currentStock * item.unitPrice).toLocaleString("id-ID")}</span> },
    { key: "actions", label: "Aksi", render: (item: InventoryItem) => (
        <div className="flex items-center gap-1">
          <button onClick={() => handleEdit(item)} className="h-8 w-8 rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"><Eye size={16} className="mx-auto" /></button>
          <button onClick={() => handleEdit(item)} className="h-8 w-8 rounded-md text-amber-500 transition-colors hover:bg-amber-100 hover:text-amber-700"><Edit size={16} className="mx-auto" /></button>
          <button className="h-8 w-8 rounded-md text-red-500 transition-colors hover:bg-red-100 hover:text-red-700"><Trash2 size={16} className="mx-auto" /></button>
        </div>
      ),
    },
  ]

  const handleEdit = (item: InventoryItem) => { setSelectedItem(item); setShowModal(true) }
  const handleAddNew = () => { setSelectedItem(null); setShowModal(true) }

  if (isLoading) {
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
                <button className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <Filter size={16} />
                    <span>Filter</span>
                </button>
            </div>
        </div>
        <DataTable
          columns={columns}
          data={data.items}
          loading={isLoading}
          pagination={{
            currentPage: currentPage,
            totalPages: data.pagination.totalPages,
            totalItems: data.pagination.totalItems,
            onPageChange: setCurrentPage,
          }}
        />
      </div>

      {showModal && (
        <InventoryModal item={selectedItem || undefined} onClose={() => setShowModal(false)} onSave={() => { setShowModal(false); }} />
      )}
    </div>
  )
}

export default StokMedis
