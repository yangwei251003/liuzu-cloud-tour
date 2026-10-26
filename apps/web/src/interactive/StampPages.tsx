import { publicAssetPath } from '@liuzu/domain';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { publicSpots } from '../public/content';
import {
  createStampRepository,
  createVisibilityStampTimer,
  getStampMilestone,
} from './stampProgress';

async function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('纪念图背景加载失败'));
    image.src = src;
  });
}

async function downloadVisualPng(kind: 'card' | 'certificate', count: number) {
  const canvas = document.createElement('canvas');
  canvas.width = kind === 'certificate' ? 1600 : 1200;
  canvas.height = kind === 'certificate' ? 1100 : 760;
  const context = canvas.getContext('2d');
  if (!context) return;
  context.fillStyle = '#f5f2ea';
  context.fillRect(0, 0, canvas.width, canvas.height);
  if (kind === 'card') {
    const stamps = await loadImage(
      publicAssetPath('/media/generated/stamp-medallions-ai-v1-1536.webp'),
    );
    context.globalAlpha = 0.5;
    context.drawImage(stamps, 0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;
  }
  context.strokeStyle = '#a77c32';
  context.lineWidth = 6;
  context.strokeRect(42, 42, canvas.width - 84, canvas.height - 84);
  context.fillStyle = '#174739';
  context.textAlign = 'center';
  context.font = `700 ${kind === 'certificate' ? 96 : 76}px "Noto Serif SC", serif`;
  context.fillText(
    kind === 'certificate' ? '七景集章纪念' : '六祖云游半程纪念',
    canvas.width / 2,
    kind === 'certificate' ? 390 : 330,
  );
  context.font = '36px "Noto Sans SC", sans-serif';
  context.fillText(
    `已收集 ${count} / 7 枚演示印章`,
    canvas.width / 2,
    kind === 'certificate' ? 500 : 420,
  );
  context.font = '24px "Noto Sans SC", sans-serif';
  context.fillText(
    '网站互动纪念 · 非官方认证',
    canvas.width / 2,
    canvas.height - 100,
  );
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/png'),
  );
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download =
    kind === 'certificate'
      ? '六祖云游-纪念证书.png'
      : '六祖云游-半程纪念卡.png';
  anchor.click();
  URL.revokeObjectURL(url);
}

