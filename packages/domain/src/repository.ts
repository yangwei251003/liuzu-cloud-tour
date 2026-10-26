export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface VersionedRepository<T> {
  read(): T;
  write(value: T): void;
  reset(): T;
}

export interface VersionedRepositoryOptions<T> {
  key: string;
  version: number;
  seed: T;
  storage: StorageLike;
}

type VersionedEnvelope<T> = {
  version: number;
  data: T;
};

const clone = <T>(value: T): T => structuredClone(value);

export function createVersionedRepository<T>({
  key,
  version,
  seed,
  storage,
}: VersionedRepositoryOptions<T>): VersionedRepository<T> {
  const currentSeed = () => clone(seed);
  const persist = (data: T) => {
    const envelope: VersionedEnvelope<T> = { version, data: clone(data) };
    storage.setItem(key, JSON.stringify(envelope));
  };

  return {
    read() {
      const stored = storage.getItem(key);
      if (stored === null) {
        return currentSeed();
      }

      try {
        const envelope = JSON.parse(stored) as Partial<VersionedEnvelope<T>>;
        if (envelope.version === version && 'data' in envelope) {
          return clone(envelope.data as T);
        }
      } catch {
        // Malformed local demo data is replaced below with the declared seed.
      }

      const fallback = currentSeed();
      persist(fallback);
      return fallback;
    },
    write(value) {
      persist(value);
    },
    reset() {
      const fallback = currentSeed();
      persist(fallback);
      return fallback;
    },
  };
}

export function createMemoryStorage(
  initial: Record<string, string> = {},
): StorageLike {
  const entries = new Map(Object.entries(initial));

  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  };
}

export interface CatalogRepositories {
  attractions: VersionedRepository<Attraction[]>;
  routes: VersionedRepository<TourRoute[]>;
  achievements: VersionedRepository<Achievement[]>;
}

const CATALOG_SCHEMA_VERSION = 1;

export function createCatalogRepositories(
  storage: StorageLike,
): CatalogRepositories {
  return {
    attractions: createVersionedRepository({
      key: 'liuzu-cloud-tour:attractions',
      version: CATALOG_SCHEMA_VERSION,
      seed: sampleAttractions,
      storage,
    }),
    routes: createVersionedRepository({
      key: 'liuzu-cloud-tour:routes',
      version: CATALOG_SCHEMA_VERSION,
      seed: sampleRoutes,
      storage,
    }),
    achievements: createVersionedRepository({
      key: 'liuzu-cloud-tour:achievements',
      version: CATALOG_SCHEMA_VERSION,
      seed: sampleAchievements,
      storage,
    }),
  };
}
import {
  sampleAchievements,
  sampleAttractions,
  sampleRoutes,
} from './data';
import type { Achievement, Attraction, TourRoute } from './types';
