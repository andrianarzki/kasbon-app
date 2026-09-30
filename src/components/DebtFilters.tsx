'use client';

import React from 'react';
import { FilterStatus, FilterType, SortOption } from '@/types/database';
import { Search, SlidersHorizontal, Users2, Plus } from 'lucide-react';

interface DebtFiltersProps {
  status: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  type: FilterType;
  onTypeChange: (type: FilterType) => void;
  search: string;
  onSearchChange: (search: string) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  groupByPerson: boolean;
  onGroupByPersonChange: (val: boolean) => void;
  onOpenNewModal: () => void;
}

export function DebtFilters({
  status,
  onStatusChange,
  type,
  onTypeChange,
  search,
  onSearchChange,
  sort,
  onSortChange,
  groupByPerson,
  onGroupByPersonChange,
  onOpenNewModal,
}: DebtFiltersProps) {
  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-3.5">
      {/* Top row: Search input & Catat Baru button */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search by person name (Bonus) */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Cari berdasarkan nama orang..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Action Button: Catat Baru */}
        <button
          onClick={onOpenNewModal}
          className="inline-flex sm:hidden items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Catat Baru</span>
        </button>
      </div>

      {/* Bottom row: Filter dropdowns & Grouping toggle */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
        {/* Filter Status (Wajib: semua / belum / lunas) */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
          <span className="text-slate-500 font-medium">Status:</span>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Status</option>
            <option value="unsettled">Belum Lunas</option>
            <option value="settled">Lunas</option>
          </select>
        </div>

        {/* Filter Tipe (Wajib: semua / dihutang / hutang) */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
          <span className="text-slate-500 font-medium">Tipe:</span>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as FilterType)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="all">Semua Tipe</option>
            <option value="owed_to_me">Dihutang ke Saya</option>
            <option value="i_owe">Saya Hutang</option>
          </select>
        </div>

        {/* Sort by jumlah / tanggal (Bonus) */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Urutan:</span>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="date_desc">Terbaru</option>
            <option value="date_asc">Terlama</option>
            <option value="amount_desc">Nominal Terbesar</option>
            <option value="amount_asc">Nominal Terkecil</option>
          </select>
        </div>

        {/* Group by same person toggle (Bonus) */}
        <button
          type="button"
          onClick={() => onGroupByPersonChange(!groupByPerson)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
            groupByPerson
              ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
          }`}
          title="Kelompokkan kasbon dari orang yang sama"
        >
          <Users2 className="w-3.5 h-3.5" />
          <span>Kelompokkan per Orang</span>
        </button>
      </div>
    </div>
  );
}
