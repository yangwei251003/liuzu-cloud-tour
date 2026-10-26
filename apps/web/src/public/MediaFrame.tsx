import { publicAssetPath } from '@liuzu/domain';
import { getMediaRenderModel, type MediaAsset } from '@liuzu/domain';
import { useEffect, useState } from 'react';

interface MediaFrameProps {
  media: MediaAsset;
  className?: string;
  eager?: boolean;
}

export function MediaFrame({ media, className = '', eager = false }: MediaFrameProps) {
  const model = getMediaRenderModel(media);
  const generatedStem =
    model.kind === 'image' && model.src.startsWith(publicAssetPath('/media/generated/')) && model.src.endsWith('.png')
      ? model.src.slice(0, -4)
      : null;
  const [imageState, setImageState] = useState<'loading' | 'ready' | 'error'>(
    model.kind === 'image' ? 'loading' : 'ready',
  );

  useEffect(() => {
    setImageState(model.kind === 'image' ? 'loading' : 'ready');
  }, [media.id, model.kind]);

  return (
    <figure className={`media-frame ${className}`.trim()} data-state={imageState}>
      {model.kind === 'image' && imageState !== 'error' ? (
        <div className="media-frame__visual">
          {imageState === 'loading' ? (
            <span className="media-frame__loading" role="status">
              素材载入中
            </span>
          ) : null}
          <picture>
            {generatedStem ? (
              <>
                <source
                  type="image/avif"
                  srcSet={`${generatedStem}-768.avif 768w, ${generatedStem}-1536.avif 1536w`}
                  sizes="(max-width: 48rem) 100vw, 50vw"
                />
                <source
                  type="image/webp"
                  srcSet={`${generatedStem}-768.webp 768w, ${generatedStem}-1536.webp 1536w`}
                  sizes="(max-width: 48rem) 100vw, 50vw"
                />
              </>
            ) : null}
            <img
              src={model.src}
              alt={model.alt}
              loading={eager ? 'eager' : 'lazy'}
              fetchPriority={eager ? 'high' : 'auto'}
              onLoad={() => setImageState('ready')}
              onError={() => setImageState('error')}
            />
          </picture>
        </div>
      ) : (
        <div
          className="media-frame__fallback"
          role="img"
          aria-label={`${media.alt}，素材待接入`}
        >
          <strong>素材待接入</strong>
          <span>版式与裁切区域已预留</span>
        </div>
      )}
      {model.disclosure ? (
        <figcaption className="media-frame__disclosure">
          {model.disclosure}
        </figcaption>
      ) : null}
    </figure>
  );
}
