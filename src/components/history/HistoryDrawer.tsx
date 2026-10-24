import React from 'react';
import {
  X,
  RotateCcw,
  Trash2,
  Download,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Transaction, GameConfig } from '../../types/game';
import { useTranslation } from '../../i18n/useTranslation';
import { formatCurrency } from '../../utils/formatters';

interface HistoryDrawerProps {
  isOpen: boolean;
  transactions: Transaction[];
  config: GameConfig;
  onClose: () => void;
  onUndo: (transactionId: string) => void;
  onClear: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  transactions,
  config,
  onClose,
  onUndo,
  onClear,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const header = 'ID,Date,From,To,Amount,Type,Description,Undone\n';
    const rows = transactions
      .map((tx) =>
        [
          tx.id,
          new Date(tx.timestamp).toISOString(),
          `"${tx.fromName}"`,
          `"${tx.toName}"`,
          tx.amount,
          tx.type,
          `"${tx.description}"`,
          tx.isUndone ? 'true' : 'false',
        ].join(',')
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tycoonbank_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-400" />
            <h2 className="font-bold text-white text-base sm:text-lg">
              {t.history.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="px-5 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            {transactions.length} {t.history.title.toLowerCase()}
          </span>
          <div className="flex items-center gap-2">
            {transactions.length > 0 && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1 text-slate-300 hover:text-white px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{t.history.exportCSV}</span>
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(t.history.confirmClear)) {
                      onClear();
                    }
                  }}
                  className="flex items-center gap-1 text-rose-400 hover:text-rose-300 px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/40 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.history.clearLedger}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Transactions List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {transactions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Clock className="w-12 h-12 stroke-[1.5] mb-2 opacity-40" />
              <p className="text-sm">{t.history.noTransactions}</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  tx.isUndone
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-50 line-through'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                  <span className="font-mono text-[11px]">{formatTime(tx.timestamp)}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                    {tx.description}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    <span className="truncate max-w-[90px]">{tx.fromName}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate max-w-[90px]">{tx.toName}</span>
                  </div>

                  <div className="text-right">
                    <div
                      className={`font-mono text-sm font-bold ${
                        tx.isUndone ? 'text-slate-500' : 'text-amber-400'
                      }`}
                    >
                      {formatCurrency(tx.amount, config.currencySymbol, config.thousandSeparator)}
                    </div>
                  </div>
                </div>

                {/* Undo Action */}
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  {tx.isUndone ? (
                    <span className="text-[11px] font-bold text-slate-500 italic">
                      ({t.history.undone})
                    </span>
                  ) : (
                    <button
                      onClick={() => onUndo(tx.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-300 hover:text-white bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 transition active:scale-95"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.history.undo}</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
