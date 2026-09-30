'use client';

import React from 'react';
import { formatRupiah } from '@/lib/formatters';
import { ArrowDownLeft, ArrowUpRight, Scale, TrendingUp, TrendingDown } from 'lucide-react';

interface SummaryCardsProps {
  totalOwedToMe: number;
  totalIOwe: number;
  netBalance: number;
  unsettledOwedCount: number;
  unsettledOweCount: number;
}

export function SummaryCards({
  totalOwedToMe,
  totalIOwe,
  netBalance,
  unsettledOwedCount,
  unsettledOweCount,
}: SummaryCardsProps) {
  const isNetPositive = netBalance > 0;
  const isNetZero = netBalance === 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
      {/* Card 1: Total dihutang ke saya */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Total Dihutang ke Saya
          </p>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {formatRupiah(totalOwedToMe)}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Ada <span className="font-semibold text-slate-700">{unsettledOwedCount} orang</span> belum balikin uangmu
          </p>
        </div>
        <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-500" />
      </div>

      {/* Card 2: Total saya hutang */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-rose-100 shadow-sm relative overflow-hidden group hover:border-rose-300 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">
            Total Saya Hutang
          </p>
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
            {formatRupiah(totalIOwe)}
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Kamu punya kewajiban ke <span className="font-semibold text-slate-700">{unsettledOweCount} catatan</span>
          </p>
        </div>
        <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-rose-400 to-red-500" />
      </div>

      {/* Card 3: Net (X - Y, kasih warna hijau/merah) */}
      <div
        className={`rounded-2xl p-5 sm:p-6 shadow-sm border relative overflow-hidden transition-all ${
          isNetZero
            ? 'bg-white border-slate-200'
            : isNetPositive
            ? 'bg-emerald-50/60 border-emerald-200'
            : 'bg-rose-50/60 border-rose-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <p
            className={`text-xs font-bold uppercase tracking-wider ${
              isNetZero
                ? 'text-slate-600'
                : isNetPositive
                ? 'text-emerald-800'
                : 'text-rose-800'
            }`}
          >
            Net (Selisih)
          </p>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isNetZero
                ? 'bg-slate-100 text-slate-600'
                : isNetPositive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            }`}
          >
            {isNetZero ? (
              <Scale className="w-5 h-5" />
            ) : isNetPositive ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
          </div>
        </div>
        <div className="mt-3">
          <h3
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${
              isNetZero
                ? 'text-slate-900'
                : isNetPositive
                ? 'text-emerald-700'
                : 'text-rose-700'
            }`}
          >
            {formatRupiah(netBalance)}
          </h3>
          <p className="mt-1 text-xs">
            {isNetZero ? (
              <span className="text-slate-500">Keuangan kamu pas & seimbang</span>
            ) : isNetPositive ? (
              <span className="text-emerald-700 font-medium">
                Surplus (piutang lebih besar dari hutangmu)
              </span>
            ) : (
              <span className="text-rose-700 font-medium">
                Defisit (hutangmu lebih besar dari piutang)
              </span>
            )}
          </p>
        </div>
        <div
          className={`absolute top-0 right-0 h-1 w-full ${
            isNetZero
              ? 'bg-slate-300'
              : isNetPositive
              ? 'bg-emerald-500'
              : 'bg-rose-500'
          }`}
        />
      </div>
    </div>
  );
}
