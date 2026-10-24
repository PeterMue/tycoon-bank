import { describe, it, expect } from 'vitest';
import { serializeGameState, deserializeGameState } from '../src/utils/urlState';
import { GameState } from '../src/types/game';

describe('urlState', () => {
  const sampleState: GameState = {
    version: 1,
    config: {
      title: 'Monopoly Night',
      locale: 'de',
      startingBalance: 15000000,
      passGoAmount: 2000000,
      currencySymbol: '€',
      thousandSeparator: '.',
      soundEnabled: true,
      hapticEnabled: true,
      quickAmounts: [100000, 500000, 1000000, 2000000],
    },
    players: [
      {
        id: 'p1',
        name: 'Alice',
        balance: 14000000,
        avatar: '🎩',
        cardTheme: 'gold',
        isBankrupt: false,
        createdAt: 1000,
      },
      {
        id: 'p2',
        name: 'Bob',
        balance: 16000000,
        avatar: '🏎️',
        cardTheme: 'obsidian',
        isBankrupt: false,
        createdAt: 1001,
      },
    ],
    transactions: [
      {
        id: 'tx1',
        timestamp: 1002,
        fromId: 'p1',
        fromName: 'Alice',
        toId: 'p2',
        toName: 'Bob',
        amount: 1000000,
        description: 'Rent',
        type: 'RENT',
      },
    ],
  };

  it('serializes and deserializes without data loss', () => {
    const encoded = serializeGameState(sampleState);
    expect(encoded).toBeTypeOf('string');
    expect(encoded.length).toBeGreaterThan(10);

    const decoded = deserializeGameState(encoded);
    expect(decoded).toEqual(sampleState);
  });

  it('returns null on invalid string', () => {
    expect(deserializeGameState('')).toBeNull();
    expect(deserializeGameState('invalid-random-string')).toBeNull();
  });
});
