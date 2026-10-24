import React from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import {
  RotateCcw,
  Edit2,
  ArrowRightLeft,
  Sparkles,
  Wifi,
  Skull,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Player, GameConfig } from '../../types/game';
import { CARD_THEMES } from '../../utils/avatars';
import { useTranslation } from '../../i18n/useTranslation';
import { formatCurrency, formatCompact } from '../../utils/formatters';

interface PlayerCardProps {
  player: Player;
  config: GameConfig;
  isTopSlot?: boolean;
  disableRotation?: boolean;
  onInitiateTransfer: (player: Player) => void;
  onPassGo: (playerId: string) => void;
  onEdit: (player: Player) => void;
  onRotate: (playerId: string) => void;
  onToggleBankrupt: (playerId: string) => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  config,
  isTopSlot = false,
  disableRotation = false,
  onInitiateTransfer,
  onPassGo,
  onEdit,
  onRotate,
  onToggleBankrupt,
}) => {
  const { t, locale } = useTranslation();
  const theme = CARD_THEMES[player.cardTheme] || CARD_THEMES.gold;

  const { isOver, setNodeRef: setDroppableRef } = useDroppable({
    id: player.id,
    data: { type: 'PLAYER', player },
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging,
  } = useDraggable({
    id: player.id,
    data: { type: 'PLAYER', player },
    disabled: player.isBankrupt,
  });

  const setCombinedRef = (node: HTMLElement | null) => {
    setDroppableRef(node);
    setDraggableRef(node);
  };

  const handlePassGoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPassGo(player.id);

    // Fire festive confetti from the card location
    try {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { x, y },
        colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899'],
      });
    } catch {
      // ignore
    }
  };

  // Mock a unique 4-digit last digits for the card
  const lastFourDigits = (
    player.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 1000) % 9000 + 1000
  ).toString();

  // Base orientation: top table slots face 180° (opposite player), bottom slots face 0°
  let effectiveRotation = isTopSlot ? 180 : 0;
  if (player.isFlipped) {
    effectiveRotation = effectiveRotation === 180 ? 0 : 180;
  }
  const isRotated = !disableRotation && effectiveRotation === 180;

  return (
    <div
      ref={setCombinedRef}
      className={`relative select-none transition-transform duration-300 ${
        isRotated ? 'rotate-180' : ''
      }`}
    >
      {/* Credit Card Container */}
      <div
        {...attributes}
        {...listeners}
        className={`credit-card cursor-grab active:cursor-grabbing relative w-72 sm:w-80 h-44 sm:h-48 rounded-2xl p-4 flex flex-col justify-between overflow-hidden shadow-xl border ${
          theme.borderColor
        } bg-gradient-to-br ${theme.bgGradient} ${
          isOver
            ? 'ring-4 ring-emerald-400 scale-105 shadow-emerald-500/50'
            : isDragging
            ? 'opacity-40 scale-95'
            : 'hover:scale-[1.02] hover:shadow-2xl'
        } ${player.isBankrupt ? 'grayscale opacity-60' : ''}`}
      >
        {/* Shimmer metallic shine */}
        <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-20" />

        {/* Card Header: Chip, Contactless & Avatar */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            {/* EMV Gold Chip */}
            <div className="w-10 h-7 credit-card-chip shadow-inner" />
            {/* Contactless Wifi Icon */}
            <Wifi className="w-4 h-4 text-slate-300/80 rotate-90" />
          </div>

          {/* Player Avatar */}
          <div className="flex items-center gap-2">
            <span className="text-2xl filter drop-shadow-md">{player.avatar}</span>
            <div className="flex flex-col text-right">
              <span className="text-xs uppercase tracking-wider font-extrabold text-white truncate max-w-[120px]">
                {player.name}
              </span>
              <span className="text-[9px] font-mono text-slate-400">
                •••• {lastFourDigits}
              </span>
            </div>
          </div>
        </div>

        {/* Center: Account Balance */}
        <div className="z-10 my-auto text-left">
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-300/80">
            {t.card.accountBalance}
          </span>
          <div className="flex items-baseline gap-1.5">
            <div
              className={`font-mono text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm ${
                player.balance < 0 ? 'text-rose-400' : 'text-white'
              }`}
            >
              {formatCurrency(player.balance, config.currencySymbol, config.thousandSeparator)}
            </div>
          </div>
          {player.isBankrupt ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBankrupt(player.id);
              }}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40 hover:bg-rose-900 transition"
              title={t.card.revive}
            >
              <Skull className="w-3 h-3" />
              <span>{t.card.bankrupt}</span>
            </button>
          ) : (
            player.balance <= 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBankrupt(player.id);
                }}
                className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-400 hover:underline"
              >
                <span>{t.card.declareBankruptcy}</span>
              </button>
            )
          )}
        </div>

        {/* Card Footer: Quick Actions */}
        <div className="flex items-center justify-between z-10 pt-1 border-t border-white/10">
          {/* Pass GO / Über Los button */}
          <button
            onClick={handlePassGoClick}
            disabled={player.isBankrupt}
            title={`${t.card.passGo} (+${formatCompact(config.passGoAmount, locale)})`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-400 text-slate-950 hover:bg-amber-300 shadow-md shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {t.card.passGo} (+{formatCompact(config.passGoAmount, locale)})
            </span>
          </button>

          {/* Transfer & Tools */}
          <div className="flex items-center gap-1">
            {/* Direct Transfer Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInitiateTransfer(player);
              }}
              disabled={player.isBankrupt}
              title={t.card.transfer}
              className="p-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition active:scale-95 disabled:opacity-50"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
            </button>

            {/* Rotate Card Button (only shown in table view for opposite table player) */}
            {!disableRotation && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRotate(player.id);
                }}
                title={t.card.rotate}
                className="p-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Edit Player Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(player);
              }}
              title={t.card.edit}
              className="p-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
