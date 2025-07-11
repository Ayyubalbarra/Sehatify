"use client"

import type React from "react"
import { ChevronLeft, ChevronRight, Loader2, Info } from "lucide-react"
// Hapus import CSS
// import "./DataTable.css"

interface Column {
  key: string
  label: string
  render?: (item: any) => React.ReactNode
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  pagination?: Pagination
}

const DataTable: React.FC<DataTableProps> = ({ columns, data, loading, pagination }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="mt-4 text-slate-500">Memuat data...</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-center">
        <Info className="h-10 w-10 text-slate-400" />
        <p className="mt-4 font-semibold text-slate-600">Tidak ada data yang tersedia</p>
        <p className="text-sm text-slate-500">Silakan coba ubah filter atau tambahkan data baru.</p>
      </div>
    )
  }
  
  const renderPaginationButtons = () => {
    if (!pagination) return null;

    const { currentPage, totalPages } = pagination;
    const pages = [];
    const pageLimit = 5;
    let startPage = Math.max(1, currentPage - Math.floor(pageLimit / 2));
    let endPage = Math.min(totalPages, startPage + pageLimit - 1);

    if (endPage - startPage + 1 < pageLimit) {
        startPage = Math.max(1, endPage - pageLimit + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => pagination.onPageChange(i)}
          className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
            currentPage === i
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {data.map((item, index) => (
              <tr key={item._id || index} className="transition-colors hover:bg-slate-50/50">
                {columns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-6 py-4">
                    {column.render ? column.render(item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col items-start justify-between gap-4 border-t border-slate-200 bg-slate-50/50 px-6 py-3 md:flex-row md:items-center">
          <p className="text-sm text-slate-600">
            Menampilkan{" "}
            <span className="font-semibold">{(pagination.currentPage - 1) * 10 + 1}</span>
            {" - "}
            <span className="font-semibold">{Math.min(pagination.currentPage * 10, pagination.totalItems)}</span>
            {" dari "}
            <span className="font-semibold">{pagination.totalItems}</span> hasil
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={16} />
              <span>Sebelumnya</span>
            </button>
            <div className="flex items-center gap-1">
                {renderPaginationButtons()}
            </div>
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>Berikutnya</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
