import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from './App';

beforeEach(() => localStorage.clear());

async function login() {
  const user = userEvent.setup();
  render(<App initialPath="/admin" />);
  await user.type(screen.getByLabelText('账号'), 'demo');
  await user.type(screen.getByLabelText('密码'), 'demo');
  await user.click(screen.getByRole('button', { name: '登录演示后台' }));
  return user;
}

describe('admin application', () => {
  it('uses the visible brand name and responsive optimized route preview', () => {
    render(<App initialPath="/admin" />);
    expect(document.querySelector('.brand__text')).toHaveTextContent('六祖云游');
    expect(screen.queryByRole('img', { name: '云启新兴' })).not.toBeInTheDocument();
    cleanup();
    render(<App initialPath="/admin/routes" authenticated />);
    expect(
      document.querySelector('.map-preview source[type="image/avif"]'),
    ).toHaveAttribute(
      'srcset',
      expect.stringContaining('offline-map-ai-v1-768.avif'),
    );
  });

  it('labels the login as an insecure local demo and persists the session', async () => {
    await login();
    expect(screen.getByText('本地演示 · 浏览器持久化')).toBeVisible();
    expect(localStorage.getItem('liuzu-admin:session')).toContain('true');
  });

  it('supports spot filtering, publishing and delete confirmation', async () => {
    const user = userEvent.setup();
    render(<App initialPath="/admin/spots" authenticated />);
    await user.type(screen.getByLabelText('搜索景点'), '国恩寺');
    expect(screen.getByText('国恩寺')).toBeVisible();
    expect(screen.queryByText('天露山')).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: '切换国恩寺上下线状态' }),
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      '状态已保存到当前浏览器',
    );
    await user.click(screen.getByRole('button', { name: '删除国恩寺' }));
    const dialog = screen.getByRole('dialog', { name: '确认删除景点' });
    await user.click(within(dialog).getByRole('button', { name: '确认删除' }));
    expect(screen.queryByText('国恩寺')).not.toBeInTheDocument();
  });

  it('validates and saves a new spot with a local image preview', async () => {
    const user = userEvent.setup();
    render(<App initialPath="/admin/spots/new" authenticated />);
    await user.click(screen.getByRole('button', { name: '保存并发布' }));
    expect(screen.getByText('请填写景点名称')).toBeVisible();
    await user.type(screen.getByLabelText('景点名称'), '测试景点');
    await user.type(screen.getByLabelText('所属村镇'), '六祖镇');
    await user.selectOptions(screen.getByLabelText('分类'), '自然风光');
    await user.type(screen.getByLabelText('地图位置'), '22.6900,112.2200');
    await user.type(screen.getByLabelText('门票信息'), '待官方确认');
    await user.type(screen.getByLabelText('开放时间'), '待官方确认');
    await user.type(screen.getByLabelText('PLY 地址'), '/models/demo.ply');
    await user.click(screen.getByLabelText('启用真实 3D 模型'));
    const file = new File(['image'], 'spot.png', { type: 'image/png' });
    await user.upload(screen.getByLabelText('上传封面'), file);
    expect(screen.getByText('spot.png（仅本地预览）')).toBeVisible();
    await user.click(screen.getByRole('button', { name: '保存并发布' }));
    expect(screen.getByRole('status')).toHaveTextContent('已保存到当前浏览器');
    const stored = localStorage.getItem('liuzu-cloud-tour:attractions') ?? '';
    expect(stored).toContain('自然风光');
    expect(stored).toContain('/models/demo.ply');
    expect(stored).toContain('22.6900,112.2200');
    const savedId = (JSON.parse(stored) as { data: Array<{ id: string }> })
      .data[0].id;
    cleanup();
    render(<App initialPath={`/admin/spots/${savedId}`} authenticated />);
    expect(screen.getByLabelText('分类')).toHaveValue('自然风光');
    expect(screen.getByLabelText('PLY 地址')).toHaveValue('/models/demo.ply');
    expect(screen.getByLabelText('启用真实 3D 模型')).toBeChecked();
  });

  it('filters spots by category, area, 3D and publish status', async () => {
    const user = userEvent.setup();
    render(<App initialPath="/admin/spots" authenticated />);
    await user.selectOptions(screen.getByLabelText('景点分类'), '禅文化');
    await user.selectOptions(screen.getByLabelText('所属区域'), '新兴县');
    await user.selectOptions(screen.getByLabelText('3D 状态'), 'false');
    await user.selectOptions(screen.getByLabelText('上架状态'), 'false');
    expect(screen.getByText('国恩寺')).toBeVisible();
    await user.selectOptions(screen.getByLabelText('景点分类'), '山水');
    expect(screen.queryByText('国恩寺')).not.toBeInTheDocument();
  });

  it('supports keyboard route ordering and persisted save feedback', async () => {
    const user = userEvent.setup();
    render(<App initialPath="/admin/routes" authenticated />);
    const first = screen.getByRole('button', { name: /国恩寺，当前第 1 站/ });
    first.focus();
    fireEvent.keyDown(first, { key: 'ArrowDown' });
    expect(
      screen.getByRole('button', { name: /国恩寺，当前第 2 站/ }),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: '保存草稿' }));
    expect(screen.getByRole('status')).toHaveTextContent('路线草稿已保存');
    await user.click(screen.getByRole('button', { name: '添加天露山到路线' }));
    await user.click(screen.getByRole('button', { name: '保存并发布' }));
    expect(localStorage.getItem('liuzu-admin:route-status')).toContain(
      'published',
    );
    expect(localStorage.getItem('liuzu-admin:route-status')).toContain(
      '"version":1',
    );
    expect(localStorage.getItem('liuzu-cloud-tour:routes')).toContain(
      'tian-lu-mountain',
    );
    cleanup();
    render(<App initialPath="/admin/routes" authenticated />);
    expect(screen.getByText('当前状态：已发布')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /移除天露山/ }));
    await user.click(screen.getByRole('button', { name: '保存草稿' }));
    cleanup();
    render(<App initialPath="/admin/routes" authenticated />);
    expect(
      screen.queryByRole('button', { name: /天露山，当前第/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('当前状态：草稿')).toBeVisible();
  });

  it('filters achievements and opens an accessible editor drawer', async () => {
    const createUrl = vi
      .spyOn(URL, 'createObjectURL')
      .mockReturnValue('blob:achievement-preview');
    const revokeUrl = vi
      .spyOn(URL, 'revokeObjectURL')
      .mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<App initialPath="/admin/achievements" authenticated />);
    await user.click(screen.getByRole('button', { name: '直播' }));
    expect(screen.getByText('直播助农成果')).toBeVisible();
    expect(screen.queryByText('党建实践成果')).not.toBeInTheDocument();
    const opener = screen.getByRole('button', { name: '编辑直播助农成果' });
    await user.click(opener);
    const dialog = screen.getByRole('dialog', { name: '编辑成果' });
    expect(dialog).toBeVisible();
    expect(document.querySelector('.admin-shell')).toHaveAttribute('inert');
    await user.type(within(dialog).getByLabelText('正文内容'), '正文演示内容');
    await user.type(
      within(dialog).getByLabelText('视频 URL'),
      'https://example.invalid/demo.mp4',
    );
    await user.selectOptions(
      within(dialog).getByLabelText('关联景点'),
      'guo-en-temple',
    );
    await user.click(within(dialog).getByLabelText('发布状态'));
    await user.upload(
      within(dialog).getByLabelText('图集'),
      new File(['image'], 'result.png', { type: 'image/png' }),
    );
    expect(
      within(dialog).getByText('result.png（仅本地预览元数据）'),
    ).toBeVisible();
    expect(
      within(dialog).getByRole('img', { name: 'result.png 本地预览' }),
    ).toHaveAttribute('src', 'blob:achievement-preview');
    await user.click(within(dialog).getByRole('button', { name: '保存' }));
    expect(localStorage.getItem('liuzu-cloud-tour:achievements')).toContain(
      '正文演示内容',
    );
    expect(localStorage.getItem('liuzu-cloud-tour:achievements')).toContain(
      'result.png',
    );
    expect(localStorage.getItem('liuzu-cloud-tour:achievements')).not.toContain(
      'blob:achievement-preview',
    );
    expect(opener).toHaveFocus();
    expect(createUrl).toHaveBeenCalledTimes(1);
    expect(revokeUrl).toHaveBeenCalledWith('blob:achievement-preview');
    cleanup();
    render(<App initialPath="/admin/achievements" authenticated />);
    await user.click(screen.getByRole('button', { name: '直播' }));
    await user.click(screen.getByRole('button', { name: '编辑直播助农成果' }));
    expect(screen.getByLabelText('正文内容')).toHaveValue('正文演示内容');
    expect(screen.getByLabelText('发布状态')).toBeChecked();
    const reloadedDialog = screen.getByRole('dialog', { name: '编辑成果' });
    const saveButton = within(reloadedDialog).getByRole('button', {
      name: '保存',
    });
    saveButton.focus();
    fireEvent.keyDown(saveButton, { key: 'Tab' });
    expect(
      within(reloadedDialog).getByRole('button', { name: '关闭' }),
    ).toHaveFocus();
    fireEvent.keyDown(reloadedDialog, { key: 'Escape' });
    expect(
      screen.queryByRole('dialog', { name: '编辑成果' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '编辑直播助农成果' }),
    ).toHaveFocus();
  });
});
