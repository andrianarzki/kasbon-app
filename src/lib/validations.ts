import { DebtInsert, DebtType } from '../types/database';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateDebtInput(input: Partial<DebtInsert>): ValidationResult {
  const errors: Record<string, string> = {};

  // 1. Tipe validasi
  if (!input.type) {
    errors.type = 'Pilih tipe catatan: Saya dihutang atau Saya hutang';
  } else if (input.type !== 'owed_to_me' && input.type !== 'i_owe') {
    errors.type = 'Tipe transaksi tidak valid';
  }

  // 2. Nama orang (text, wajib)
  if (!input.counterpart_name || input.counterpart_name.trim().length === 0) {
    errors.counterpart_name = 'Nama orang wajib diisi ya';
  } else if (input.counterpart_name.trim().length > 100) {
    errors.counterpart_name = 'Nama orang kepanjangan (maksimal 100 karakter)';
  }

  // 3. Jumlah (number, wajib, dalam Rupiah utuh > 0)
  if (input.amount === undefined || input.amount === null || isNaN(Number(input.amount))) {
    errors.amount = 'Nominal utang/piutang wajib diisi';
  } else {
    const num = Number(input.amount);
    if (!Number.isInteger(num)) {
      errors.amount = 'Nominal harus dalam Rupiah utuh (bukan desimal)';
    } else if (num <= 0) {
      errors.amount = 'Nominal harus lebih besar dari Rp 0';
    } else if (num > 9007199254740991) {
      errors.amount = 'Nominal melebihi batas sistem';
    }
  }

  // 4. Catatan (opsional, max 200 char)
  if (input.note && input.note.trim().length > 200) {
    errors.note = 'Catatan maksimal 200 karakter';
  }

  // 5. Due date format validation if present
  if (input.due_date && isNaN(Date.parse(input.due_date))) {
    errors.due_date = 'Format tanggal jatuh tempo tidak valid';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
