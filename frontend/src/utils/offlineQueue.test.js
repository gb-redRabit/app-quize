// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  enqueue,
  getQueue,
  shiftQueue,
  clearQueue,
  queueSize,
  newClientId,
  trimQueue,
  MAX_ENTRIES,
} from './offlineQueue';

const STORAGE_KEY = 'offline-queue-v1';

// Node 26 ma eksperymentalny globalny `localStorage`, który bez flagi jest
// `undefined` — podmieniamy na prostą pamięć, żeby test był deterministyczny.
if (!globalThis.localStorage) {
  const memory = new Map();
  globalThis.localStorage = {
    getItem: (key) => (memory.has(key) ? memory.get(key) : null),
    setItem: (key, value) => memory.set(key, String(value)),
    removeItem: (key) => memory.delete(key),
    clear: () => memory.clear(),
    key: (index) => [...memory.keys()][index] ?? null,
    get length() {
      return memory.size;
    },
  };
}

describe('offlineQueue', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('dodaje operacje i podaje ich liczbę', () => {
    enqueue({ type: 'hquestion', payload: { id: 1 } });
    enqueue({ type: 'history', payload: { clientId: 'abc' } });

    expect(queueSize()).toBe(2);
    expect(getQueue().map((op) => op.type)).toEqual(['hquestion', 'history']);
    expect(getQueue()[0].queuedAt).toBeTypeOf('number');
  });

  it('zdejmuje operacje z początku kolejki', () => {
    enqueue({ type: 'hquestion', payload: { id: 1 } });
    enqueue({ type: 'hquestion', payload: { id: 2 } });

    shiftQueue();

    expect(queueSize()).toBe(1);
    expect(getQueue()[0].payload.id).toBe(2);
  });

  it('czyści kolejkę', () => {
    enqueue({ type: 'hquestion', payload: { id: 1 } });
    clearQueue();

    expect(queueSize()).toBe(0);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('przy przepełnieniu zachowuje najnowsze pozycje i emituje ostrzeżenie', () => {
    let droppedTotal = 0;
    const handler = (event) => {
      droppedTotal += Number(event.detail?.dropped) || 0;
    };
    window.addEventListener('offline-queue-overflow', handler);

    for (let i = 0; i < MAX_ENTRIES + 20; i += 1) {
      enqueue({ type: 'hquestion', payload: { id: i } });
    }

    window.removeEventListener('offline-queue-overflow', handler);
    expect(queueSize()).toBe(MAX_ENTRIES);
    expect(getQueue()[0].payload.id).toBe(20);
    expect(getQueue()[MAX_ENTRIES - 1].payload.id).toBe(MAX_ENTRIES + 19);
    expect(droppedTotal).toBe(20);
  });

  it('trimQueue respektuje limit bajtów (najnowsze zostają)', () => {
    const big = { type: 'x', payload: { text: 'a'.repeat(1000) } };
    const { entries, dropped } = trimQueue([big, big, big], {
      maxEntries: 10,
      maxBytes: 2200,
    });

    expect(dropped).toBe(1);
    expect(entries).toHaveLength(2);
    expect(entries[1]).toEqual(big);
  });

  it('emituje zdarzenie offline-queue-changed', () => {
    let events = 0;
    const handler = () => {
      events += 1;
    };
    window.addEventListener('offline-queue-changed', handler);

    enqueue({ type: 'hquestion', payload: { id: 1 } });
    shiftQueue();
    clearQueue();

    window.removeEventListener('offline-queue-changed', handler);
    expect(events).toBe(3);
  });

  it('ignoruje uszkodzone dane w localStorage', () => {
    localStorage.setItem(STORAGE_KEY, '{nie-json');
    expect(queueSize()).toBe(0);
  });

  it('generuje unikalne clientId', () => {
    const ids = new Set(Array.from({ length: 50 }, () => newClientId()));
    expect(ids.size).toBe(50);
    for (const id of ids) {
      expect(id.length).toBeGreaterThan(8);
    }
  });
});
