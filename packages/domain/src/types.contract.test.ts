import { expectTypeOf, it } from 'vitest';

import type {
  Achievement,
  MediaAsset,
  Route,
  RouteStop,
  SourceRef,
  Spot,
  Stamp,
  VerificationStatus,
} from './types';

it('exports the canonical domain contracts consumed by later tasks', () => {
  expectTypeOf<Spot>().toHaveProperty('hero');
  expectTypeOf<Route>().toHaveProperty('stops');
  expectTypeOf<RouteStop>().toHaveProperty('spotId');
  expectTypeOf<Achievement>().toHaveProperty('type');
  expectTypeOf<Stamp>().toHaveProperty('spotId');
  expectTypeOf<MediaAsset>().toHaveProperty('availability');
  expectTypeOf<SourceRef>().toHaveProperty('verificationStatus');
  expectTypeOf<VerificationStatus>().toEqualTypeOf<
    'verified' | 'planning' | 'unverified'
  >();
});
