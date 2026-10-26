import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AppShell, Button, StatusPanel } from './index';

describe('AppShell', () => {
  it('provides a skip link, home brand, six main links, and current-page state', () => {
    render(
      <MemoryRouter initialEntries={['/routes']}>
        <AppShell>
          <h1>路线内容</h1>
        </AppShell>
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: '跳到主要内容' })).toHaveAttribute(
      'href',
      '#main-content',
    );
    expect(screen.getByRole('link', { name: '六祖云游首页' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(screen.getByRole('link', { name: '六祖云游首页' })).toHaveTextContent('六祖云游');
    expect(screen.queryByRole('img', { name: '云启新兴' })).not.toBeInTheDocument();
    expect(screen.queryByText('禅')).not.toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: '主导航' })).toBeVisible();
    expect(screen.getByRole('link', { name: '主题路线' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('navigation', { name: '主导航' }).querySelectorAll('a'),
    ).toHaveLength(6);
    expect(screen.getByRole('main')).toHaveTextContent('路线内容');
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      '部分内容为规划中演示',
    );
  });
});

describe('Button', () => {
  it('defaults to a non-submitting button and still handles activation', async () => {
    const onSubmit = vi.fn();
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <form onSubmit={onSubmit}>
        <Button onClick={onClick}>查看详情</Button>
      </form>,
    );

    await user.click(screen.getByRole('button', { name: '查看详情' }));

    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('StatusPanel', () => {
  it('announces errors assertively and exposes a recovery action', () => {
    render(
      <StatusPanel
        status="error"
        title="地图加载失败"
        description="请检查网络后重试。"
        action={<Button>重新加载</Button>}
      />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('地图加载失败');
    expect(screen.getByRole('button', { name: '重新加载' })).toBeEnabled();
  });

  it('announces loading without using an alert', () => {
    render(<StatusPanel status="loading" title="正在加载景点" />);

    expect(screen.getByRole('status')).toHaveTextContent('正在加载景点');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
