import React, { useState, useEffect } from 'react';
import {
  X,
  Settings as SettingsIcon,
  RotateCcw,
  Volume2,
  VolumeX,
  Languages,
  Check,
} from 'lucide-react';
import { GameConfig, ThousandSeparator } from '../../types/game';
import { useTranslation } from '../../i18n/useTranslation';
import { formatNumber, parseInputToNumber } from '../../utils/formatters';

interface SettingsModalProps {
  isOpen: boolean;
  config: GameConfig;
  onClose: () => void;
  onSaveConfig: (updates: Partial<GameConfig>) => void;
  onResetGame: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  config,
  onClose,
  onSaveConfig,
  onResetGame,
}) => {
  const { t, locale, setLocale } = useTranslation();

  const [title, setTitle] = useState(config.title);
  const [startingBalance, setStartingBalance] = useState(
    formatNumber(config.startingBalance, config.thousandSeparator)
  );
  const [passGoAmount, setPassGoAmount] = useState(
    formatNumber(config.passGoAmount, config.thousandSeparator)
  );
  const [currencySymbol, setCurrencySymbol] = useState(config.currencySymbol);
  const [thousandSeparator, setThousandSeparator] = useState<ThousandSeparator>(
    config.thousandSeparator
  );
  const [soundEnabled, setSoundEnabled] = useState(config.soundEnabled);

  useEffect(() => {
    if (isOpen) {
      setTitle(config.title);
      setStartingBalance(formatNumber(config.startingBalance, config.thousandSeparator));
      setPassGoAmount(formatNumber(config.passGoAmount, config.thousandSeparator));
      setCurrencySymbol(config.currencySymbol);
      setThousandSeparator(config.thousandSeparator);
      setSoundEnabled(config.soundEnabled);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleApplyPreset = (type: 'millions' | 'classic') => {
    if (type === 'millions') {
      setStartingBalance(formatNumber(15_000_000, thousandSeparator));
      setPassGoAmount(formatNumber(2_000_000, thousandSeparator));
    } else {
      setStartingBalance(formatNumber(1500, thousandSeparator));
      setPassGoAmount(formatNumber(200, thousandSeparator));
    }
  };

  const handleSave = () => {
    const parsedStart = parseInputToNumber(startingBalance);
    const parsedPassGo = parseInputToNumber(passGoAmount);

    onSaveConfig({
      title: title.trim() || 'TycoonBank',
      locale,
      startingBalance: parsedStart > 0 ? parsedStart : config.startingBalance,
      passGoAmount: parsedPassGo > 0 ? parsedPassGo : config.passGoAmount,
      currencySymbol,
      thousandSeparator,
      soundEnabled,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {t.settings.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm">
          {/* Language Selector */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-amber-400" />
              <span>{t.settings.language}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLocale('de')}
                className={`py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition ${
                  locale === 'de'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>🇩🇪 Deutsch</span>
                {locale === 'de' && <Check className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={`py-2 px-3 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 border transition ${
                  locale === 'en'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <span>🇬🇧 English</span>
                {locale === 'en' && <Check className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Game Title */}
          <div>
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
              {t.settings.gameTitle}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          {/* Rule Presets */}
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset('millions')}
                className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition"
              >
                🔥 {t.settings.presetMillions}
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('classic')}
                className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-left transition"
              >
                🎲 {t.settings.presetClassic}
              </button>
            </div>
          </div>

          {/* Starting Capital & Pass GO amounts */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                {t.settings.startingBalance}
              </label>
              <input
                type="text"
                value={startingBalance}
                onChange={(e) => setStartingBalance(e.target.value)}
                className="w-full bg-slate-950 text-amber-400 font-mono font-bold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                {t.settings.passGoAmount}
              </label>
              <input
                type="text"
                value={passGoAmount}
                onChange={(e) => setPassGoAmount(e.target.value)}
                className="w-full bg-slate-950 text-amber-400 font-mono font-bold rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Formatting: Currency Symbol & Thousands Separator */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                {t.settings.currencySymbol}
              </label>
              <select
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                <option value="€">€ (Euro)</option>
                <option value="$">$ (Dollar)</option>
                <option value="£">£ (Pound)</option>
                <option value="ℳ">ℳ (Monopoly)</option>
                <option value="CHF">CHF (Franc)</option>
                <option value="kr">kr (Krone)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                {t.settings.thousandSeparator}
              </label>
              <select
                value={thousandSeparator}
                onChange={(e) => setThousandSeparator(e.target.value as ThousandSeparator)}
                className="w-full bg-slate-950 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              >
                <option value=".">2.000.000 (Dot - DE/EU)</option>
                <option value=",">2,000,000 (Comma - US/UK)</option>
              </select>
            </div>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-5 h-5 text-amber-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <span className="text-xs font-semibold text-slate-200">
                {t.settings.soundEffects}
              </span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Reset Game Section */}
          <div className="pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                if (window.confirm(t.settings.confirmReset)) {
                  onResetGame();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-800/40 transition active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t.settings.resetGame}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
          >
            {t.transfer.cancel}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 active:scale-95 transition"
          >
            {t.settings.save}
          </button>
        </div>
      </div>
    </div>
  );
};
