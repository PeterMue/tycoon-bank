import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  X,
  Check,
  AlertCircle,
  Delete,
} from 'lucide-react';
import { Player, GameConfig, BANK_ID, TransactionType } from '../../types/game';
import { useTranslation } from '../../i18n/useTranslation';
import {
  formatNumber,
  formatCurrency,
  parseInputToNumber,
  numberToWordsPreview,
  formatCompact,
} from '../../utils/formatters';

interface TransferModalProps {
  isOpen: boolean;
  initialFromId?: string;
  initialToId?: string;
  initialAmount?: number;
  initialType?: TransactionType;
  players: Player[];
  config: GameConfig;
  onClose: () => void;
  onConfirm: (fromId: string, toId: string, amount: number, description: string, type: TransactionType) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  isOpen,
  initialFromId = BANK_ID,
  initialToId,
  initialAmount = 0,
  initialType = 'TRANSFER',
  players,
  config,
  onClose,
  onConfirm,
}) => {
  const { t, locale } = useTranslation();

  const [fromId, setFromId] = useState<string>(initialFromId);
  const [toId, setToId] = useState<string>(
    initialToId || (players.length > 0 ? players[0].id : BANK_ID)
  );

  // Raw input string typed by user
  const [rawInput, setRawInput] = useState<string>(
    initialAmount > 0 ? initialAmount.toString() : ''
  );
  const [numericAmount, setNumericAmount] = useState<number>(initialAmount);
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setFromId(initialFromId || BANK_ID);
      setToId(initialToId || (players.length > 0 ? (players[0].id !== initialFromId ? players[0].id : players[1]?.id || BANK_ID) : BANK_ID));
      const initAmt = initialAmount > 0 ? initialAmount : 0;
      setNumericAmount(initAmt);
      setRawInput(initAmt > 0 ? formatNumber(initAmt, config.thousandSeparator) : '');
      setSelectedReason(initialType === 'PASS_GO' ? t.transfer.reasons.passGo : '');
      setCustomNote('');
    }
  }, [isOpen, initialFromId, initialToId, initialAmount, initialType, players, config.thousandSeparator, t.transfer.reasons.passGo]);

  if (!isOpen) return null;

  const fromIsBank = fromId === BANK_ID;
  const toIsBank = toId === BANK_ID;
  const fromPlayer = fromIsBank ? null : players.find((p) => p.id === fromId);
  const toPlayer = toIsBank ? null : players.find((p) => p.id === toId);

  // Swap sender and recipient
  const handleSwap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  // Direct keypad number tap
  const handleDigitTap = (digit: string) => {
    let next = rawInput;
    if (next === '0' && digit !== '.' && digit !== ',') {
      next = digit;
    } else {
      next = next + digit;
    }
    setRawInput(next);
    const parsed = parseInputToNumber(next);
    setNumericAmount(parsed);
  };

  // Shortcut multiplier tap: e.g. typing "2" and clicking "Mio" completes to "2.000.000"
  const handleMultiplierTap = (unit: 'k' | 'Tsd' | 'Mio' | 'M' | 'Mrd' | 'B') => {
    // If rawInput has a value, parse it with the multiplier
    const baseValue = rawInput.trim() !== '' ? rawInput : '1';
    const computed = parseInputToNumber(baseValue, unit);
    setNumericAmount(computed);
    setRawInput(formatNumber(computed, config.thousandSeparator));
  };

  // Quick increment pill tap: +100k, +500k, +1M, +2M
  const handleQuickAdd = (addVal: number) => {
    const nextAmount = numericAmount + addVal;
    setNumericAmount(nextAmount);
    setRawInput(formatNumber(nextAmount, config.thousandSeparator));
  };

  // All-In button: sender gives all remaining balance
  const handleAllIn = () => {
    if (fromPlayer && fromPlayer.balance > 0) {
      setNumericAmount(fromPlayer.balance);
      setRawInput(formatNumber(fromPlayer.balance, config.thousandSeparator));
    }
  };

  // Clear button
  const handleClear = () => {
    setRawInput('');
    setNumericAmount(0);
  };

  // Backspace button
  const handleBackspace = () => {
    if (rawInput.length <= 1) {
      handleClear();
      return;
    }
    const next = rawInput.slice(0, -1);
    setRawInput(next);
    setNumericAmount(parseInputToNumber(next));
  };

  const handleConfirm = () => {
    if (numericAmount <= 0) return;
    if (fromId === toId) return;

    const note = customNote.trim() || selectedReason || t.transfer.reasons.other;
    let type: TransactionType = 'TRANSFER';
    if (fromIsBank && toPlayer) {
      type = note === t.transfer.reasons.passGo ? 'PASS_GO' : 'BANK_WITHDRAW';
    } else if (toIsBank && fromPlayer) {
      type = note === t.transfer.reasons.tax ? 'TAX' : 'BANK_DEPOSIT';
    }

    onConfirm(fromId, toId, numericAmount, note, type);
    onClose();
  };

  const isInsufficient = !fromIsBank && fromPlayer && fromPlayer.balance < numericAmount;
  const isSameParty = fromId === toId;
  const isValid = numericAmount > 0 && !isSameParty;

  // Preset reason buttons
  const reasonsList = [
    { label: t.transfer.reasons.passGo, icon: '🌟' },
    { label: t.transfer.reasons.rent, icon: '🏠' },
    { label: t.transfer.reasons.property, icon: '🏢' },
    { label: t.transfer.reasons.tax, icon: '⚖️' },
    { label: t.transfer.reasons.jail, icon: '🗝️' },
    { label: t.transfer.reasons.trade, icon: '🤝' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {t.transfer.title}
              </h2>
              <p className="text-xs text-slate-400">
                {fromIsBank ? t.bank.payoutFromBank : toIsBank ? t.bank.depositToBank : 'Player Transfer'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Parties Selector: From -> To */}
          <div className="flex items-center gap-2">
            {/* Sender (From) */}
            <div className="flex-1 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {t.transfer.sender}
              </label>
              <select
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="w-full bg-slate-900 text-white text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={BANK_ID}>🏦 {t.bank.vaultTitle}</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.avatar} {p.name} ({formatCompact(p.balance, locale)})
                  </option>
                ))}
              </select>
              {fromPlayer && (
                <div className="mt-1 text-[11px] text-slate-400 font-mono">
                  {t.card.accountBalance}:{' '}
                  <span className={fromPlayer.balance < 0 ? 'text-rose-400' : 'text-slate-200'}>
                    {formatCurrency(fromPlayer.balance, config.currencySymbol, config.thousandSeparator)}
                  </span>
                </div>
              )}
            </div>

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              title="Swap From and To"
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 shadow transition active:scale-90"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>

            {/* Recipient (To) */}
            <div className="flex-1 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                {t.transfer.recipient}
              </label>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full bg-slate-900 text-white text-sm font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value={BANK_ID}>🏦 {t.bank.vaultTitle}</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.avatar} {p.name} ({formatCompact(p.balance, locale)})
                  </option>
                ))}
              </select>
              {toPlayer && (
                <div className="mt-1 text-[11px] text-slate-400 font-mono">
                  {t.card.accountBalance}:{' '}
                  <span className="text-slate-200">
                    {formatCurrency(toPlayer.balance, config.currencySymbol, config.thousandSeparator)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Validation Error Alerts */}
          {isSameParty && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t.transfer.samePlayerError}</span>
            </div>
          )}

          {isInsufficient && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{t.transfer.insufficientFunds}</span>
            </div>
          )}

          {/* Main Display: Amount Display + Human Spoken Words */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center shadow-inner">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t.transfer.amount}
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-amber-400">
                {numericAmount > 0
                  ? formatCurrency(numericAmount, config.currencySymbol, config.thousandSeparator)
                  : `0 ${config.currencySymbol}`}
              </div>
            </div>
            {/* Spoken words preview: e.g. "2 Millionen" */}
            <div className="mt-1 text-xs font-semibold text-slate-400">
              ≈ {numberToWordsPreview(numericAmount, locale)}
            </div>
          </div>

          {/* Shortcut Multiplier Buttons: k / Tsd, Mio, Mrd / B */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Unit Shortcuts (e.g. type 2 + click Mio)</span>
              {fromPlayer && fromPlayer.balance > 0 && (
                <button
                  onClick={handleAllIn}
                  className="text-amber-400 hover:text-amber-300 underline font-semibold normal-case"
                >
                  {t.transfer.allIn} ({formatCompact(fromPlayer.balance, locale)})
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleMultiplierTap(locale === 'de' ? 'Tsd' : 'k')}
                className="py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-slate-800 to-slate-700 hover:from-amber-600 hover:to-amber-500 text-white border border-slate-600 transition shadow-sm active:scale-95"
              >
                × {t.transfer.quickMultipliers.thousand} (1.000)
              </button>
              <button
                type="button"
                onClick={() => handleMultiplierTap('Mio')}
                className="py-2.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 border border-amber-400 transition shadow-md shadow-amber-500/20 active:scale-95"
              >
                × {t.transfer.quickMultipliers.million} (1.000.000)
              </button>
              <button
                type="button"
                onClick={() => handleMultiplierTap(locale === 'de' ? 'Mrd' : 'B')}
                className="py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-slate-800 to-slate-700 hover:from-amber-600 hover:to-amber-500 text-white border border-slate-600 transition shadow-sm active:scale-95"
              >
                × {t.transfer.quickMultipliers.billion} (1.000.000.000)
              </button>
            </div>
          </div>

          {/* Quick Increment Pills: +100k, +500k, +1M, +2M */}
          <div className="flex flex-wrap items-center gap-1.5">
            {config.quickAmounts.map((qVal) => (
              <button
                key={qVal}
                type="button"
                onClick={() => handleQuickAdd(qVal)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition active:scale-95"
              >
                +{formatCompact(qVal, locale)}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800 transition active:scale-95 ml-auto"
            >
              {t.transfer.clear}
            </button>
          </div>

          {/* Touch-Friendly Numeric Keypad */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950/60 p-2 rounded-2xl border border-slate-800">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigitTap(digit)}
                className="py-3 text-lg font-bold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700/60 active:scale-95 transition"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleDigitTap('.')}
              className="py-3 text-lg font-bold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700/60 active:scale-95 transition"
            >
              .
            </button>
            <button
              type="button"
              onClick={() => handleDigitTap('0')}
              className="py-3 text-lg font-bold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white border border-slate-700/60 active:scale-95 transition"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 text-lg font-bold rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-400 border border-slate-700/60 active:scale-95 transition flex items-center justify-center"
            >
              <Delete className="w-5 h-5" />
            </button>
          </div>

          {/* Reason / Category Pills */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              {t.transfer.reason}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {reasonsList.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setSelectedReason(item.label)}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
                    selectedReason === item.label
                      ? 'bg-amber-400 text-slate-950 font-bold shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder={t.transfer.optionalNote}
              className="mt-2 w-full bg-slate-950 text-white text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            {t.transfer.cancel}
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span>{t.transfer.confirmTransfer}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
