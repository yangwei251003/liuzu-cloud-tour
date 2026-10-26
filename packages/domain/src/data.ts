import type {
  Achievement,
  Route,
  SourceRef,
  Spot,
  TourRoute,
} from './types';

const prototypePlanning: SourceRef = {
  sourceKind: 'prototype-reference',
  verificationStatus: 'planning',
  sourceLabel: 'P01–P32 视觉原型',
};

export const sampleSpots: Spot[] = [
  {
    id: 'guo-en-temple',
    name: '国恩寺',
    area: '新兴县',
    summary: '六祖惠能相关文化地标示例，具体开放信息待官方来源核验。',
    tags: ['禅文化', '古建筑'],
    location: {},
    hero: {
      id: 'spot-guo-en-temple-unavailable',
      alt: '国恩寺景点图片',
      availability: 'unavailable',
      fallbackText: '景点图片待补充',
      ...prototypePlanning,
    },
    source: { ...prototypePlanning },
  },
  {
    id: 'chan-domain-town',
    name: '禅域小镇',
    area: '新兴县',
    summary: '文旅体验景点示例，运营状态与服务信息待确认。',
    tags: ['文旅体验', '夜游'],
    location: {},
    hero: {
      id: 'spot-chan-domain-town-unavailable',
      alt: '禅域小镇景点图片',
      availability: 'unavailable',
      fallbackText: '景点图片待补充',
      ...prototypePlanning,
    },
    source: { ...prototypePlanning },
  },
  {
    id: 'tian-lu-mountain',
    name: '天露山',
    area: '新兴县',
    summary: '自然山水景点示例，路线与季节信息待来源核验。',
    tags: ['山水', '徒步'],
    location: {},
    hero: {
      id: 'spot-tian-lu-mountain-unavailable',
      alt: '天露山景点图片',
      availability: 'unavailable',
      fallbackText: '景点图片待补充',
      ...prototypePlanning,
    },
    source: { ...prototypePlanning },
  },
];

export const sampleAttractions = sampleSpots;

export const sampleRoutes: Array<Route & TourRoute> = [
  {
    id: 'zen-one-day',
    name: '禅意一日游',
    duration: '1 天',
    summary: '围绕禅文化地标的示例路线。',
    stops: [
      {
        id: 'zen-one-day-1',
        spotId: 'guo-en-temple',
        name: '国恩寺',
        order: 1,
      },
      {
        id: 'zen-one-day-2',
        spotId: 'chan-domain-town',
        name: '禅域小镇',
        order: 2,
      },
    ],
    stopIds: ['guo-en-temple', 'chan-domain-town'],
    source: { ...prototypePlanning },
  },
  {
    id: 'zen-red-two-day',
    name: '禅韵红色两日游',
    duration: '2 天',
    summary: '禅文化与红色记忆组合的示例路线。',
    stops: [
      {
        id: 'zen-red-two-day-1',
        spotId: 'guo-en-temple',
        name: '国恩寺',
        order: 1,
      },
      {
        id: 'zen-red-two-day-2',
        spotId: 'chan-domain-town',
        name: '禅域小镇',
        order: 2,
      },
    ],
    stopIds: ['guo-en-temple', 'chan-domain-town'],
    source: { ...prototypePlanning },
  },
  {
    id: 'farm-support',
    name: '助农实践路线',
    duration: '1 天',
    summary: '乡村调研与助农实践示例路线。',
    stops: [
      {
        id: 'farm-support-1',
        spotId: 'tian-lu-mountain',
        name: '天露山',
        order: 1,
      },
    ],
    stopIds: ['tian-lu-mountain'],
    source: { ...prototypePlanning },
  },
  {
    id: 'full-guide',
    name: '全域导览路线',
    duration: '2 天',
    summary: '覆盖代表性文化与自然点位的示例路线。',
    stops: [
      {
        id: 'full-guide-1',
        spotId: 'guo-en-temple',
        name: '国恩寺',
        order: 1,
      },
      {
        id: 'full-guide-2',
        spotId: 'chan-domain-town',
        name: '禅域小镇',
        order: 2,
      },
      {
        id: 'full-guide-3',
        spotId: 'tian-lu-mountain',
        name: '天露山',
        order: 3,
      },
    ],
    stopIds: ['guo-en-temple', 'chan-domain-town', 'tian-lu-mountain'],
    source: { ...prototypePlanning },
  },
  {
    id: 'lychee-half-day',
    name: '荔枝半日体验',
    duration: '半天',
    summary: '季节性农文旅体验示例路线。',
    stops: [
      {
        id: 'lychee-half-day-1',
        spotId: 'chan-domain-town',
        name: '禅域小镇',
        order: 1,
      },
    ],
    stopIds: ['chan-domain-town'],
    source: { ...prototypePlanning },
  },
  {
    id: 'red-memory',
    name: '红色记忆路线',
    duration: '1 天',
    summary: '红色文化研学示例路线。',
    stops: [
      {
        id: 'red-memory-1',
        spotId: 'guo-en-temple',
        name: '国恩寺',
        order: 1,
      },
    ],
    stopIds: ['guo-en-temple'],
    source: { ...prototypePlanning },
  },
];

export const sampleAchievements: Achievement[] = [
  {
    id: 'party-building-demo',
    type: 'party-building',
    title: '党建实践成果',
    summary: '展示结构示例，内容与数据待项目方核验。',
    source: { ...prototypePlanning },
  },
  {
    id: 'livestream-demo',
    type: 'livestream',
    title: '直播助农成果',
    summary: '展示结构示例，成交与传播数据待项目方核验。',
    source: { ...prototypePlanning },
  },
  {
    id: 'interview-demo',
    type: 'interview',
    title: '人物访谈成果',
    summary: '展示结构示例，受访者信息待授权与核验。',
    source: { ...prototypePlanning },
  },
  {
    id: 'survey-demo',
    type: 'survey',
    title: '调研成果',
    summary: '展示结构示例，样本与结论待项目方核验。',
    source: { ...prototypePlanning },
  },
  {
    id: 'aigc-demo',
    type: 'aigc',
    title: 'AIGC 创作成果',
    summary: '展示结构示例，生成素材需保留 AI 标识。',
    source: { ...prototypePlanning },
  },
];