export function StampsPage() {
  const repository = useMemo(
    () => createStampRepository(window.localStorage),
    [],
  );
  const [collected, setCollected] = useState(() => repository.read());
  const [activeSpot, setActiveSpot] = useState(publicSpots[0].id);
  const [timerMessage, setTimerMessage] = useState(
    '选择一个景点并保持页面可见 30 秒，即可收集演示印章。',
  );
  const milestones = getStampMilestone(collected.length);

  useEffect(() => {
    if (collected.includes(activeSpot)) return;
    setTimerMessage('正在计时：页面切到后台会重新开始。');
    const timer = createVisibilityStampTimer({
      durationMs: 30_000,
      isVisible: () => document.visibilityState === 'visible',
      onUnlock: () => {
        setCollected((current) => {
          const next = [...new Set([...current, activeSpot])];
          repository.write(next);
          return next;
        });
        setTimerMessage('已收集一枚演示印章。');
      },
    });
    const onVisibility = () => timer.visibilityChanged();
    timer.start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      timer.stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [activeSpot, collected, repository]);

  return (
    <section
      className="stamps-page page-container"
      aria-labelledby="stamps-title"
    >
      <header className="stamps-heading">
        <p className="eyebrow">一程一印 · 本地演示进度</p>
        <h1 id="stamps-title">云游集章册</h1>
        <p>
          已收集 <strong>{collected.length}</strong> / 7
          枚。刷新后进度仍会保留在当前浏览器。
        </p>
      </header>
      <div
        className="stamp-progress"
        aria-label={`集章进度 ${collected.length} / 7`}
      >
        <span style={{ width: `${(collected.length / 7) * 100}%` }} />
      </div>
      <figure className="stamp-artwork">
        <picture>
          <source
            type="image/avif"
            srcSet={publicAssetPath('/media/generated/stamp-medallions-ai-v1-768.avif 768w, /media/generated/stamp-medallions-ai-v1-1536.avif 1536w')}
            sizes="(max-width: 52rem) 100vw, 80rem"
          />
          <source
            type="image/webp"
            srcSet={publicAssetPath('/media/generated/stamp-medallions-ai-v1-768.webp 768w, /media/generated/stamp-medallions-ai-v1-1536.webp 1536w')}
            sizes="(max-width: 52rem) 100vw, 80rem"
          />
          <img
            src={publicAssetPath('/media/generated/stamp-medallions-ai-v1.png')}
            alt="七枚岭南山水主题原创数字印章插画"
            width="1536"
            height="1024"
            loading="eager"
          />
        </picture>
        <figcaption>AI 视觉示意｜原创演示印章，非官方印鉴</figcaption>
      </figure>
      <div className="stamp-book">
        {publicSpots.map((spot, index) => {
          const unlocked = collected.includes(spot.id);
          return (
            <button
              key={spot.id}
              type="button"
              className={unlocked ? 'stamp-card is-unlocked' : 'stamp-card'}
              aria-pressed={activeSpot === spot.id}
              onClick={() => setActiveSpot(spot.id)}
            >
              <span className="stamp-card__number">第 {index + 1} 景</span>
              <strong>{spot.name}</strong>
              <small>{unlocked ? '已收集 · 演示印章' : '尚未收集'}</small>
            </button>
          );
        })}
      </div>
      <p className="stamp-timer" role="status">
        {timerMessage}
      </p>
      <div className="stamp-settings">
        <button type="button" aria-pressed="false" disabled>
          音效待接入
        </button>
        <span>未提供已授权音频；未来接入后默认关闭且音量上限 30%</span>
      </div>
      <div className="milestone-grid">
        <article>
          <p>4 / 7</p>
          <h2>半程纪念卡</h2>
          <span>{milestones.card ? '已解锁' : '再收集印章即可解锁'}</span>
          <button
            type="button"
            disabled={!milestones.card}
            onClick={() => void downloadVisualPng('card', collected.length)}
          >
            下载 PNG 纪念卡
          </button>
        </article>
        <article>
          <p>7 / 7</p>
          <h2>云游纪念证书</h2>
          <span>{milestones.certificate ? '已解锁' : '集齐七枚后解锁'}</span>
          {milestones.certificate ? (
            <Link className="cta-link" to="/stamps/certificate">
              查看证书
            </Link>
          ) : (
            <button type="button" disabled>
              查看证书
            </button>
          )}
        </article>
      </div>
    </section>
  );
}

export function CertificatePage() {
  const repository = useMemo(
    () => createStampRepository(window.localStorage),
    [],
  );
  const count = repository.read().length;
  const unlocked = getStampMilestone(count).certificate;
  const [shareMessage, setShareMessage] = useState('');

  async function share() {
    const data = {
      title: '六祖云游纪念证书',
      text: '我完成了六祖云游七景集章（演示）。',
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
        setShareMessage('系统分享已完成。');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(data.text);
        setShareMessage('当前浏览器不支持系统分享，分享文案已复制。');
      } else {
        setShareMessage('当前浏览器不支持系统分享或复制，请手动保存证书图片。');
      }
    } catch (error) {
      setShareMessage(
        error instanceof Error && error.name === 'AbortError'
          ? '已取消分享。'
          : '分享未完成，请下载证书后手动分享。',
      );
    }
  }

  return (
    <section
      className="certificate-page page-container"
      aria-labelledby="certificate-title"
    >
      <header>
        <p className="eyebrow">七景圆满 · 非官方认证</p>
        <h1 id="certificate-title">云游纪念证书</h1>
      </header>
      <article className={unlocked ? 'certificate is-unlocked' : 'certificate'}>
        <p className="certificate__mark">六祖云游</p>
        <h2>{unlocked ? '七景集章纪念' : '证书尚未解锁'}</h2>
        <p>
          {unlocked
            ? '谨此纪念您完成七处规划景点的数字云游体验。'
            : `当前已收集 ${count} / 7 枚演示印章，集齐后可查看与下载。`}
        </p>
        <small>本证书为网站互动纪念，不代表官方资质、荣誉或认证。</small>
      </article>
      <div className="certificate-actions">
        <Link className="text-link text-link--framed" to="/stamps">
          返回集章册
        </Link>
        <button
          type="button"
          disabled={!unlocked}
          onClick={() => void downloadVisualPng('certificate', count)}
        >
          下载 PNG 证书
        </button>
        <button type="button" disabled={!unlocked} onClick={share}>
          分享证书
        </button>
      </div>
      {shareMessage && <p role="status">{shareMessage}</p>}
    </section>
  );
}
