import type { ReactNode } from 'react';

export type StatusPanelState = 'loading' | 'empty' | 'error' | 'success';

export interface StatusPanelProps {
  status: StatusPanelState;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function StatusPanel({
  status,
  title,
  description,
  action,
}: StatusPanelProps) {
  const liveProps =
    status === 'error'
      ? ({ role: 'alert' } as const)
      : ({ role: 'status', 'aria-live': 'polite' } as const);

  return (
    <section
      className={`status-panel status-panel--${status}`}
      {...liveProps}
    >
      <span className="status-panel__mark" aria-hidden="true" />
      <div>
        <h2 className="status-panel__title">{title}</h2>
        {description ? (
          <p className="status-panel__description">{description}</p>
        ) : null}
        {action ? <div className="status-panel__action">{action}</div> : null}
      </div>
    </section>
  );
}
