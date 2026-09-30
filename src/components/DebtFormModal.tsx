'use client';

import React, { useState, useEffect } from 'react';
import { Debt, DebtInsert, DebtType } from '@/types/database';
import { validateDebtInput } from '@/lib/validations';
import { formatRupiah } from '@/lib/formatters';
import { X, ArrowDownLeft, ArrowUpRight, AlertCircle } from 'lucide-react';

interface DebtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DebtInsert, id?: string) => Promise<boolean>;
  editingDebt?: Debt | null;
}

export function DebtFormModal({
  isOpen,
  onClose,
  onSubmit,
  editingDebt,
}: DebtFormModalProps) {
  const isEditing = Boolean(editingDebt);

  // Form states
  const [type, setType] = useState<DebtType>('owed_to_me');
  const [counterpartName, setCounterpartName] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [note, setNote] = useState('');

  // UI / Feedback states
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Today's ISO date string (YYYY-MM-DD)
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Pre-fill when editing or reset for new
  useEffect(() => {
    if (editingDebt) {
      setType(editingDebt.type);
      setCounterpartName(editingDebt.counterpart_name);
      setAmount(String(editingDebt.amount));
      setDueDate(editingDebt.due_date ? editingDebt.due_date.slice(0, 10) : getTodayDateString());
      setNote(editingDebt.note || '');
    } else {
      setType('owed_to_me');
      setCounterpartName('');
      setAmount('');
      setDueDate(getTodayDateString()); // Default hari ini (Deliverable 3)
      setNote('');
    }
    setErrors({});
    setServerError(null);
  }, [editingDebt, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setServerError(null);

    const numericAmount = Math.round(Number(amount));

    const payload: DebtInsert = {
      type,
      counterpart_name: counterpartName.trim(),
      amount: numericAmount,
      due_date: dueDate || null,
      note: note.trim() || null,
    };

    // Client-side validation
    const validation = validateDebtInput(payload);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const success = await onSubmit(payload, editingDebt?.id);
      if (success) {
        onClose();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const parsedAmount = Number(amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
              {isEditing ? 'Ubah Catatan Kasbon' : 'Catat Kasbon Baru'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEditing
                ? 'Perbarui rincian utang atau piutangmu'
                : 'Biar gak lupa siapa yang pinjam atau kamu yang pinjam'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Server error alert */}
        {serverError && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Tipe Radio (Saya dihutang / Saya hutang) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Tipe Kasbon <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  type === 'owed_to_me'
                    ? 'bg-emerald-50/80 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="debt_type"
                  value="owed_to_me"
                  checked={type === 'owed_to_me'}
                  onChange={() => setType('owed_to_me')}
                  className="sr-only"
                />
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    type === 'owed_to_me' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs sm:text-sm">Saya dihutang</div>
                  <div className="text-[10px] text-slate-500">Orang pinjam ke saya</div>
                </div>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  type === 'i_owe'
                    ? 'bg-rose-50/80 border-rose-500 text-rose-900 ring-2 ring-rose-500/20'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="debt_type"
                  value="i_owe"
                  checked={type === 'i_owe'}
                  onChange={() => setType('i_owe')}
                  className="sr-only"
                />
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    type === 'i_owe' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-xs sm:text-sm">Saya hutang</div>
                  <div className="text-[10px] text-slate-500">Saya pinjam ke orang</div>
                </div>
              </label>
            </div>
            {errors.type && <p className="mt-1 text-xs text-rose-600">{errors.type}</p>}
          </div>

          {/* Nama orang (text, wajib) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nama Orang <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={counterpartName}
              onChange={(e) => setCounterpartName(e.target.value)}
              placeholder="Contoh: Budi Prasetyo, Sarah, dll."
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white text-slate-900 transition-all ${
                errors.counterpart_name
                  ? 'border-rose-300 focus:ring-rose-500'
                  : 'border-slate-200 focus:ring-teal-500'
              }`}
            />
            {errors.counterpart_name && (
              <p className="mt-1 text-xs text-rose-600">{errors.counterpart_name}</p>
            )}
          </div>

          {/* Jumlah (number, wajib, dalam Rupiah) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Jumlah Nominal (Rp) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-500 pointer-events-none">
                Rp
              </span>
              <input
                type="number"
                required
                min="1"
                step="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50000"
                className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm tabular-nums focus:outline-none focus:ring-2 focus:bg-white text-slate-900 transition-all ${
                  errors.amount
                    ? 'border-rose-300 focus:ring-rose-500'
                    : 'border-slate-200 focus:ring-teal-500'
                }`}
              />
            </div>
            {/* Live Rupiah preview */}
            {!isNaN(parsedAmount) && parsedAmount > 0 && (
              <p className="mt-1 text-xs font-semibold text-teal-700 tabular-nums">
                Format: {formatRupiah(parsedAmount)}
              </p>
            )}
            {errors.amount && <p className="mt-1 text-xs text-rose-600">{errors.amount}</p>}
          </div>

          {/* Tanggal (default hari ini) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tanggal (Default Hari Ini)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900 transition-all"
            />
            {errors.due_date && <p className="mt-1 text-xs text-rose-600">{errors.due_date}</p>}
          </div>

          {/* Catatan (opsional, max 200 char) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Catatan (Opsional)
              </label>
              <span className={`text-[11px] ${note.length > 200 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                {note.length}/200
              </span>
            </div>
            <textarea
              rows={2}
              maxLength={200}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Contoh: Buat patungan makan siang bareng, beli token PLN, dll."
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:bg-white text-slate-900 transition-all ${
                errors.note
                  ? 'border-rose-300 focus:ring-rose-500'
                  : 'border-slate-200 focus:ring-teal-500'
              }`}
            />
            {errors.note && <p className="mt-1 text-xs text-rose-600">{errors.note}</p>}
          </div>

          {/* Submit & Cancel */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>{isEditing ? 'Simpan Perubahan' : 'Simpan Kasbon'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
