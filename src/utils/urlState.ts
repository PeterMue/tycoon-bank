import LZString from 'lz-string';
import { GameState } from '../types/game';

const URL_PARAM_KEY = 'state';

/**
 * Compresses the game state into an encoded URI component.
 */
export function serializeGameState(state: GameState): string {
  try {
    const json = JSON.stringify(state);
    return LZString.compressToEncodedURIComponent(json);
  } catch (err) {
    console.error('Failed to serialize game state', err);
    return '';
  }
}

/**
 * Decompresses an encoded string back into GameState.
 */
export function deserializeGameState(encoded: string): GameState | null {
  try {
    if (!encoded) return null;
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (parsed && Array.isArray(parsed.players) && parsed.config) {
      return parsed as GameState;
    }
    return null;
  } catch (err) {
    console.error('Failed to deserialize game state', err);
    return null;
  }
}

/**
 * Reads state directly from the window.location.hash if present.
 */
export function loadStateFromUrlHash(): GameState | null {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const encodedState = params.get(URL_PARAM_KEY);
  if (!encodedState) return null;

  return deserializeGameState(encodedState);
}

/**
 * Builds a full sharable URL for the current game state.
 */
export function createShareableUrl(state: GameState): string {
  if (typeof window === 'undefined') return '';
  const serialized = serializeGameState(state);
  const url = new URL(window.location.href);
  url.hash = `${URL_PARAM_KEY}=${serialized}`;
  return url.toString();
}

/**
 * Clears the state hash from current URL without reloading the page.
 */
export function clearUrlHash(): void {
  if (typeof window === 'undefined') return;
  if (window.location.hash) {
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}
