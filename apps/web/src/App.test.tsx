import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { App } from './App';
import { MediaFrame } from './public/MediaFrame';
import { publicSpots } from './public/content';

function LocationProbe() {
  const location = useLocation();
  return <span aria-label="当前路径">{location.pathname}</span>;
}

function renderAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <App />
      <LocationProbe />
    </MemoryRouter>,
  );
}

describe('public route rendering', () => {
  it.each([
    ['/', '六祖云游'],
    ['/spots', '景点库'],
    ['/spots/guo-en-temple', '国恩寺'],
    ['/routes', '主题路线'],
    ['/routes/zen-one-day', '禅意一日游'],
    ['/achievements', '突击队成果'],
    ['/achievements/livestream', '直播助农'],
    ['/about', '关于六祖云游'],
    ['/map', '云游地图'],
    ['/spots/guo-en-temple/3d', '3D 云游'],
    ['/stamps', '云游集章册'],
    ['/stamps/certificate', '云游纪念证书'],
  ])('renders %s with its page heading', (path, heading) => {
    renderAt(path);

    expect(
      screen.getByRole('heading', { level: 1, name: heading }),
    ).toBeVisible();
    expect(screen.getByRole('navigation', { name: '主导航' })).toBeVisible();
  });

  it.each([
    ['zen-one-day', '禅意一日游'],
    ['zen-red-two-day', '禅韵红色两日游'],
    ['farm-support', '助农实践路线'],
    ['full-guide', '全域导览路线'],
    ['lychee-half-day', '荔枝半日体验'],
    ['red-memory', '红色记忆路线'],
  ])('uses the route detail template for %s', (routeId, routeName) => {
    renderAt(`/routes/${routeId}`);

    expect(
      screen.getByRole('heading', { level: 1, name: routeName }),
    ).toBeVisible();
    expect(screen.getByRole('region', { name: '路线行程' })).toBeVisible();
  });

  it.each([
    ['livestream', '直播助农'],
    ['party-building', '联欢会'],
    ['interview', '访谈实录'],
    ['survey', '问卷数据'],
    ['aigc', 'AIGC 作品'],
  ])('uses the achievement detail template for %s', (type, title) => {
    renderAt(`/achievements/${type}`);

    expect(
      screen.getByRole('heading', { level: 1, name: title }),
    ).toBeVisible();
    expect(screen.getByRole('region', { name: '成果内容' })).toBeVisible();
  });

  it.each([
    ['/spots/not-a-spot', '未找到这个景点', '返回景点库'],
    ['/routes/not-a-route', '未找到这条路线', '返回路线列表'],
    ['/achievements/not-a-type', '未找到这类成果', '返回成果列表'],
    ['/not-a-page', '页面未找到', '返回首页'],
  ])('renders a recoverable not-found state for %s', (path, heading, link) => {
    renderAt(path);

    expect(screen.getByRole('heading', { name: heading })).toBeVisible();
    expect(screen.getByRole('link', { name: link })).toBeVisible();
  });
});

