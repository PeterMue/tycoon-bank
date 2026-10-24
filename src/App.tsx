import { useState } from 'react';
import { useGameStore } from './store/useGameStore';
import { I18nProvider, useTranslation } from './i18n/useTranslation';
import { Header } from './components/layout/Header';
import { TableLayout } from './components/layout/TableLayout';
import { TransferModal } from './components/transfer/TransferModal';
import { HistoryDrawer } from './components/history/HistoryDrawer';
import { SettingsModal } from './components/settings/SettingsModal';
import { ShareModal } from './components/share/ShareModal';
import { AddPlayerModal } from './components/player/AddPlayerModal';
import { Player, CardThemeId, BANK_ID, TransactionType } from './types/game';
import { UserPlus } from 'lucide-react';

function BankApp() {
  const {
    state,
    players,
    transactions,
    config,
    circulatingSupply,
    addPlayer,
    updatePlayer,
    removePlayer,
    rotatePlayer,
    toggleBankrupt,
    executeTransfer,
    quickPassGo,
    undoTransaction,
    clearHistory,
    updateConfig,
    resetGame,
    importState,
  } = useGameStore();

  const { t } = useTranslation();

  // Layout view mode: 'table' (iPad tabletop surround) or 'grid'
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modal open states
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferParams, setTransferParams] = useState<{
    fromId: string;
    toId: string;
    amount?: number;
    type?: TransactionType;
  }>({ fromId: BANK_ID, toId: BANK_ID });

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [playerToEdit, setPlayerToEdit] = useState<Player | null>(null);

  // Initiators
  const handleInitiateTransferFromCard = (player: Player) => {
    // Default: player sends to bank or another player
    const otherPlayer = players.find((p) => p.id !== player.id);
    setTransferParams({
      fromId: player.id,
      toId: otherPlayer ? otherPlayer.id : BANK_ID,
      amount: 0,
      type: 'TRANSFER',
    });
    setIsTransferOpen(true);
  };

  const handleDragDropTransfer = (fromId: string, toId: string) => {
    if (fromId === toId) return;

    let defaultAmount = 0;
    let type: TransactionType = 'TRANSFER';

    // If Bank is dragged onto player, suggest Pass GO reward
    if (fromId === BANK_ID) {
      defaultAmount = config.passGoAmount;
      type = 'PASS_GO';
    }

    setTransferParams({
      fromId,
      toId,
      amount: defaultAmount,
      type,
    });
    setIsTransferOpen(true);
  };

  const handleVaultPayout = () => {
    setTransferParams({
      fromId: BANK_ID,
      toId: players.length > 0 ? players[0].id : BANK_ID,
      amount: config.passGoAmount,
      type: 'BANK_WITHDRAW',
    });
    setIsTransferOpen(true);
  };

  const handleVaultDeposit = () => {
    setTransferParams({
      fromId: players.length > 0 ? players[0].id : BANK_ID,
      toId: BANK_ID,
      amount: 0,
      type: 'BANK_DEPOSIT',
    });
    setIsTransferOpen(true);
  };

  const handleOpenAddPlayer = () => {
    setPlayerToEdit(null);
    setIsPlayerModalOpen(true);
  };

  const handleOpenEditPlayer = (player: Player) => {
    setPlayerToEdit(player);
    setIsPlayerModalOpen(true);
  };

  const handleSavePlayer = (
    name: string,
    avatar: string,
    theme: CardThemeId,
    balance?: number
  ) => {
    if (playerToEdit) {
      updatePlayer(playerToEdit.id, {
        name,
        avatar,
        cardTheme: theme,
        ...(balance !== undefined ? { balance } : {}),
      });
    } else {
      addPlayer(name, avatar, theme, balance);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Top Application Header */}
      <Header
        config={config}
        playerCount={players.length}
        circulatingSupply={circulatingSupply}
        transactionCount={transactions.length}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
        onOpenAddPlayer={handleOpenAddPlayer}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onToggleSound={() => updateConfig({ soundEnabled: !config.soundEnabled })}
      />

      {/* Main Tabletop or Grid Workspace */}
      {players.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            {t.welcome.title}
          </h2>
          <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
            {t.welcome.description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleOpenAddPlayer}
              className="px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              {t.welcome.addFirstPlayer}
            </button>
            <button
              onClick={() => resetGame(false)}
              className="px-5 py-2.5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              {t.welcome.loadDemo}
            </button>
          </div>
        </div>
      ) : (
        <TableLayout
          viewMode={viewMode}
          players={players}
          config={config}
          circulatingSupply={circulatingSupply}
          onInitiateTransfer={handleInitiateTransferFromCard}
          onPassGo={quickPassGo}
          onEditPlayer={handleOpenEditPlayer}
          onRotatePlayer={rotatePlayer}
          onToggleBankrupt={toggleBankrupt}
          onVaultPayout={handleVaultPayout}
          onVaultDeposit={handleVaultDeposit}
          onDragDropTransfer={handleDragDropTransfer}
        />
      )}

      {/* Modals & Drawers */}
      <TransferModal
        isOpen={isTransferOpen}
        initialFromId={transferParams.fromId}
        initialToId={transferParams.toId}
        initialAmount={transferParams.amount}
        initialType={transferParams.type}
        players={players}
        config={config}
        onClose={() => setIsTransferOpen(false)}
        onConfirm={(from, to, amount, desc, type) => {
          executeTransfer({
            fromId: from,
            toId: to,
            amount,
            description: desc,
            type,
          });
        }}
      />

      <HistoryDrawer
        isOpen={isHistoryOpen}
        transactions={transactions}
        config={config}
        onClose={() => setIsHistoryOpen(false)}
        onUndo={undoTransaction}
        onClear={clearHistory}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        config={config}
        onClose={() => setIsSettingsOpen(false)}
        onSaveConfig={updateConfig}
        onResetGame={resetGame}
      />

      <ShareModal
        isOpen={isShareOpen}
        gameState={state}
        onClose={() => setIsShareOpen(false)}
        onImportState={importState}
      />

      <AddPlayerModal
        isOpen={isPlayerModalOpen}
        playerToEdit={playerToEdit}
        config={config}
        onClose={() => setIsPlayerModalOpen(false)}
        onSave={handleSavePlayer}
        onDelete={removePlayer}
      />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <BankApp />
    </I18nProvider>
  );
}
