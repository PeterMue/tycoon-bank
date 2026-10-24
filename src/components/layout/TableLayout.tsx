import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { Player, GameConfig, BANK_ID } from '../../types/game';
import { BankVault } from '../bank/BankVault';
import { PlayerCard } from '../player/PlayerCard';
import { playCardTap, triggerHaptic } from '../../utils/sound';

interface TableLayoutProps {
  viewMode: 'table' | 'grid';
  players: Player[];
  config: GameConfig;
  circulatingSupply: number;
  onInitiateTransfer: (fromPlayer: Player) => void;
  onPassGo: (playerId: string) => void;
  onEditPlayer: (player: Player) => void;
  onRotatePlayer: (playerId: string) => void;
  onToggleBankrupt: (playerId: string) => void;
  onVaultPayout: () => void;
  onVaultDeposit: () => void;
  onDragDropTransfer: (fromId: string, toId: string) => void;
}

export const TableLayout: React.FC<TableLayoutProps> = ({
  viewMode,
  players,
  config,
  circulatingSupply,
  onInitiateTransfer,
  onPassGo,
  onEditPlayer,
  onRotatePlayer,
  onToggleBankrupt,
  onVaultPayout,
  onVaultDeposit,
  onDragDropTransfer,
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  // Dedicated sensors: Mouse for desktop/trackpad, Touch for iPad/mobile
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 8,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 100, // 100ms hold ensures intentional drag vs tap
      tolerance: 6,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    if (config.soundEnabled) playCardTap();
    if (config.hapticEnabled) triggerHaptic('light');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const sourceId = active.id as string;
    const targetId = over.id as string;

    if (sourceId !== targetId) {
      if (config.hapticEnabled) triggerHaptic('medium');
      onDragDropTransfer(sourceId, targetId);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Split players for tabletop seating (top side vs bottom side)
  const { topPlayers, bottomPlayers } = useMemo(() => {
    if (players.length <= 1) {
      return { topPlayers: [], bottomPlayers: players };
    }
    const half = Math.ceil(players.length / 2);
    return {
      topPlayers: players.slice(0, half),
      bottomPlayers: players.slice(half),
    };
  }, [players]);

  const activePlayer = useMemo(() => {
    return players.find((p) => p.id === activeId);
  }, [players, activeId]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <main className="w-full flex-1 flex flex-col items-center justify-center p-3 sm:p-6 max-w-7xl mx-auto">
        {viewMode === 'table' ? (
          /* Tabletop Tablet Mode */
          <div className="w-full flex flex-col items-center justify-between gap-6 sm:gap-10 py-2 sm:py-6">
            {/* Top Table Side (Facing players sitting opposite iPad) */}
            {topPlayers.length > 0 && (
              <div className="w-full flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                {topPlayers.map((player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    config={config}
                    isTopSlot={true}
                    onInitiateTransfer={onInitiateTransfer}
                    onPassGo={onPassGo}
                    onEdit={onEditPlayer}
                    onRotate={onRotatePlayer}
                    onToggleBankrupt={onToggleBankrupt}
                  />
                ))}
              </div>
            )}

            {/* Table Center: Bank Vault */}
            <div className="my-2 sm:my-4 flex items-center justify-center">
              <BankVault
                config={config}
                circulatingSupply={circulatingSupply}
                onInitiatePayout={onVaultPayout}
                onInitiateDeposit={onVaultDeposit}
              />
            </div>

            {/* Bottom Table Side (Near side of iPad) */}
            <div className="w-full flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              {bottomPlayers.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  config={config}
                  isTopSlot={false}
                  onInitiateTransfer={onInitiateTransfer}
                  onPassGo={onPassGo}
                  onEdit={onEditPlayer}
                  onRotate={onRotatePlayer}
                  onToggleBankrupt={onToggleBankrupt}
                />
              ))}
            </div>
          </div>
        ) : (
          /* Responsive Grid Mode */
          <div className="w-full flex flex-col items-center gap-8 py-4">
            <BankVault
              config={config}
              circulatingSupply={circulatingSupply}
              onInitiatePayout={onVaultPayout}
              onInitiateDeposit={onVaultDeposit}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center w-full">
              {players.map((player) => (
                <PlayerCard
                  key={player.id}
                  player={player}
                  config={config}
                  disableRotation={true}
                  onInitiateTransfer={onInitiateTransfer}
                  onPassGo={onPassGo}
                  onEdit={onEditPlayer}
                  onRotate={onRotatePlayer}
                  onToggleBankrupt={onToggleBankrupt}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Drag Overlay for smooth iPad touch dragging */}
      <DragOverlay dropAnimation={null}>
        {activePlayer ? (
          <div className="rotate-3 scale-105 pointer-events-none drop-shadow-2xl">
            <PlayerCard
              player={activePlayer}
              config={config}
              disableRotation={viewMode === 'grid'}
              isTopSlot={topPlayers.some((p) => p.id === activePlayer.id)}
              onInitiateTransfer={() => {}}
              onPassGo={() => {}}
              onEdit={() => {}}
              onRotate={() => {}}
              onToggleBankrupt={() => {}}
            />
          </div>
        ) : activeId === BANK_ID ? (
          <div className="scale-105 pointer-events-none drop-shadow-2xl">
            <BankVault
              config={config}
              circulatingSupply={circulatingSupply}
              onInitiatePayout={() => {}}
              onInitiateDeposit={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