describe('public page interactions', () => {
  it('navigates from the home hero to the route catalog', async () => {
    const user = userEvent.setup();
    renderAt('/');

    await user.click(screen.getByRole('link', { name: '查看主题路线' }));

    expect(screen.getByLabelText('当前路径')).toHaveTextContent('/routes');
    expect(
      screen.getByRole('heading', { level: 1, name: '主题路线' }),
    ).toBeVisible();
  });

  it('filters spots and exposes the empty state', async () => {
    const user = userEvent.setup();
    renderAt('/spots');

    expect(screen.getByText('共 7 个景点')).toBeVisible();
    await user.selectOptions(
      screen.getByRole('combobox', { name: '按类别筛选' }),
      '禅文化',
    );
    expect(screen.getByText('共 2 个景点')).toBeVisible();

    await user.selectOptions(
      screen.getByRole('combobox', { name: '按乡镇筛选' }),
      '太平镇',
    );
    expect(screen.getByText('共 0 个景点')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('暂无匹配景点');
  });

  it('paginates spots and resets to the first page after filtering', async () => {
    const user = userEvent.setup();
    renderAt('/spots');

    const pagination = screen.getByRole('navigation', { name: '景点分页' });
    expect(
      within(pagination).getByText('显示第 1-6 项，共 7 项'),
    ).toBeVisible();
    expect(
      within(pagination).getByRole('button', { name: '上一页' }),
    ).toBeDisabled();

    await user.click(
      within(pagination).getByRole('button', { name: '下一页' }),
    );
    expect(
      within(pagination).getByText('显示第 7-7 项，共 7 项'),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: '助农产业区' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: '国恩寺' }),
    ).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole('combobox', { name: '按类别筛选' }),
      '禅文化',
    );
    expect(
      within(pagination).getByText('显示第 1-2 项，共 2 项'),
    ).toBeVisible();
    expect(
      within(pagination).getByRole('button', { name: '上一页' }),
    ).toBeDisabled();
  });

  it('labels 3D availability as planning and filters only planned records', async () => {
    const user = userEvent.setup();
    renderAt('/spots');

    const statusFilter = screen.getByRole('combobox', {
      name: '按 3D 规划状态筛选',
    });
    expect(
      within(statusFilter).queryByRole('option', { name: '可云游' }),
    ).not.toBeInTheDocument();
    await user.selectOptions(statusFilter, '3D 规划中');
    expect(screen.getByText('共 4 个景点')).toBeVisible();
    expect(screen.getAllByText('3D 云游规划中')).toHaveLength(4);
  });

  it('filters route cards by duration', async () => {
    const user = userEvent.setup();
    renderAt('/routes');

    expect(screen.getByText('共 6 条路线')).toBeVisible();
    await user.selectOptions(
      screen.getByRole('combobox', { name: '按时长筛选' }),
      '半天',
    );

    expect(screen.getByText('共 1 条路线')).toBeVisible();
    expect(screen.getByRole('heading', { name: '荔枝半日体验' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: '禅意一日游' }),
    ).not.toBeInTheDocument();
  });

  it('paginates routes and resets to the first page after filtering', async () => {
    const user = userEvent.setup();
    renderAt('/routes');

    const pagination = screen.getByRole('navigation', { name: '路线分页' });
    expect(
      within(pagination).getByText('显示第 1-3 项，共 6 项'),
    ).toBeVisible();
    await user.click(
      within(pagination).getByRole('button', { name: '下一页' }),
    );
    expect(
      within(pagination).getByText('显示第 4-6 项，共 6 项'),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: '全域导览路线' })).toBeVisible();
    expect(
      screen.queryByRole('heading', { name: '禅意一日游' }),
    ).not.toBeInTheDocument();

    await user.selectOptions(
      screen.getByRole('combobox', { name: '按时长筛选' }),
      '半天',
    );
    expect(
      within(pagination).getByText('显示第 1-1 项，共 1 项'),
    ).toBeVisible();
    expect(
      within(pagination).getByRole('button', { name: '上一页' }),
    ).toBeDisabled();
  });

  it('changes gallery slides and closes the lightbox with Escape', async () => {
    const user = userEvent.setup();
    renderAt('/spots/guo-en-temple');

    const gallery = screen.getByRole('region', { name: '国恩寺图集' });
    expect(within(gallery).getByText('第 1 张，共 3 张')).toBeVisible();
    await user.click(within(gallery).getByRole('button', { name: '下一张' }));
    expect(within(gallery).getByText('第 2 张，共 3 张')).toBeVisible();

    await user.click(within(gallery).getByRole('button', { name: '放大查看' }));
    expect(screen.getByRole('dialog', { name: '国恩寺图集' })).toBeVisible();
    await user.keyboard('{Escape}');
    expect(
      screen.queryByRole('dialog', { name: '国恩寺图集' }),
    ).not.toBeInTheDocument();
  });

  it('traps focus inside the lightbox and isolates the page background', async () => {
    const user = userEvent.setup();
    renderAt('/spots/guo-en-temple');

    const gallery = screen.getByRole('region', { name: '国恩寺图集' });
    const opener = within(gallery).getByRole('button', { name: '放大查看' });
    const appShell = document.querySelector<HTMLElement>('.app-shell');
    const backgroundRoot = appShell?.parentElement;
    backgroundRoot?.setAttribute('aria-hidden', 'false');
    await user.click(opener);

    const dialog = screen.getByRole('dialog', { name: '国恩寺图集' });
    const close = within(dialog).getByRole('button', { name: '关闭图集' });
    const next = within(dialog).getByRole('button', { name: '下一张' });
    expect(close).toHaveFocus();
    expect(backgroundRoot).toHaveAttribute('inert');
    expect(backgroundRoot).toHaveAttribute('aria-hidden', 'true');
    expect(backgroundRoot).toContainElement(
      document.querySelector('.site-header'),
    );
    expect(backgroundRoot).toContainElement(
      document.querySelector('.site-footer'),
    );

    await user.tab({ shift: true });
    expect(next).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(backgroundRoot).not.toHaveAttribute('inert');
    expect(backgroundRoot).toHaveAttribute('aria-hidden', 'false');
    expect(opener).toHaveFocus();
  });

  it('resets a failed image when MediaFrame receives a different media item', () => {
    const { rerender } = render(<MediaFrame media={publicSpots[0].hero} />);
    fireEvent.error(screen.getByRole('img', { name: publicSpots[0].hero.alt }));
    expect(screen.getByRole('img', { name: /素材待接入/ })).toBeVisible();

    rerender(<MediaFrame media={publicSpots[1].hero} />);
    expect(
      screen.getByRole('img', { name: publicSpots[1].hero.alt }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('img', { name: /素材待接入/ }),
    ).not.toBeInTheDocument();
  });

  it('keeps one main landmark on spot detail pages', () => {
    renderAt('/spots/guo-en-temple');
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('reports honest media and download fallbacks', async () => {
    const user = userEvent.setup();
    renderAt('/achievements/livestream');

    await user.click(screen.getByRole('button', { name: '播放成果媒体' }));
    expect(screen.getByRole('alert')).toHaveTextContent('媒体素材待接入');

    renderAt('/achievements/party-building');
    await user.click(screen.getByRole('button', { name: '下载策划方案' }));
    expect(screen.getByText(/下载素材待接入/)).toBeVisible();
  });

  it('keeps ambient audio off when no audio asset is available', async () => {
    const user = userEvent.setup();
    renderAt('/');

    const audioControl = screen.getByRole('button', { name: '开启环境音' });
    expect(audioControl).toHaveAttribute('aria-pressed', 'false');
    await user.click(audioControl);
    expect(audioControl).toHaveAttribute('aria-pressed', 'false');
    expect(
      screen.getByRole('status', { name: '环境音状态' }),
    ).toHaveTextContent('环境音素材待接入');
  });

  it('filters the offline map and opens a spot drawer', async () => {
    const user = userEvent.setup();
    renderAt('/map');

    expect(
      screen.getByText(/禅踪地图 · (高德在线|离线可用)/),
    ).toBeVisible();
    const offlineMapSource = document.querySelector('.offline-map source[type="image/avif"]');
    if (offlineMapSource) {
      expect(offlineMapSource).toHaveAttribute(
        'srcset',
        expect.stringContaining('offline-map-ai-v1-768.avif'),
      );
    } else {
      expect(document.querySelector('.online-map')).toBeInTheDocument();
    }
    expect(
      screen.getByRole('heading', { name: 'Marker 站点索引（非地理顺序）' }),
    ).toBeVisible();
    await user.type(
      screen.getByRole('searchbox', { name: '搜索地图景点' }),
      '国恩寺',
    );
    expect(
      screen.getByRole('button', { name: '查看国恩寺详情' }),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: '查看国恩寺详情' }));
    expect(
      screen.getByRole('dialog', { name: '国恩寺地图详情' }),
    ).toBeVisible();
  });

  it('does not claim a 3D model loaded when none was provided', async () => {
    const user = userEvent.setup();
    renderAt('/spots/guo-en-temple/3d');
    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent('真实 3D 模型待接入'),
    );
    await user.click(screen.getByRole('button', { name: '重试加载' }));
    expect(screen.getByRole('status')).toHaveTextContent('仍未检测到可用模型');
    expect(screen.getByRole('button', { name: '旋转视角' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '保存截图' })).toBeDisabled();
  });

  it('keeps stamp audio disabled until an authorized asset exists', async () => {
    const user = userEvent.setup();
    renderAt('/stamps');
    expect(
      document.querySelector('.stamp-artwork source[type="image/webp"]'),
    ).toHaveAttribute(
      'srcset',
      expect.stringContaining('stamp-medallions-ai-v1-1536.webp'),
    );
    const control = screen.getByRole('button', { name: '音效待接入' });
    expect(control).toBeDisabled();
    await user.click(control);
    expect(control).toHaveAttribute('aria-pressed', 'false');
  });

  it('makes a locked certificate action unreachable', () => {
    window.localStorage.clear();
    renderAt('/stamps');
    expect(
      screen.queryByRole('link', { name: '查看证书' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '查看证书' })).toBeDisabled();
  });
});
