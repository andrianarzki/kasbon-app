'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Wallet, LogOut, Plus, ShieldCheck, User } from 'lucide-react';
import { LogoutConfirmModal } from './LogoutConfirmModal';

interface NavbarProps {
  userEmail: string;
  onOpenNewModal: () => void;
}

export function Navbar({ userEmail, onOpenNewModal }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setLogoutLoading(false);
      setIsLogoutModalOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                    Kasbon
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200/60">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    Supabase RLS
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-slate-500">
                  Pencatatan Utang Piutang Pribadi
                </p>
              </div>
            </div>

            {/* Right Action buttons */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* New Debt Button */}
              <button
                onClick={onOpenNewModal}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Catat Baru</span>
              </button>

              {/* User info & Logout */}
              <div className="flex items-center pl-2 sm:pl-3 border-l border-slate-200 gap-2">
                <div className="hidden md:flex items-center gap-2 bg-slate-100/80 py-1.5 px-3 rounded-xl text-xs font-medium text-slate-700">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="max-w-[140px] truncate">{userEmail}</span>
                </div>

                <button
                  onClick={() => setIsLogoutModalOpen(true)}
                  title="Keluar akun"
                  className="p-2 sm:px-3 sm:py-2 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        loading={logoutLoading}
      />
    </>
  );
}
