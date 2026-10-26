import { describe, expect, it } from 'vitest';

import { sampleRoutes } from './data';
import type { TourRoute } from './types';

describe('TourRoute compatibility', () => {
  it('keeps stopIds available on shipped route data', () => {
    expect(sampleRoutes[0]?.stopIds).toEqual([
      'guo-en-temple',
      'chan-domain-town',
    ]);
  });

  it('accepts a legacy TourRoute that only provides stopIds', () => {
    const legacyRoute: TourRoute = {
      id: 'legacy-route',
      name: '旧版路线',
      duration: '1 天',
      summary: '旧消费方仍使用 stopIds。',
      stopIds: ['guo-en-temple'],
      source: {
        sourceKind: 'local-demo',
        verificationStatus: 'planning',
      },
    };

    expect(legacyRoute.stopIds).toEqual(['guo-en-temple']);
    expect(legacyRoute.stops).toBeUndefined();
  });
});
