import { describe, expect, it } from 'vitest';

import {
  ADMIN_ROUTE_MANIFEST,
  PUBLIC_NAV_ITEMS,
  PUBLIC_ROUTE_MANIFEST,
  getAdminRouteMetadata,
  getMediaDisclosure,
  getPublicRouteMetadata,
} from './routes';

describe('route metadata', () => {
  it('matches dynamic public paths and gives the 3D route precedence', () => {
    expect(getPublicRouteMetadata('/spots/guo-en-temple')?.title).toBe(
      '景点详情',
    );
    expect(getPublicRouteMetadata('/spots/guo-en-temple/3d')?.title).toBe(
      '三维云游',
    );
    expect(getPublicRouteMetadata('/missing')).toBeUndefined();
  });

  it('matches admin edit routes without swallowing the new route', () => {
    expect(getAdminRouteMetadata('/admin/spots/new')?.title).toBe(
      '新增景点',
    );
    expect(getAdminRouteMetadata('/admin/spots/guo-en-temple')?.title).toBe(
      '编辑景点',
    );
  });

  it('exposes the complete supported route inventory and six main links', () => {
    expect(PUBLIC_ROUTE_MANIFEST).toHaveLength(12);
    expect(ADMIN_ROUTE_MANIFEST).toHaveLength(7);
    expect(PUBLIC_NAV_ITEMS.map((item) => item.label)).toEqual([
      '禅踪地图',
      '景点巡礼',
      '主题路线',
      '数字集章',
      '实践成果',
      '关于项目',
    ]);
  });
});

describe('media disclosure', () => {
  it('labels generated imagery and planning-state media honestly', () => {
    expect(
      getMediaDisclosure({
        sourceKind: 'ai-generated',
        verificationStatus: 'verified',
      }),
    ).toBe('AI 视觉示意');
    expect(
      getMediaDisclosure({
        sourceKind: 'ai-generated',
        verificationStatus: 'planning',
      }),
    ).toBe('AI 视觉示意（规划中/待确认）');
    expect(
      getMediaDisclosure({
        sourceKind: 'prototype-reference',
        verificationStatus: 'planning',
      }),
    ).toBe('规划中/待确认');
    expect(
      getMediaDisclosure({
        sourceKind: 'owned',
        verificationStatus: 'verified',
      }),
    ).toBeUndefined();
  });
});
