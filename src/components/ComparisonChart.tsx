'use client';

import React from 'react';
import { formatRupiah } from '@/lib/formatters';
import { BarChart3 } from 'lucide-react';

interface ComparisonChartProps {
  totalOwedToMe: number;
  totalIOwe: number;
}

export function ComparisonChart({ totalOwedToMe, totalIOwe }: ComparisonChartProps) {
  const sum = totalOwedToMe + totalIOwe;
  const owedPercent = sum > 0 ? Math.round((totalOwedToMe / sum) * 100) : 50;
  const owePercent = sum > 0 ? 100 - owedPercent : 50;

  if (sum === 0) return null;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-teal-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Perbandingan Rasio Utang Piutang
          </h4>
        </div>
        <span className="text-xs text-slate-500">
          Total Perputaran: <strong className="text-slate-800 tabular-nums">{formatRupiah(sum)}</strong>
        </span>
      </div>

      {/* Visual Bar */}
      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        <div
          style={{ width: `${owedPercent}%` }}
          className="bg-emerald-500 h-full transition-all duration-500 ease-out"
          title={`Dihutang ke Saya: ${owedPercent}%`}
        />
        <div
          style={{ width: `${owePercent}%` }}
          className="bg-rose-500 h-full transition-all duration-500 ease-out"
          title={`Saya Hutang: ${owePercent}%`}
        />
      </div>

      {/* Legend & Labels */}
      <div className="flex items-center justify-between mt-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span className="text-slate-600">
            Dihutang ke Saya: <strong className="text-emerald-700 tabular-nums">{owedPercent}%</strong> ({formatRupiah(totalOwedToMe)})
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
          <span className="text-slate-600">
            Saya Hutang: <strong className="text-rose-700 tabular-nums">{owePercent}%</strong> ({formatRupiah(totalIOwe)})
          </span>
        </div>
      </div>
    </div>
  );
}
