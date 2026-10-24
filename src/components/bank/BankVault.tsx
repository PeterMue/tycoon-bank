import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Landmark, ArrowUpRight, ArrowDownLeft, Infinity } from 'lucide-react';
import { BANK_ID, GameConfig } from '../../types/game';
import { useTranslation } from '../../i18n/useTranslation';
import { formatCurrency } from '../../utils/formatters';

interface BankVaultProps {
  config: GameConfig;
  circulatingSupply: number;
  onInitiatePayout: () => void;
  onInitiateDeposit: () => void;
  isDropTargetActive?: boolean;
}

export const BankVault: React.FC<BankVaultProps> = ({
  config,
  circulatingSupply,
  onInitiatePayout,
  onInitiateDeposit,
}) => {
  const { t } = useTranslation();

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: BANK_ID,
    data: { type: 'BANK' },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: BANK_ID,
    data: { type: 'BANK' },
  });

  // Combine refs for both draggable and droppable
  const setCombinedRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-3 select-none">
      {/* Central Vault Container */}
      <div
        ref={setCombinedRef}
        {...attributes}
        {...listeners}
        className={`relative group cursor-grab active:cursor-grabbing w-52 sm:w-60 h-52 sm:h-60 rounded-full flex flex-col items-center justify-center text-center p-4 transition-all duration-300 shadow-2xl ${
          isOver
            ? 'ring-4 ring-amber-400 bg-amber-950/70 scale-105 shadow-amber-500/50'
            : isDragging
            ? 'opacity-40 scale-95'
            : 'bg-gradient-to-b from-slate-900 via-slate-950 to-zinc-950 hover:border-amber-400/50 hover:shadow-amber-500/20'
        } border-4 border-amber-500/40`}
      >
        {/* Outer Vault Rivets Ring */}
        <div className="absolute inset-1.5 rounded-full border border-dashed border-amber-400/30 pointer-events-none" />

        {/* Shimmer overlay */}
        <div className="absolute inset-0 rounded-full animate-shimmer pointer-events-none opacity-30" />

        {/* Vault Dial Graphics */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/30 border-2 border-yellow-200">
            <Landmark className="w-7 h-7 sm:w-8 sm:h-8 text-slate-950" />
          </div>

          <h3 className="mt-2 text-sm sm:text-base font-extrabold tracking-wide text-amber-200 uppercase">
            {t.bank.vaultTitle}
          </h3>

          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400/90 mt-0.5">
            <Infinity className="w-3.5 h-3.5" />
            <span>{t.bank.infiniteReserve}</span>
          </div>

          {/* Table money stats */}
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-[10px] sm:text-xs text-slate-300 font-mono">
            {formatCurrency(circulatingSupply, config.currencySymbol, config.thousandSeparator)}
          </div>
        </div>

        {/* Hover / Drop Hint */}
        <div className="absolute -bottom-7 text-[10px] font-medium text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-full border border-slate-800 shadow pointer-events-none whitespace-nowrap">
          {isOver ? t.bank.dropToDeposit : t.bank.dragToPay}
        </div>
      </div>

      {/* Quick Action Tap Buttons */}
      <div className="mt-9 flex items-center gap-2">
        <button
          onClick={onInitiatePayout}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition active:scale-95 shadow-sm"
        >
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span>{t.bank.payoutFromBank}</span>
        </button>

        <button
          onClick={onInitiateDeposit}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 transition active:scale-95 shadow-sm"
        >
          <ArrowDownLeft className="w-3.5 h-3.5" />
          <span>{t.bank.depositToBank}</span>
        </button>
      </div>
    </div>
  );
};
