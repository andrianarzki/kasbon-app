'use client';

import React from 'react';
import { FilterStatus, FilterType, SortOption } from '@/types/database';
import { Search, SlidersHorizontal, Users2 } from 'lucide-react';

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
}: DebtFiltersProps) {
  return (
    <div className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 shadow-sm space-y-3">
      {/* Search Input Bar */}
      <div className="relative w-full">
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

      {/* Filter Controls: Clean 2-column Grid on Mobile, Flex Row on Desktop */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 text-xs">
        {/* Filter Status */}
        <div className="col-span-1 flex items-center justify-between sm:justify-start gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2">
          <span className="text-slate-500 font-medium whitespace-nowrap">Status:</span>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-right sm:text-left truncate max-w-[100px] sm:max-w-none"
          >
            <option value="all">Semua</option>
            <option value="unsettled">Belum Lunas</option>
            <option value="settled">Lunas</option>
          </select>
        </div>

        {/* Filter Tipe */}
        <div className="col-span-1 flex items-center justify-between sm:justify-start gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2">
          <span className="text-slate-500 font-medium whitespace-nowrap">Tipe:</span>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as FilterType)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-right sm:text-left truncate max-w-[100px] sm:max-w-none"
          >
            <option value="all">Semua</option>
            <option value="owed_to_me">Dihutang ke Saya</option>
            <option value="i_owe">Saya Hutang</option>
          </select>
        </div>

        {/* Sort option */}
        <div className="col-span-1 flex items-center justify-between sm:justify-start gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2">
          <div className="flex items-center gap-1 text-slate-500 font-medium whitespace-nowrap">
            <SlidersHorizontal className="w-3 h-3 text-slate-400 hidden sm:inline" />
            <span>Urutan:</span>
          </div>
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer text-right sm:text-left truncate max-w-[100px] sm:max-w-none"
          >
            <option value="date_desc">Terbaru</option>
            <option value="date_asc">Terlama</option>
            <option value="amount_desc">Nominal Terbesar</option>
            <option value="amount_asc">Nominal Terkecil</option>
          </select>
        </div>

        {/* Grouping Toggle */}
        <button
          type="button"
          onClick={() => onGroupByPersonChange(!groupByPerson)}
          className={`col-span-1 flex items-center justify-center sm:justify-start gap-1.5 px-2.5 py-2 rounded-xl border transition-all text-center sm:text-left ${
            groupByPerson
              ? 'bg-teal-50 border-teal-300 text-teal-800 font-bold'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 font-medium'
          }`}
          title="Kelompokkan kasbon dari orang yang sama"
        >
          <Users2 className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Kelompokkan Orang</span>
        </button>
      </div>
    </div>
  );
}
