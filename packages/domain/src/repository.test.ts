import { describe, expect, it } from 'vitest';

import {
  createCatalogRepositories,
  createMemoryStorage,
  createVersionedRepository,
} from './repository';

type Draft = {
  title: string;
  published: boolean;
};

describe('createVersionedRepository', () => {
  it('falls back to an isolated seed value when storage is empty', () => {
    const storage = createMemoryStorage();
    const repository = createVersionedRepository<Draft[]>({
      key: 'spots',
      version: 2,
      seed: [{ title: '国恩寺', published: true }],
      storage,
    });

    const firstRead = repository.read();
    firstRead[0]!.title = 'mutated';

    expect(repository.read()).toEqual([
      { title: '国恩寺', published: true },
    ]);
  });

  it('writes a versioned envelope and reads the persisted value', () => {
    const storage = createMemoryStorage();
    const repository = createVersionedRepository<Draft[]>({
      key: 'routes',
      version: 3,
      seed: [],
      storage,
    });

    repository.write([{ title: '禅意一日游', published: false }]);

    expect(storage.getItem('routes')).toBe(
      '{"version":3,"data":[{"title":"禅意一日游","published":false}]}',
    );
    expect(repository.read()).toEqual([
      { title: '禅意一日游', published: false },
    ]);
  });

  it('replaces stale stored data with the current seed and version', () => {
    const storage = createMemoryStorage({
      spots: '{"version":1,"data":[{"title":"旧数据","published":true}]}',
    });
    const repository = createVersionedRepository<Draft[]>({
      key: 'spots',
      version: 2,
      seed: [{ title: '示例数据', published: false }],
      storage,
    });

    expect(repository.read()).toEqual([
      { title: '示例数据', published: false },
    ]);
    expect(storage.getItem('spots')).toBe(
      '{"version":2,"data":[{"title":"示例数据","published":false}]}',
    );
  });

  it('recovers from malformed JSON without throwing', () => {
    const storage = createMemoryStorage({ achievements: '{broken' });
    const repository = createVersionedRepository<Draft[]>({
      key: 'achievements',
      version: 1,
      seed: [{ title: '待核验成果', published: false }],
      storage,
    });

    expect(repository.read()).toEqual([
      { title: '待核验成果', published: false },
    ]);
  });
});

describe('createCatalogRepositories', () => {
  it('shares versioned attraction data across repository instances', () => {
    const storage = createMemoryStorage();
    const firstSession = createCatalogRepositories(storage);
    const attractions = firstSession.attractions.read();

    attractions[0]!.name = '已编辑的景点名称';
    firstSession.attractions.write(attractions);

    const nextSession = createCatalogRepositories(storage);
    expect(nextSession.attractions.read()[0]?.name).toBe('已编辑的景点名称');
  });
});
