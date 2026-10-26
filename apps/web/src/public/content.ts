import { publicAssetPath } from '@liuzu/domain';
import {
  sampleAchievements,
  sampleRoutes,
  type AchievementType,
  type MediaAsset,
  type Route,
  type Spot,
} from '@liuzu/domain';

const prototypePlanning = {
  sourceKind: 'prototype-reference' as const,
  verificationStatus: 'planning' as const,
  sourceLabel: '公共端视觉原型',
};

const aiPlanning = {
  sourceKind: 'ai-generated' as const,
  verificationStatus: 'planning' as const,
  sourceLabel: '项目原创 AI 视觉素材',
};

function unavailableMedia(id: string, alt: string): MediaAsset {
  return {
    id,
    alt,
    availability: 'unavailable',
    fallbackText: '素材待接入',
    ...prototypePlanning,
  };
}

function aiMedia(id: string, src: string, alt: string): MediaAsset {
  return {
    id,
    src,
    alt,
    availability: 'available',
    ...aiPlanning,
  };
}

export const homeHeroMedia = aiMedia(
  'home-hero-shanshui',
  publicAssetPath('/media/generated/hero-shanshui-ai-v1.png'),
  '云雾山水、古塔与荔枝枝叶构成的六祖云游首页视觉',
);

const templeMedia = aiMedia(
  'spot-temple-tower',
  publicAssetPath('/media/generated/spot-temple-tower-ai-v1.png'),
  '山林间的岭南寺院与古塔视觉示意',
);

const teaMedia = aiMedia(
  'spot-tea-mountains',
  publicAssetPath('/media/generated/spot-tea-mountains-ai-v1.png'),
  '云雾茶山与层叠梯田视觉示意',
);

const lycheeMedia = aiMedia(
  'spot-lychee-orchard',
  publicAssetPath('/media/generated/spot-lychee-orchard-ai-v1.png'),
  '荔枝果园与成熟果实视觉示意',
);

export const achievementFieldworkMedia = aiMedia(
  'achievement-fieldwork',
  publicAssetPath('/media/generated/achievement-fieldwork-ai-v1.png'),
  '青年团队在乡村开展走访调研的视觉示意',
);

export interface PublicSpot extends Spot {
  category: string;
  town: string;
  supports3d: boolean;
  gallery: MediaAsset[];
  highlights: string[];
}

export const publicSpots: PublicSpot[] = [
  {
    id: 'guo-en-temple',
    name: '国恩寺',
    area: '新兴县',
    town: '六祖镇',
    category: '禅文化',
    supports3d: true,
    summary: '禅文化主题点位，历史、开放与服务信息仍待权威来源核验。',
    tags: ['禅文化', '古建筑'],
    location: {},
    hero: templeMedia,
    gallery: [
      templeMedia,
      unavailableMedia('guo-en-gallery-2', '国恩寺图集第二张'),
      unavailableMedia('guo-en-gallery-3', '国恩寺图集第三张'),
    ],
    highlights: ['禅宗文化', '古建空间', '山林环境'],
    source: { ...prototypePlanning },
  },
  {
    id: 'cang-fo-pit',
    name: '藏佛坑',
    area: '新兴县',
    town: '东成镇',
    category: '生态康养',
    supports3d: true,
    summary: '山水生态主题点位，具体游览条件与开放状态待确认。',
    tags: ['生态康养', '山水'],
    location: {},
    hero: teaMedia,
    gallery: [teaMedia, unavailableMedia('cang-fo-gallery-2', '藏佛坑图集第二张')],
    highlights: ['生态环境', '山水步道', '自然观察'],
    source: { ...prototypePlanning },
  },
  {
    id: 'lychee-tea-base',
    name: '香荔茶基地',
    area: '新兴县',
    town: '东成镇',
    category: '助农产业',
    supports3d: false,
    summary: '农文旅展示点位，产品、开放与接待信息待项目方确认。',
    tags: ['助农产业', '田园风光'],
    location: {},
    hero: lycheeMedia,
    gallery: [lycheeMedia, unavailableMedia('lychee-base-gallery-2', '香荔茶基地图集第二张')],
    highlights: ['产业体验', '田园观察', '助农实践'],
    source: { ...prototypePlanning },
  },
  {
    id: 'ye-ji-zhuang-residence',
    name: '叶季壮故居',
    area: '新兴县',
    town: '太平镇',
    category: '红色印记',
    supports3d: false,
    summary: '红色文化主题点位，人物与场馆信息待权威来源核验。',
    tags: ['红色印记', '历史建筑'],
    location: {},
    hero: unavailableMedia('ye-residence-hero', '叶季壮故居景点图片'),
    gallery: [
      unavailableMedia('ye-residence-gallery-1', '叶季壮故居图集第一张'),
      unavailableMedia('ye-residence-gallery-2', '叶季壮故居图集第二张'),
    ],
    highlights: ['红色记忆', '人物故事', '历史空间'],
    source: { ...prototypePlanning },
  },
  {
    id: 'ta-jiao-village',
    name: '塔脚村驻地',
    area: '新兴县',
    town: '太平镇',
    category: '乡村风情',
    supports3d: true,
    summary: '乡村文化体验点位，接待方式与活动安排待确认。',
    tags: ['乡村风情', '古村落'],
    location: {},
    hero: unavailableMedia('ta-jiao-hero', '塔脚村驻地景点图片'),
    gallery: [
      unavailableMedia('ta-jiao-gallery-1', '塔脚村驻地图集第一张'),
      unavailableMedia('ta-jiao-gallery-2', '塔脚村驻地图集第二张'),
    ],
    highlights: ['古村空间', '乡土生活', '团队驻地'],
    source: { ...prototypePlanning },
  },
  {
    id: 'zen-culture-zone',
    name: '禅文化区',
    area: '新兴县',
    town: '六祖镇',
    category: '禅文化',
    supports3d: true,
    summary: '禅文化展示与体验点位，具体内容与服务信息待补充。',
    tags: ['禅文化', '文化展示'],
    location: {},
    hero: unavailableMedia('zen-zone-hero', '禅文化区景点图片'),
    gallery: [unavailableMedia('zen-zone-gallery-1', '禅文化区图集第一张')],
    highlights: ['文化展示', '主题体验', '研学空间'],
    source: { ...prototypePlanning },
  },
  {
    id: 'farm-support-zone',
    name: '助农产业区',
    area: '新兴县',
    town: '新城镇',
    category: '助农产业',
    supports3d: false,
    summary: '助农成果展示点位，经营、开放与活动信息待确认。',
    tags: ['助农产业', '成果展示'],
    location: {},
    hero: lycheeMedia,
    gallery: [lycheeMedia, unavailableMedia('farm-zone-gallery-2', '助农产业区图集第二张')],
    highlights: ['成果展示', '产业观察', '乡村实践'],
    source: { ...prototypePlanning },
  },
];

