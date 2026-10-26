import { publicAssetPath } from '@liuzu/domain';
import { useEffect, useRef, useState } from 'react';

const alt = '云雾山水、古塔与荔枝枝叶构成的六祖云游首页视觉';

function prefersStaticHero() {
  if (typeof window === 'undefined') return true;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const connection = navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  return Boolean(
    reducedMotion ||
      connection.connection?.saveData ||
      connection.connection?.effectiveType === '2g' ||
      connection.connection?.effectiveType === 'slow-2g',
  );
}

function HeroPoster() {
  return (
    <picture className="hero-media__poster">
      <source
        type="image/avif"
        srcSet={publicAssetPath('/media/generated/hero-shanshui-ai-v1-768.avif 768w, /media/generated/hero-shanshui-ai-v1-1536.avif 1536w')}
        sizes="100vw"
      />
      <source
        type="image/webp"
        srcSet={publicAssetPath('/media/generated/hero-shanshui-ai-v1-768.webp 768w, /media/generated/hero-shanshui-ai-v1-1536.webp 1536w')}
        sizes="100vw"
      />
      <img
        src={publicAssetPath('/media/generated/hero-shanshui-ai-v1-1536.webp')}
        width="1536"
        height="1024"
        alt={alt}
        decoding="async"
        fetchPriority="high"
      />
    </picture>
  );
}

function attemptPlayback(video: HTMLVideoElement, onBlocked: (value: boolean) => void) {
  video.muted = true;
  const playback = video.play();
  if (playback && typeof playback.then === 'function') {
    void playback.then(
      () => onBlocked(false),
      () => onBlocked(true),
    );
  }
}

export function HeroMedia() {
  const [staticOnly, setStaticOnly] = useState(prefersStaticHero);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const queries = [
      window.matchMedia('(prefers-reduced-motion: reduce)'),
    ];
    const update = () => setStaticOnly(prefersStaticHero());
    queries.forEach((query) => query.addEventListener?.('change', update));
    return () => queries.forEach((query) => query.removeEventListener?.('change', update));
  }, []);

  useEffect(() => {
    if (staticOnly || !videoRef.current) return;
    attemptPlayback(videoRef.current, setPlaybackBlocked);
  }, [staticOnly]);

  if (staticOnly) return <HeroPoster />;

  return (
    <div className="hero-media">
      <HeroPoster />
      <video
        ref={videoRef}
        className="hero-media__video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={publicAssetPath('/media/generated/hero-shanshui-ai-v1-1536.webp')}
        aria-hidden="true"
        data-primary-source={publicAssetPath('/media/hero/hero-cloud-loop.mp4')}
        onCanPlay={() => {
          const video = videoRef.current;
          if (!video) return;
          attemptPlayback(video, setPlaybackBlocked);
        }}
      >
        <source src={publicAssetPath('/media/hero/hero-cloud-loop.mp4')} type="video/mp4" />
        <source src={publicAssetPath('/media/hero/hero-cloud-loop.webm')} type="video/webm" />
      </video>
      {playbackBlocked ? (
        <button
          className="hero-media__play"
          type="button"
          onClick={() => {
            const video = videoRef.current;
            if (video) attemptPlayback(video, setPlaybackBlocked);
          }}
        >
          播放动态首屏
        </button>
      ) : null}
    </div>
  );
}
