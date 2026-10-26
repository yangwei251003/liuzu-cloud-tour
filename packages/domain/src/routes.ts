export { getMediaDisclosure } from './media';

export interface RouteMetadata {
  path: string;
  title: string;
  prototypePages: string[];
}

export interface NavigationItem {
  label: string;
  to: string;
}

export const PUBLIC_NAV_ITEMS: NavigationItem[] = [
  { label: '禅踪地图', to: '/map' },
  { label: '景点巡礼', to: '/spots' },
  { label: '主题路线', to: '/routes' },
  { label: '数字集章', to: '/stamps' },
  { label: '实践成果', to: '/achievements' },
  { label: '关于项目', to: '/about' },
];

export const PUBLIC_ROUTE_MANIFEST: RouteMetadata[] = [
  { path: '/', title: '首页', prototypePages: ['P01', 'P02', 'P03', 'P04'] },
  { path: '/map', title: '禅踪地图', prototypePages: ['P05'] },
  { path: '/spots', title: '景点巡礼', prototypePages: ['P06'] },
  {
    path: '/spots/:spotId/3d',
    title: '三维云游',
    prototypePages: ['P09'],
  },
  {
    path: '/spots/:spotId',
    title: '景点详情',
    prototypePages: ['P07', 'P08'],
  },
  { path: '/routes', title: '主题路线', prototypePages: ['P10'] },
  {
    path: '/routes/:routeId',
    title: '路线详情',
    prototypePages: ['P11', 'P12', 'P13', 'P14', 'P15', 'P16'],
  },
  { path: '/stamps', title: '数字集章', prototypePages: ['P17'] },
  {
    path: '/stamps/certificate',
    title: '集章证书',
    prototypePages: ['P18'],
  },
  { path: '/achievements', title: '实践成果', prototypePages: ['P19'] },
  {
    path: '/achievements/:type',
    title: '成果详情',
    prototypePages: ['P20', 'P21', 'P22', 'P23', 'P24'],
  },
  { path: '/about', title: '关于项目', prototypePages: ['P25', 'P26'] },
];

export const ADMIN_ROUTE_MANIFEST: RouteMetadata[] = [
  { path: '/admin', title: '后台登录', prototypePages: ['P27'] },
  { path: '/admin/stats', title: '数据看板', prototypePages: ['P28'] },
  { path: '/admin/spots', title: '景点管理', prototypePages: ['P29'] },
  {
    path: '/admin/spots/new',
    title: '新增景点',
    prototypePages: ['P30'],
  },
  {
    path: '/admin/spots/:spotId',
    title: '编辑景点',
    prototypePages: ['P30'],
  },
  { path: '/admin/routes', title: '路线管理', prototypePages: ['P31'] },
  {
    path: '/admin/achievements',
    title: '成果管理',
    prototypePages: ['P32'],
  },
];

function matches(pattern: string, pathname: string): boolean {
  const cleanPath = pathname.split(/[?#]/, 1)[0]?.replace(/\/$/, '') || '/';
  const patternParts = pattern.split('/').filter(Boolean);
  const pathParts = cleanPath.split('/').filter(Boolean);

  return (
    patternParts.length === pathParts.length &&
    patternParts.every(
      (part, index) => part.startsWith(':') || part === pathParts[index],
    )
  );
}

function findRoute(
  manifest: RouteMetadata[],
  pathname: string,
): RouteMetadata | undefined {
  return manifest.find((route) => matches(route.path, pathname));
}

export const getPublicRouteMetadata = (pathname: string) =>
  findRoute(PUBLIC_ROUTE_MANIFEST, pathname);

export const getAdminRouteMetadata = (pathname: string) =>
  findRoute(ADMIN_ROUTE_MANIFEST, pathname);
