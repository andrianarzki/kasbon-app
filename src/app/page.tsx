'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Debt, DebtInsert, FilterStatus, FilterType, SortOption } from '@/types/database';
import { Navbar } from '@/components/Navbar';
import { SummaryCards } from '@/components/SummaryCards';
import { ComparisonChart } from '@/components/ComparisonChart';
import { DebtFilters } from '@/components/DebtFilters';
import { DebtList } from '@/components/DebtList';
import { DebtFormModal } from '@/components/DebtFormModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { AlertCircle, RefreshCw, KeyRound, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // User state
  const [userEmail, setUserEmail] = useState<string>('');
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  // Debts state
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [typeFilter, setTypeFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('date_desc');
  const [groupByPerson, setGroupByPerson] = useState<boolean>(false);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deletingDebt, setDeletingDebt] = useState<Debt | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Check auth
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // If no user and env vars are configured, redirect to login
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
          router.push('/login');
          return;
        }
      } else {
        setUserEmail(user.email || 'Pengguna');
      }
      setAuthChecked(true);
    };

    checkUser();
  }, [router, supabase]);

  // Fetch debts from API endpoint /api/debts
  const fetchDebts = useCallback(async () => {
    setLoading(true);
    setFetchError(null);

    try {
      const res = await fetch('/api/debts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.status === 401) {
        router.push('/login');
        return;
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || `Gagal mengambil data (Kode ${res.status})`);
      }

      const data: Debt[] = await res.json();
      setDebts(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat catatan kasbon';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (authChecked) {
      fetchDebts();
    }
  }, [authChecked, fetchDebts]);

  // Handle Mark Lunas / Batalkan Lunas (Idempotent toggle via PATCH /api/debts/[id])
  const handleToggleSettle = async (debt: Debt) => {
    const newSettledAt = debt.settled_at ? null : new Date().toISOString();

    try {
      const res = await fetch(`/api/debts/${debt.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settled_at: newSettledAt,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || 'Gagal mengubah status lunas');
      }

      const updated: Debt = await res.json();
      setDebts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

      if (newSettledAt) {
        showToast(`Kasbon dengan ${debt.counterpart_name} berhasil ditandai lunas! 🎉`);
      } else {
        showToast(`Status lunas kasbon dengan ${debt.counterpart_name} dibatalkan.`);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengubah status';
      alert(msg);
    }
  };

  // Handle Create or Update
  const handleFormSubmit = async (data: DebtInsert, id?: string): Promise<boolean> => {
    try {
      if (id) {
        // Edit existing
        const res = await fetch(`/api/debts/${id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          throw new Error(errJson?.error || 'Gagal memperbarui kasbon');
        }

        const updated: Debt = await res.json();
        setDebts((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
        showToast(`Catatan kasbon dengan ${updated.counterpart_name} diperbarui!`);
      } else {
        // Create new
        const res = await fetch('/api/debts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const errJson = await res.json().catch(() => null);
          throw new Error(errJson?.error || 'Gagal membuat catatan baru');
        }

        const created: Debt = await res.json();
        setDebts((prev) => [created, ...prev]);
        showToast(`Kasbon baru dengan ${created.counterpart_name} berhasil dicatat!`);
      }

      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal memproses form';
      throw new Error(msg);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingDebt) return;
    setDeleteLoading(true);

    try {
      const res = await fetch(`/api/debts/${deletingDebt.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(errJson?.error || 'Gagal menghapus kasbon');
      }

      setDebts((prev) => prev.filter((d) => d.id !== deletingDebt.id));
      showToast(`Catatan kasbon dengan ${deletingDebt.counterpart_name} dihapus.`);
      setDeletingDebt(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus';
      alert(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setIsFormModalOpen(true);
  };

  // Calculate Summaries from active (unsettled) debts
  const { totalOwedToMe, totalIOwe, netBalance, unsettledOwedCount, unsettledOweCount } =
    useMemo(() => {
      let owed = 0;
      let owe = 0;
      let countOwed = 0;
      let countOwe = 0;

      for (const d of debts) {
        if (!d.settled_at) {
          if (d.type === 'owed_to_me') {
            owed += d.amount;
            countOwed += 1;
          } else {
            owe += d.amount;
            countOwe += 1;
          }
        }
      }

      return {
        totalOwedToMe: owed,
        totalIOwe: owe,
        netBalance: owed - owe,
        unsettledOwedCount: countOwed,
        unsettledOweCount: countOwe,
      };
    }, [debts]);

  // Filtered & Sorted debts
  const filteredDebts = useMemo(() => {
    return debts
      .filter((d) => {
        // Status filter
        if (statusFilter === 'unsettled' && d.settled_at !== null) return false;
        if (statusFilter === 'settled' && d.settled_at === null) return false;

        // Type filter
        if (typeFilter !== 'all' && d.type !== typeFilter) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = d.counterpart_name.toLowerCase().includes(q);
          const matchNote = d.note ? d.note.toLowerCase().includes(q) : false;
          if (!matchName && !matchNote) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'date_desc') {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        if (sortOption === 'date_asc') {
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        }
        if (sortOption === 'amount_desc') {
          return b.amount - a.amount;
        }
        if (sortOption === 'amount_asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
  }, [debts, statusFilter, typeFilter, searchQuery, sortOption]);

  const isSupabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Navbar Header */}
      <Navbar
        userEmail={userEmail}
        onOpenNewModal={() => {
          setEditingDebt(null);
          setIsFormModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Notice banner if Supabase URL is not yet populated */}
        {!isSupabaseConfigured && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 shadow-sm flex items-start gap-3">
            <KeyRound className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <strong className="font-bold">Konfigurasi Supabase Diperlukan:</strong>
              <p className="mt-1 text-amber-800 leading-relaxed">
                Silakan isi variabel <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> dan <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di file <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-xs">.env.local</code>. Panduan lengkap dan skema SQL tersedia di file <code className="bg-amber-100 px-1.5 py-0.5 rounded text-amber-900 font-mono text-xs">WALKTHROUGH.md</code>.
              </p>
            </div>
          </div>
        )}

        {/* 1. Summary Cards (Wajib: Total dihutang ke saya, Total saya hutang, Net hijau/merah) */}
        <SummaryCards
          totalOwedToMe={totalOwedToMe}
          totalIOwe={totalIOwe}
          netBalance={netBalance}
          unsettledOwedCount={unsettledOwedCount}
          unsettledOweCount={unsettledOweCount}
        />

        {/* Bonus: Bar Chart Comparison */}
        <ComparisonChart totalOwedToMe={totalOwedToMe} totalIOwe={totalIOwe} />

        {/* 2. Filters & Controls */}
        <DebtFilters
          status={statusFilter}
          onStatusChange={setStatusFilter}
          type={typeFilter}
          onTypeChange={setTypeFilter}
          search={searchQuery}
          onSearchChange={setSearchQuery}
          sort={sortOption}
          onSortChange={setSortOption}
          groupByPerson={groupByPerson}
          onGroupByPersonChange={setGroupByPerson}
          onOpenNewModal={() => {
            setEditingDebt(null);
            setIsFormModalOpen(true);
          }}
        />

        {/* Fetch Error Alert */}
        {fetchError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{fetchError}</span>
            </div>
            <button
              onClick={fetchDebts}
              className="px-3 py-1.5 rounded-xl bg-white border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Coba Lagi</span>
            </button>
          </div>
        )}

        {/* 3. Debt List with Empty & Loading states */}
        {loading ? (
          <LoadingSkeleton />
        ) : (
          <DebtList
            debts={filteredDebts}
            groupByPerson={groupByPerson}
            onToggleSettle={handleToggleSettle}
            onEdit={handleOpenEdit}
            onDelete={(d) => setDeletingDebt(d)}
            onOpenNewModal={() => {
              setEditingDebt(null);
              setIsFormModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Modals */}
      <DebtFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingDebt(null);
        }}
        onSubmit={handleFormSubmit}
        editingDebt={editingDebt}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingDebt)}
        debt={deletingDebt}
        onClose={() => setDeletingDebt(null)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-8 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2.5 text-xs sm:text-sm animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