export interface PublicRoute extends Route {
  stopIds: Spot['id'][];
  theme: string;
  difficulty: '轻度' | '中度';
  hero: MediaAsset;
  audience: string;
}

const routePresentation: Record<
  string,
  Pick<PublicRoute, 'theme' | 'difficulty' | 'hero' | 'audience'>
> = {
  'zen-one-day': {
    theme: '禅文化',
    difficulty: '轻度',
    hero: templeMedia,
    audience: '文化爱好者、亲子家庭',
  },
  'zen-red-two-day': {
    theme: '红色记忆',
    difficulty: '中度',
    hero: templeMedia,
    audience: '研学团队、文化爱好者',
  },
  'farm-support': {
    theme: '助农产业',
    difficulty: '轻度',
    hero: lycheeMedia,
    audience: '学生团队、亲子家庭',
  },
  'full-guide': {
    theme: '全域体验',
    difficulty: '中度',
    hero: teaMedia,
    audience: '深度游客、休闲度假客群',
  },
  'lychee-half-day': {
    theme: '乡村风情',
    difficulty: '轻度',
    hero: lycheeMedia,
    audience: '亲子家庭、乡村体验游客',
  },
  'red-memory': {
    theme: '红色记忆',
    difficulty: '轻度',
    hero: achievementFieldworkMedia,
    audience: '研学团队、文化爱好者',
  },
};

export const publicRoutes: PublicRoute[] = sampleRoutes.map((route) => ({
  ...route,
  ...routePresentation[route.id],
}));

export interface AchievementProfile {
  type: AchievementType;
  title: string;
  category: string;
  summary: string;
  hero: MediaAsset;
  sections: string[];
}

const achievementProfiles: Record<AchievementType, AchievementProfile> = {
  livestream: {
    type: 'livestream',
    title: '直播助农',
    category: '助农产业',
    summary: '记录团队走进乡村产业现场的直播实践，传播与助农数据仍待核验。',
    hero: achievementFieldworkMedia,
    sections: ['直播精彩瞬间', '团队风采', '相关景点与路线'],
  },
  'party-building': {
    type: 'party-building',
    title: '联欢会',
    category: '文化活动',
    summary: '以村晚活动记录乡村文化交流，节目与参与信息仍待项目方补充。',
    hero: achievementFieldworkMedia,
    sections: ['节目流程', '活动图集', '活动回顾'],
  },
  interview: {
    type: 'interview',
    title: '访谈实录',
    category: '深度访谈',
    summary: '以口述记录乡土记忆，受访内容、姓名与授权信息仍待核验。',
    hero: achievementFieldworkMedia,
    sections: ['访谈节选', '关键观点', '完整录音'],
  },
  survey: {
    type: 'survey',
    title: '问卷数据',
    category: '调研报告',
    summary: '展示问卷分析结构，样本量、比例与结论均以正式数据接入为准。',
    hero: unavailableMedia('survey-hero', '问卷调研成果图片'),
    sections: ['指标概览', '图表区域', '关键发现'],
  },
  aigc: {
    type: 'aigc',
    title: 'AIGC 作品',
    category: '创意作品',
    summary: '呈现项目原创 AI 视觉示意与创作流程，所有生成内容持续保留 AI 标识。',
    hero: achievementFieldworkMedia,
    sections: ['作品画廊', '提示词手册', '创作流程'],
  },
};

export const publicAchievements = sampleAchievements.map(
  ({ type }) => achievementProfiles[type],
);

export function getSpot(spotId: string | undefined) {
  return publicSpots.find((spot) => spot.id === spotId);
}

export function getRoute(routeId: string | undefined) {
  return publicRoutes.find((route) => route.id === routeId);
}

export function getAchievement(type: string | undefined) {
  return publicAchievements.find((achievement) => achievement.type === type);
}
