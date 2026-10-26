import type { MediaAsset, SourceRef } from './types';

export type MediaRenderModel =
  | {
      kind: 'image';
      src: string;
      alt: string;
      disclosure?: string;
    }
  | {
      kind: 'unavailable';
      message: string;
      disclosure?: string;
    };

export function getMediaDisclosure({
  sourceKind,
  verificationStatus,
}: Pick<
  SourceRef,
  'sourceKind' | 'verificationStatus'
>): string | undefined {
  const verificationDisclosure =
    verificationStatus === 'verified' ? undefined : '规划中/待确认';

  if (sourceKind === 'ai-generated') {
    return verificationDisclosure
      ? `AI 视觉示意（${verificationDisclosure}）`
      : 'AI 视觉示意';
  }
  return verificationDisclosure;
}

export function getMediaRenderModel(
  media: MediaAsset,
): MediaRenderModel {
  const disclosure = getMediaDisclosure(media);
  const disclosureProperty = disclosure ? { disclosure } : {};

  if (media.availability === 'unavailable') {
    return {
      kind: 'unavailable',
      message: media.fallbackText,
      ...disclosureProperty,
    };
  }

  return {
    kind: 'image',
    src: media.src,
    alt: media.alt,
    ...disclosureProperty,
  };
}
