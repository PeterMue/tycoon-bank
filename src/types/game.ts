export type Locale = 'de' | 'en';
export type ThousandSeparator = '.' | ',';

export type CardThemeId =
  | 'obsidian'
  | 'gold'
  | 'sapphire'
  | 'emerald'
  | 'ruby'
  | 'amethyst'
  | 'cyberpunk'
  | 'titanium';

export interface CardTheme {
  id: CardThemeId;
  name: string;
  bgGradient: string;
  borderColor: string;
  textColor: string;
  accentColor: string;
}

export interface Player {
  id: string;
  name: string;
  balance: number;
  avatar: string;
  cardTheme: CardThemeId;
  isBankrupt: boolean;
  rotation?: number; // legacy support
  isFlipped?: boolean; // manually flipped relative to table slot
  createdAt: number;
}

export type TransactionType =
  | 'TRANSFER'
  | 'PASS_GO'
  | 'BANK_DEPOSIT'
  | 'BANK_WITHDRAW'
  | 'TAX'
  | 'RENT'
  | 'PROPERTY'
  | 'CUSTOM';

export interface Transaction {
  id: string;
  timestamp: number;
  fromId: string; // playerId or 'BANK'
  fromName: string;
  toId: string;   // playerId or 'BANK'
  toName: string;
  amount: number;
  description: string;
  type: TransactionType;
  isUndone?: boolean;
}

export interface GameConfig {
  title: string;
  locale: Locale;
  startingBalance: number;
  passGoAmount: number;
  currencySymbol: string;
  thousandSeparator: ThousandSeparator;
  soundEnabled: boolean;
  hapticEnabled: boolean;
  quickAmounts: number[];
}

export interface GameState {
  config: GameConfig;
  players: Player[];
  transactions: Transaction[];
  version: number;
}

export interface TransferDraft {
  fromId: string;
  toId: string;
  amount: number;
  description?: string;
  type?: TransactionType;
}

export const BANK_ID = 'BANK';
