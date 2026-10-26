import { describe, expect, it } from 'vitest';

import { sampleAttractions } from './data';
import { getMediaRenderModel } from './media';

describe('sample attraction media', () => {
  it('resolves every unavailable sample image to an honest non-URL fallback', () => {
    for (const spot of sampleAttractions) {
      const renderModel = getMediaRenderModel(spot.hero);

      expect(renderModel).toEqual({
        kind: 'unavailable',
        message: '景点图片待补充',
        disclosure: '规划中/待确认',
      });
      expect(renderModel).not.toHaveProperty('src');
    }
  });
});
