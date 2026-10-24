import React, { useState } from 'react';
import {
  Coins,
  Users,
  PlusCircle,
  History,
  Settings,
  Share2,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  LayoutGrid,
  CircleDot,
  Languages,
} from 'lucide-react';
import { useTranslation } from '../../i18n/useTranslation';
import { GameConfig } from '../../types/game';
import { formatCurrency } from '../../utils/formatters';

interface HeaderProps {
  config: GameConfig;
  playerCount: number;
  circulatingSupply: number;
  transactionCount: number;
  viewMode: 'table' | 'grid';
  onToggleViewMode: () => void;
  onOpenAddPlayer: () => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  onOpenShare: () => void;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  playerCount,
  circulatingSupply,
  transactionCount,
  viewMode,
  onToggleViewMode,
  onOpenAddPlayer,
  onOpenHistory,
  onOpenSettings,
  onOpenShare,
  onToggleSound,
}) => {
  const { t, locale, toggleLocale } = useTranslation();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* App Title & Branding */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-300/40 font-bold text-slate-950 text-xl tracking-tighter">
            ℳ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
                {config.title || t.app.title}
              </h1>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-400">
              {t.app.subtitle}
            </p>
          </div>
        </div>

        {/* Live Circulation & Player Stats Pill */}
        <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">{t.app.circulatingSupply}:</span>
            <span className="font-mono font-semibold text-amber-300">
              {formatCurrency(circulatingSupply, config.currencySymbol, config.thousandSeparator)}
            </span>
          </div>
          <div className="w-px h-3.5 bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">{t.app.playersCount}:</span>
            <span className="font-semibold text-sky-300">{playerCount}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Switcher */}
          <button
            onClick={toggleLocale}
            title={locale === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{locale === 'de' ? 'DE 🇩🇪' : 'EN 🇬🇧'}</span>
          </button>

          {/* Table / Grid Mode Toggle */}
          <button
            onClick={onToggleViewMode}
            title={viewMode === 'table' ? t.nav.gridMode : t.nav.tableMode}
            className="p-2 rounded-lg text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
          >
            {viewMode === 'table' ? (
              <LayoutGrid className="w-4 h-4 text-emerald-400" />
            ) : (
              <CircleDot className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Add Player Button */}
          <button
            onClick={onOpenAddPlayer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-md shadow-amber-500/10 transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t.nav.addPlayer}</span>
          </button>

          {/* History / Ledger Button */}
          <button
            onClick={onOpenHistory}
            title={t.nav.history}
            className="relative p-2 rounded-lg text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
          >
            <History className="w-4 h-4 text-sky-400" />
            {transactionCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-sky-500 text-slate-950 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {transactionCount > 99 ? '99+' : transactionCount}
              </span>
            )}
          </button>

          {/* Share Game Button */}
          <button
            onClick={onOpenShare}
            title={t.nav.share}
            className="p-2 rounded-lg text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
          >
            <Share2 className="w-4 h-4 text-purple-400" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={config.soundEnabled ? t.nav.soundOn : t.nav.soundOff}
            className="p-2 rounded-lg text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
          >
            {config.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-yellow-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Fullscreen (iPad / Tablet friendly) */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? t.nav.exitFullscreen : t.nav.fullscreen}
            className="hidden sm:inline-flex p-2 rounded-lg text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            title={t.nav.settings}
            className="p-2 rounded-lg text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </div>
    </header>
  );
};
