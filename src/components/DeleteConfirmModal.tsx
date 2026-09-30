'use client';

import React from 'react';
import { Debt } from '@/types/database';
import { formatRupiah } from '@/lib/formatters';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  debt: Debt | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  debt,
  onClose,
  onConfirm,
  loading,
}: DeleteConfirmModalProps) {
  if (!isOpen || !debt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3.5">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center">
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Hapus Catatan Ini?
          </h3>
          <p className="mt-1.5 text-xs text-slate-500">
            Yakin mau menghapus catatan kasbon dengan{' '}
            <strong className="text-slate-800">{debt.counterpart_name}</strong> sebesar{' '}
            <strong className="text-slate-800">{formatRupiah(debt.amount)}</strong>? Tindakan ini gak bisa dibatalkan.
          </p>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
