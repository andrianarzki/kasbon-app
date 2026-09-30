'use client';

import React, { useState } from 'react';
import { Debt, GroupedDebt } from '@/types/database';
import { DebtItem } from './DebtItem';
import { formatRupiah } from '@/lib/formatters';
import { ChevronDown, ChevronUp, User, Wallet } from 'lucide-react';

interface DebtListProps {
  debts: Debt[];
  groupByPerson: boolean;
  onToggleSettle: (debt: Debt) => Promise<void>;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onOpenNewModal: () => void;
}

export function DebtList({
  debts,
  groupByPerson,
  onToggleSettle,
  onEdit,
  onDelete,
  onOpenNewModal,
}: DebtListProps) {
  // Collapsed state for groups
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroupCollapse = (name: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  if (debts.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 text-center border border-slate-200/80 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Belum ada catatan kasbon</h3>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Kamu belum mencatat utang atau piutang yang cocok dengan filter saat ini.
        </p>
        <button
          onClick={onOpenNewModal}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all"
        >
          + Catat Kasbon Pertama
        </button>
      </div>
    );
  }

  // If grouped by person (Bonus feature)
  if (groupByPerson) {
    const groupsMap = new Map<string, Debt[]>();
    for (const d of debts) {
      const existing = groupsMap.get(d.counterpart_name) || [];
      existing.push(d);
      groupsMap.set(d.counterpart_name, existing);
    }

    const grouped: GroupedDebt[] = Array.from(groupsMap.entries()).map(([name, groupDebts]) => {
      let totalAmount = 0;
      let netAmount = 0;
      for (const item of groupDebts) {
        totalAmount += item.amount;
        if (item.type === 'owed_to_me') {
          netAmount += item.amount;
        } else {
          netAmount -= item.amount;
        }
      }
      return {
        counterpart_name: name,
        totalAmount,
        netAmount,
        count: groupDebts.length,
        debts: groupDebts,
      };
    });

    return (
      <div className="space-y-4">
        {grouped.map((group) => {
          const isCollapsed = collapsedGroups[group.counterpart_name] ?? false;
          const isNetOwedToMe = group.netAmount > 0;
          const isNetOwe = group.netAmount < 0;

          return (
            <div
              key={group.counterpart_name}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden"
            >
              {/* Group Header Banner */}
              <button
                type="button"
                onClick={() => toggleGroupCollapse(group.counterpart_name)}
                className="w-full px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between border-b border-slate-200/60 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-sm">
                      {group.counterpart_name}
                    </span>
                    <span className="ml-2 text-xs text-slate-500 font-medium">
                      ({group.count} catatan, total {formatRupiah(group.totalAmount)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Net badge for group */}
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg tabular-nums ${
                      isNetOwedToMe
                        ? 'bg-emerald-100 text-emerald-800'
                        : isNetOwe
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Net: {formatRupiah(group.netAmount)}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Group items */}
              {!isCollapsed && (
                <div className="p-4 space-y-3">
                  {group.debts.map((debt) => (
                    <DebtItem
                      key={debt.id}
                      debt={debt}
                      onToggleSettle={onToggleSettle}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Standard flat list
  return (
    <div className="space-y-3">
      {debts.map((debt) => (
        <DebtItem
          key={debt.id}
          debt={debt}
          onToggleSettle={onToggleSettle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
