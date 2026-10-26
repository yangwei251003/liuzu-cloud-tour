import type { StorageLike } from '@liuzu/domain';

import { publicSpots } from '../public/content';

const STAMP_KEY = 'liuzu-cloud-tour:stamps';
const STAMP_VERSION = 1;
const validIds = new Set(publicSpots.map(({ id }) => id));

export interface StampRepository {
  read(): string[];
  write(ids: string[]): void;
}

export function createStampRepository(storage: StorageLike): StampRepository {
  const sanitize = (ids: unknown) =>
    Array.isArray(ids)
      ? [...new Set(ids.filter((id): id is string => typeof id === 'string' && validIds.has(id)))]
      : [];
  return {
    read() {
      try {
        const envelope = JSON.parse(storage.getItem(STAMP_KEY) ?? 'null') as {
          version?: number;
          data?: unknown;
        } | null;
        return envelope?.version === STAMP_VERSION ? sanitize(envelope.data) : [];
      } catch {
        return [];
      }
    },
    write(ids) {
      storage.setItem(
        STAMP_KEY,
        JSON.stringify({ version: STAMP_VERSION, data: sanitize(ids) }),
      );
    },
  };
}

export function getStampMilestone(count: number) {
  return { card: count >= 4, certificate: count >= 7 };
}

interface VisibilityTimerOptions {
  durationMs: number;
  isVisible(): boolean;
  onUnlock(): void;
}

export function createVisibilityStampTimer(options: VisibilityTimerOptions) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  let unlocked = false;
  const clear = () => {
    if (timeout !== undefined) clearTimeout(timeout);
    timeout = undefined;
  };
  const schedule = () => {
    clear();
    if (!unlocked && options.isVisible()) {
      timeout = setTimeout(() => {
        if (options.isVisible()) {
          unlocked = true;
          options.onUnlock();
        }
      }, options.durationMs);
    }
  };
  return {
    start: schedule,
    visibilityChanged: schedule,
    stop: clear,
  };
}
