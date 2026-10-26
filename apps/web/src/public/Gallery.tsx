import type { MediaAsset } from '@liuzu/domain';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { MediaFrame } from './MediaFrame';

interface GalleryProps {
  title: string;
  items: MediaAsset[];
}

export function Gallery({ title, items }: GalleryProps) {
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const showPrevious = () => {
    setIndex((current) => (current - 1 + items.length) % items.length);
  };

  const showNext = () => {
    setIndex((current) => (current + 1) % items.length);
  };

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLightboxOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = Array.from(
        dialogRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])') ?? [],
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    const dialog = dialogRef.current;
    const backgroundStates = Array.from(document.body.children)
      .filter((element): element is HTMLElement =>
        element instanceof HTMLElement && element !== dialog,
      )
      .map((element) => ({
        element,
        hadInert: element.hasAttribute('inert'),
        inertValue: element.getAttribute('inert'),
        hadAriaHidden: element.hasAttribute('aria-hidden'),
        ariaHiddenValue: element.getAttribute('aria-hidden'),
      }));
    backgroundStates.forEach(({ element }) => {
      element.setAttribute('inert', '');
      element.setAttribute('aria-hidden', 'true');
    });
    document.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      backgroundStates.forEach(({
        element,
        hadInert,
        inertValue,
        hadAriaHidden,
        ariaHiddenValue,
      }) => {
        if (hadInert) element.setAttribute('inert', inertValue ?? '');
        else element.removeAttribute('inert');
        if (hadAriaHidden) element.setAttribute('aria-hidden', ariaHiddenValue ?? '');
        else element.removeAttribute('aria-hidden');
      });
      openButtonRef.current?.focus();
    };
  }, [lightboxOpen]);

  if (items.length === 0) {
    return (
      <section className="gallery" aria-label={title}>
        <p role="status">暂无图集素材</p>
      </section>
    );
  }

  return (
    <section className="gallery" aria-label={title}>
      <MediaFrame media={items[index]} className="gallery__media" />
      <div className="gallery__controls">
        <button type="button" onClick={showPrevious}>
          上一张
        </button>
        <p aria-live="polite">第 {index + 1} 张，共 {items.length} 张</p>
        <button type="button" onClick={showNext}>
          下一张
        </button>
        <button
          ref={openButtonRef}
          type="button"
          className="gallery__expand"
          onClick={() => setLightboxOpen(true)}
        >
          放大查看
        </button>
      </div>

      {lightboxOpen ? createPortal(
        <div
          ref={dialogRef}
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <div className="lightbox__panel">
            <button
              ref={closeButtonRef}
              type="button"
              className="lightbox__close"
              onClick={() => setLightboxOpen(false)}
            >
              关闭图集
            </button>
            <MediaFrame media={items[index]} className="lightbox__media" />
            <div className="lightbox__controls">
              <button type="button" onClick={showPrevious}>
                上一张
              </button>
              <span>第 {index + 1} 张，共 {items.length} 张</span>
              <button type="button" onClick={showNext}>
                下一张
              </button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </section>
  );
}
