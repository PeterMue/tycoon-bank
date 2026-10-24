import { describe, it, expect } from 'vitest';
import { Player } from '../src/types/game';

describe('Game Transfer & Undo logic', () => {
  it('correctly calculates balances on player-to-player transfer', () => {
    let p1: Player = { id: 'p1', name: 'Alice', balance: 15000000, avatar: '🎩', cardTheme: 'gold', isBankrupt: false, createdAt: 1 };
    let p2: Player = { id: 'p2', name: 'Bob', balance: 15000000, avatar: '🏎️', cardTheme: 'obsidian', isBankrupt: false, createdAt: 2 };

    const amount = 2000000;
    // P1 pays P2
    p1 = { ...p1, balance: p1.balance - amount };
    p2 = { ...p2, balance: p2.balance + amount };

    expect(p1.balance).toBe(13000000);
    expect(p2.balance).toBe(17000000);

    // Revert / Undo
    p1 = { ...p1, balance: p1.balance + amount };
    p2 = { ...p2, balance: p2.balance - amount };

    expect(p1.balance).toBe(15000000);
    expect(p2.balance).toBe(15000000);
  });

  it('correctly calculates bank payout and undo', () => {
    let p1: Player = { id: 'p1', name: 'Alice', balance: 15000000, avatar: '🎩', cardTheme: 'gold', isBankrupt: false, createdAt: 1 };
    const passGoAmount = 2000000;

    // Bank pays P1
    p1 = { ...p1, balance: p1.balance + passGoAmount };
    expect(p1.balance).toBe(17000000);

    // Undo bank payout
    p1 = { ...p1, balance: p1.balance - passGoAmount };
    expect(p1.balance).toBe(15000000);
  });

  it('correctly calculates bank deposit and undo', () => {
    let p1: Player = { id: 'p1', name: 'Alice', balance: 15000000, avatar: '🎩', cardTheme: 'gold', isBankrupt: false, createdAt: 1 };
    const taxAmount = 500000;

    // P1 pays Bank
    p1 = { ...p1, balance: p1.balance - taxAmount };
    expect(p1.balance).toBe(14500000);

    // Undo tax payment
    p1 = { ...p1, balance: p1.balance + taxAmount };
    expect(p1.balance).toBe(15000000);
  });
});
