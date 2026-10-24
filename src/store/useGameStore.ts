import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GameState,
  GameConfig,
  Player,
  Transaction,
  TransferDraft,
  BANK_ID,
  CardThemeId,
} from '../types/game';
import { getInitialLocale } from '../i18n/useTranslation';
import { loadStateFromUrlHash } from '../utils/urlState';
import {
  playChaChing,
  playPassGoChime,
  playUndoSound,
  playErrorSound,
  triggerHaptic,
} from '../utils/sound';

const STORAGE_KEY = 'tycoonbank_gamestate_v1';

export const DEFAULT_CONFIG: GameConfig = {
  title: 'TycoonBank',
  locale: getInitialLocale(),
  startingBalance: 15_000_000,
  passGoAmount: 2_000_000,
  currencySymbol: '€',
  thousandSeparator: '.',
  soundEnabled: true,
  hapticEnabled: true,
  quickAmounts: [100_000, 500_000, 1_000_000, 2_000_000],
};

export const INITIAL_DEMO_PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'Alice',
    balance: 15_000_000,
    avatar: '🎩',
    cardTheme: 'gold',
    isBankrupt: false,
    rotation: 180, // Facing opposite player across iPad table
    createdAt: 1,
  },
  {
    id: 'p2',
    name: 'Bob',
    balance: 15_000_000,
    avatar: '🏎️',
    cardTheme: 'obsidian',
    isBankrupt: false,
    rotation: 180,
    createdAt: 2,
  },
  {
    id: 'p3',
    name: 'Charlie',
    balance: 15_000_000,
    avatar: '🐈',
    cardTheme: 'sapphire',
    isBankrupt: false,
    rotation: 0,
    createdAt: 3,
  },
  {
    id: 'p4',
    name: 'Diana',
    balance: 15_000_000,
    avatar: '👑',
    cardTheme: 'emerald',
    isBankrupt: false,
    rotation: 0,
    createdAt: 4,
  },
];

function loadSavedState(): GameState {
  // 1. Check if URL hash has a shared state
  try {
    const fromUrl = loadStateFromUrlHash();
    if (fromUrl && fromUrl.players && fromUrl.config) {
      return fromUrl;
    }
  } catch {
    // ignore
  }

  // 2. Check localStorage
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.players) && parsed.config) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Default demo state
  return {
    version: 1,
    config: DEFAULT_CONFIG,
    players: INITIAL_DEMO_PLAYERS,
    transactions: [],
  };
}

export function useGameStore() {
  const [state, setState] = useState<GameState>(() => loadSavedState());

  // Auto-save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore storage errors
    }
  }, [state]);

  const soundOn = state.config.soundEnabled;
  const hapticOn = state.config.hapticEnabled;

  const addPlayer = useCallback(
    (name: string, avatar: string, cardTheme: CardThemeId, customBalance?: number) => {
      const newPlayer: Player = {
        id: 'player_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        name: name.trim() || 'Player',
        balance: customBalance !== undefined ? customBalance : state.config.startingBalance,
        avatar: avatar || '🎩',
        cardTheme: cardTheme || 'gold',
        isBankrupt: false,
        rotation: 0,
        createdAt: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        players: [...prev.players, newPlayer],
      }));
    },
    [state.config.startingBalance]
  );

  const updatePlayer = useCallback((id: string, updates: Partial<Player>) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  }, []);

  const removePlayer = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
    }));
  }, []);

  const rotatePlayer = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === id ? { ...p, rotation: (p.rotation || 0) === 180 ? 0 : 180 } : p
      ),
    }));
  }, []);

  const toggleBankrupt = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === id ? { ...p, isBankrupt: !p.isBankrupt } : p
      ),
    }));
  }, []);

  const executeTransfer = useCallback(
    (draft: TransferDraft): boolean => {
      const { fromId, toId, amount, description = '', type = 'TRANSFER' } = draft;
      if (amount <= 0 || fromId === toId) {
        if (soundOn) playErrorSound();
        return false;
      }

      const fromIsBank = fromId === BANK_ID;
      const toIsBank = toId === BANK_ID;

      const fromPlayer = fromIsBank ? null : state.players.find((p) => p.id === fromId);
      const toPlayer = toIsBank ? null : state.players.find((p) => p.id === toId);

      if (!fromIsBank && !fromPlayer) return false;
      if (!toIsBank && !toPlayer) return false;

      const fromName = fromIsBank ? 'Bank' : fromPlayer!.name;
      const toName = toIsBank ? 'Bank' : toPlayer!.name;

      const newTx: Transaction = {
        id: 'tx_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        timestamp: Date.now(),
        fromId,
        fromName,
        toId,
        toName,
        amount,
        description: description.trim() || type,
        type,
      };

      setState((prev) => {
        const nextPlayers = prev.players.map((p) => {
          let bal = p.balance;
          if (p.id === fromId) bal -= amount;
          if (p.id === toId) bal += amount;
          return { ...p, balance: bal };
        });

        return {
          ...prev,
          players: nextPlayers,
          transactions: [newTx, ...prev.transactions],
        };
      });

      if (soundOn) {
        if (type === 'PASS_GO') {
          playPassGoChime();
        } else {
          playChaChing();
        }
      }
      if (hapticOn) triggerHaptic('success');

      return true;
    },
    [state.players, soundOn, hapticOn]
  );

  const quickPassGo = useCallback(
    (playerId: string) => {
      return executeTransfer({
        fromId: BANK_ID,
        toId: playerId,
        amount: state.config.passGoAmount,
        description: state.config.locale === 'de' ? 'Über Los gegangen' : 'Passed GO',
        type: 'PASS_GO',
      });
    },
    [executeTransfer, state.config.passGoAmount, state.config.locale]
  );

  const undoTransaction = useCallback(
    (txId: string): boolean => {
      const tx = state.transactions.find((t) => t.id === txId);
      if (!tx || tx.isUndone) return false;

      const { fromId, toId, amount } = tx;

      setState((prev) => {
        const nextPlayers = prev.players.map((p) => {
          let bal = p.balance;
          // Reverse: add back to sender, subtract from recipient
          if (p.id === fromId) bal += amount;
          if (p.id === toId) bal -= amount;
          return { ...p, balance: bal };
        });

        const nextTransactions = prev.transactions.map((t) =>
          t.id === txId ? { ...t, isUndone: true } : t
        );

        return {
          ...prev,
          players: nextPlayers,
          transactions: nextTransactions,
        };
      });

      if (soundOn) playUndoSound();
      if (hapticOn) triggerHaptic('medium');
      return true;
    },
    [state.transactions, soundOn, hapticOn]
  );

  const clearHistory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      transactions: [],
    }));
  }, []);

  const updateConfig = useCallback((updates: Partial<GameConfig>) => {
    setState((prev) => ({
      ...prev,
      config: { ...prev.config, ...updates },
    }));
  }, []);

  const resetGame = useCallback(
    (keepPlayers = true) => {
      setState((prev) => ({
        ...prev,
        players: keepPlayers
          ? prev.players.map((p) => ({
              ...p,
              balance: prev.config.startingBalance,
              isBankrupt: false,
            }))
          : INITIAL_DEMO_PLAYERS,
        transactions: [],
      }));
    },
    []
  );

  const importState = useCallback((newState: GameState) => {
    setState(newState);
  }, []);

  const circulatingSupply = useMemo(() => {
    return state.players.reduce((sum, p) => sum + (p.balance > 0 ? p.balance : 0), 0);
  }, [state.players]);

  return {
    state,
    players: state.players,
    transactions: state.transactions,
    config: state.config,
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
  };
}
