import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { HeroMedia } from './HeroMedia';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: originalMatchMedia,
  });
});

describe('HeroMedia', () => {
  it('uses the silent desktop loop with a static poster fallback', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: false }),
    });

    const { container } = render(<HeroMedia />);
    const video = container.querySelector('video');

    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveProperty('muted', true);
    expect(video).toHaveAttribute('loop');
    expect(video).toHaveAttribute('playsinline');
    expect(video).toHaveAttribute('preload', 'auto');
    expect(video).toHaveAttribute(
      'poster',
      '/media/generated/hero-shanshui-ai-v1-1536.webp',
    );
    expect(container.querySelector('source[type="video/webm"]')).toHaveAttribute(
      'src',
      '/media/hero/hero-cloud-loop.webm',
    );
    expect(container.querySelector('source[type="video/mp4"]')).toHaveAttribute(
      'src',
      '/media/hero/hero-cloud-loop.mp4',
    );
    expect(container.querySelector('video')).toHaveAttribute(
      'data-primary-source',
      '/media/hero/hero-cloud-loop.mp4',
    );
    expect(screen.getByRole('img', { name: /云雾山水/ })).toBeInTheDocument();
  });

  it('renders only the responsive poster when reduced motion is requested', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({ matches: true }),
    });

    const { container } = render(<HeroMedia />);

    expect(container.querySelector('video')).not.toBeInTheDocument();
    expect(container.querySelector('picture source[type="image/avif"]')).toHaveAttribute(
      'srcset',
      expect.stringContaining('hero-shanshui-ai-v1-768.avif'),
    );
  });
});
