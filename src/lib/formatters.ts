/**
 * Format number to Rupiah with strict id-ID locale: 'Rp 1.234.000'
 * Strictly satisfies constraint: format Rupiah pakai locale id-ID (Rp 1.234.000, bukan Rp 1234000 atau IDR 1,234,000).
 */
export function formatRupiah(amount: number): string {
  const safeAmount = Math.round(Number(amount) || 0);
  const formattedNumber = new Intl.NumberFormat('id-ID').format(Math.abs(safeAmount));
  const sign = safeAmount < 0 ? '-' : '';
  return `${sign}Rp ${formattedNumber}`;
}

/**
 * Format date string to casual Indonesian relative time:
 * "hari ini", "kemarin", "3 hari lalu", "2 minggu lalu", "besok", etc.
 */
export function formatRelativeTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';

  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  const now = new Date();
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diffDays = Math.round((startOfDate - startOfNow) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'hari ini';
  if (diffDays === -1) return 'kemarin';
  if (diffDays === 1) return 'besok';

  if (diffDays < 0) {
    const daysAgo = Math.abs(diffDays);
    if (daysAgo < 7) {
      return `${daysAgo} hari lalu`;
    }
    const weeksAgo = Math.floor(daysAgo / 7);
    if (weeksAgo < 4) {
      return `${weeksAgo} minggu lalu`;
    }
    const monthsAgo = Math.floor(daysAgo / 30);
    if (monthsAgo < 12) {
      return `${monthsAgo} bulan lalu`;
    }
    const yearsAgo = Math.floor(daysAgo / 365);
    return `${yearsAgo} tahun lalu`;
  } else {
    if (diffDays < 7) {
      return `${diffDays} hari lagi`;
    }
    const weeksLater = Math.floor(diffDays / 7);
    if (weeksLater < 4) {
      return `${weeksLater} minggu lagi`;
    }
    const monthsLater = Math.floor(diffDays / 30);
    return `${monthsLater} bulan lagi`;
  }
}

/**
 * Formats date into readable Indonesian date: "24 Okt 2024"
 */
export function formatIndonesianDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '-';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Polite Indonesian WhatsApp reminder generator for casual & friendly debt reminders.
 */
export function generatePoliteWhatsAppMessage(
  counterpartName: string,
  amount: number,
  note?: string | null,
  dueDate?: string | null
): string {
  const formattedNominal = formatRupiah(amount);
  const purpose = note ? ` untuk keperluan ${note}` : '';
  const dueInfo = dueDate ? ` yang temponya ${formatIndonesianDate(dueDate)}` : '';

  return `Halo ${counterpartName}! 👋 Ngingetin santai ya terkait kasbon ${formattedNominal}${purpose}${dueInfo}. Kalo pas senggang dan sempat boleh dikabari yaa. Makasih banyak sebelumnya! 🙏✨`;
}
