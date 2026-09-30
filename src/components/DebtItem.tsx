'use client';

import React, { useState } from 'react';
import { Debt } from '@/types/database';
import {
  formatRupiah,
  formatRelativeTime,
  formatIndonesianDate,
  generatePoliteWhatsAppMessage,
} from '@/lib/formatters';
import {
  CheckCircle2,
  Clock,
  Edit2,
  Trash2,
  Calendar,
  FileText,
  ArrowDownLeft,
  ArrowUpRight,
  RotateCcw,
  MessageCircle,
  Copy,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DebtItemProps {
  debt: Debt;
  onToggleSettle: (debt: Debt) => Promise<void>;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
}

export function DebtItem({ debt, onToggleSettle, onEdit, onDelete }: DebtItemProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedWA, setCopiedWA] = useState(false);
  const isSettled = Boolean(debt.settled_at);
  const isOwedToMe = debt.type === 'owed_to_me';

  const handleToggle = async () => {
    setIsUpdating(true);
    try {
      if (!isSettled) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
        } catch {
          // ignore
        }
      }
      await onToggleSettle(debt);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyWhatsApp = () => {
    const text = generatePoliteWhatsAppMessage(
      debt.counterpart_name,
      debt.amount,
      debt.note,
      debt.due_date
    );
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedWA(true);
    setTimeout(() => setCopiedWA(false), 3000);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div
      className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all ${
        isSettled
          ? 'border-slate-200/60 bg-slate-50/50 opacity-85'
          : isOwedToMe
          ? 'border-slate-200 hover:border-emerald-200 shadow-sm'
          : 'border-slate-200 hover:border-rose-200 shadow-sm'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Counterpart name, badges, dates */}
        <div className="flex items-start gap-3.5">
          {/* Direction Icon Badge */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
              isSettled
                ? 'bg-slate-100 text-slate-400'
                : isOwedToMe
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                : 'bg-rose-50 text-rose-600 border border-rose-200/60'
            }`}
          >
            {isOwedToMe ? (
              <ArrowDownLeft className="w-5 h-5 stroke-[2.2]" />
            ) : (
              <ArrowUpRight className="w-5 h-5 stroke-[2.2]" />
            )}
          </div>

          <div>
            {/* Person Name & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="font-bold text-base text-slate-900 leading-tight">
                {debt.counterpart_name}
              </h4>

              {/* Tipe: dihutang / saya hutang */}
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isOwedToMe
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                }`}
              >
                {isOwedToMe ? 'Dihutang ke Saya' : 'Saya Hutang'}
              </span>

              {/* Status: Belum Lunas / Lunas */}
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                  isSettled
                    ? 'bg-slate-100 text-slate-700 border border-slate-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {isSettled ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-slate-600" />
                    Lunas
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 text-amber-600" />
                    Belum Lunas
                  </>
                )}
              </span>
            </div>

            {/* Note & Due date */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-slate-500">
              {/* Relative date requirement: format "3 hari lalu", "kemarin" */}
              <span className="flex items-center gap-1" title={formatIndonesianDate(debt.created_at)}>
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Dicatat: <strong className="font-semibold text-slate-700">{formatRelativeTime(debt.created_at)}</strong>
              </span>

              {debt.due_date && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Tempo: {formatIndonesianDate(debt.due_date)} ({formatRelativeTime(debt.due_date)})
                </span>
              )}

              {debt.note && (
                <span className="flex items-center gap-1 text-slate-600 max-w-sm truncate" title={debt.note}>
                  <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  &quot;{debt.note}&quot;
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Amount & Action buttons */}
        <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 gap-2">
          {/* Jumlah format Rp 1.234.000 */}
          <div className="text-left sm:text-right">
            <span
              className={`text-lg sm:text-xl font-extrabold tabular-nums tracking-tight ${
                isSettled
                  ? 'text-slate-500 line-through'
                  : isOwedToMe
                  ? 'text-emerald-700'
                  : 'text-rose-700'
              }`}
            >
              {formatRupiah(debt.amount)}
            </span>
            {isSettled && debt.settled_at && (
              <p className="text-[11px] text-slate-400">
                Lunas {formatRelativeTime(debt.settled_at)}
              </p>
            )}
          </div>

          {/* Action buttons (Tandai lunas, Edit, Hapus, WA Reminder) */}
          <div className="flex items-center gap-1.5">
            {/* Friendly WhatsApp Reminder for unsettled receivables */}
            {isOwedToMe && !isSettled && (
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                title="Salin pesan pengingat santun untuk WhatsApp"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200/80 transition-colors"
              >
                {copiedWA ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-teal-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-3.5 h-3.5 text-teal-600" />
                    <span className="hidden sm:inline">Pesan WA</span>
                  </>
                )}
              </button>
            )}

            {/* Tandai Lunas / Batal Button (idempotent toggle) */}
            <button
              onClick={handleToggle}
              disabled={isUpdating}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50 ${
                isSettled
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
              }`}
            >
              {isSettled ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Batalkan Lunas</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tandai Lunas</span>
                </>
              )}
            </button>

            {/* Edit Button */}
            <button
              onClick={() => onEdit(debt)}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="Edit catatan"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Hapus Button */}
            <button
              onClick={() => onDelete(debt)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Hapus catatan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
