import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, UserPlus } from 'lucide-react';
import { Player, CardThemeId, GameConfig } from '../../types/game';
import { CARD_THEMES, PRESET_AVATARS } from '../../utils/avatars';
import { useTranslation } from '../../i18n/useTranslation';
import { formatNumber, parseInputToNumber } from '../../utils/formatters';

interface AddPlayerModalProps {
  isOpen: boolean;
  playerToEdit?: Player | null;
  config: GameConfig;
  onClose: () => void;
  onSave: (name: string, avatar: string, theme: CardThemeId, balance?: number) => void;
  onDelete?: (id: string) => void;
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  isOpen,
  playerToEdit,
  config,
  onClose,
  onSave,
  onDelete,
}) => {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🎩');
  const [theme, setTheme] = useState<CardThemeId>('gold');
  const [rawBalance, setRawBalance] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (playerToEdit) {
        setName(playerToEdit.name);
        setAvatar(playerToEdit.avatar);
        setTheme(playerToEdit.cardTheme);
        setRawBalance(formatNumber(playerToEdit.balance, config.thousandSeparator));
      } else {
        setName('');
        // Pick a default avatar that looks fresh
        setAvatar(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)].icon);
        const themeKeys = Object.keys(CARD_THEMES) as CardThemeId[];
        setTheme(themeKeys[Math.floor(Math.random() * themeKeys.length)]);
        setRawBalance(formatNumber(config.startingBalance, config.thousandSeparator));
      }
    }
  }, [isOpen, playerToEdit, config.startingBalance, config.thousandSeparator]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim();
    if (!finalName) return;

    const parsedBalance = rawBalance.trim() !== '' ? parseInputToNumber(rawBalance) : undefined;
    onSave(finalName, avatar, theme, parsedBalance);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <UserPlus className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {playerToEdit ? t.playerModal.titleEdit : t.playerModal.titleAdd}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Name Field */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              {t.playerModal.nameLabel}
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.playerModal.namePlaceholder}
              className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 text-sm font-semibold border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 placeholder-slate-500"
              required
            />
          </div>

          {/* Avatar Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              {t.playerModal.avatarLabel}
            </label>
            <div className="grid grid-cols-6 gap-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
              {PRESET_AVATARS.map((av) => (
                <button
                  key={av.id}
                  type="button"
                  onClick={() => setAvatar(av.icon)}
                  className={`h-11 rounded-xl text-xl flex items-center justify-center transition ${
                    avatar === av.icon
                      ? 'bg-amber-500/30 border-2 border-amber-400 scale-105'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  {av.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Card Theme Picker */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
              {t.playerModal.themeLabel}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {Object.values(CARD_THEMES).map((th) => (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => setTheme(th.id)}
                  className={`h-14 rounded-xl p-1.5 flex flex-col justify-between border text-left transition relative overflow-hidden bg-gradient-to-br ${th.bgGradient} ${
                    theme === th.id
                      ? 'ring-2 ring-white scale-105 shadow-md'
                      : 'opacity-70 hover:opacity-100 border-white/10'
                  }`}
                >
                  <span className="text-[10px] font-bold text-white truncate">
                    {th.name.split(' ')[0]}
                  </span>
                  {theme === th.id && (
                    <Check className="w-3.5 h-3.5 text-white ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Starting / Current Balance Field */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              {t.playerModal.initialBalance} ({config.currencySymbol})
            </label>
            <input
              type="text"
              value={rawBalance}
              onChange={(e) => setRawBalance(e.target.value)}
              className="w-full bg-slate-950 text-amber-400 font-mono text-sm font-bold rounded-xl px-3.5 py-2.5 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Delete Option (When editing) */}
          {playerToEdit && onDelete && (
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(t.playerModal.confirmDelete)) {
                    onDelete(playerToEdit.id);
                    onClose();
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t.playerModal.deletePlayer}</span>
              </button>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
            >
              {t.playerModal.cancel}
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
            >
              {t.playerModal.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
