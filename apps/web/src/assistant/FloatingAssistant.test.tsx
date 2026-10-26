import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FloatingAssistant } from './FloatingAssistant';

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe('FloatingAssistant', () => {
  it('uses a compact composer on click and opens the full record only on double click', async () => {
    const user = userEvent.setup();
    render(<FloatingAssistant />);
    const avatar = screen.getByRole('button', { name: /唤醒禅小荔/ });

    await user.click(avatar);
    await new Promise((resolve) => window.setTimeout(resolve, 220));
    // Motion's initial opacity is intentionally preserved in jsdom; opening the
    // compact composer is the behavior under test here, not browser paint.
    expect(screen.getByRole('textbox', { name: '问问禅小荔' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: '禅小荔对话记录' })).not.toBeInTheDocument();

    await user.dblClick(avatar);
    expect(screen.getByRole('dialog', { name: '禅小荔对话记录' })).toBeVisible();
  });

  it('sends a real service response as a transient bubble and stores the record', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ content: '当然可以，我来陪你云游。' }) }),
    );
    const user = userEvent.setup();
    render(<FloatingAssistant />);

    await user.click(screen.getByRole('button', { name: /唤醒禅小荔/ }));
    await new Promise((resolve) => window.setTimeout(resolve, 220));
    await user.type(screen.getByRole('textbox', { name: '问问禅小荔' }), '国恩寺有什么故事？');
    await user.click(screen.getByRole('button', { name: '发送' }));

    expect(await screen.findByText('当然可以，我来陪你云游。')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith(
      '/api/assistant-chat',
      expect.objectContaining({ method: 'POST' }),
    );
    await user.dblClick(screen.getByRole('button', { name: /唤醒禅小荔/ }));
    expect(
      within(screen.getByRole('dialog', { name: '禅小荔对话记录' })).getByText('国恩寺有什么故事？'),
    ).toBeVisible();
  });

  it('removes an expired conversation instead of keeping it indefinitely', () => {
    window.localStorage.setItem(
      'liuzu:assistant-history:v2',
      JSON.stringify({
        updatedAt: Date.now() - 60 * 60 * 1000 - 1,
        messages: [{ id: 'old', role: 'user', content: '旧问题', createdAt: Date.now() - 60 * 60 * 1000 - 1 }],
      }),
    );

    render(<FloatingAssistant />);
    expect(window.localStorage.getItem('liuzu:assistant-history:v2')).toBeNull();
  });
});
