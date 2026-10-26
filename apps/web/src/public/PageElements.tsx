import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <header className="section-heading">
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </header>
  );
}

export function PlanningNote({ children }: { children: ReactNode }) {
  return <p className="planning-note">规划中/待确认：{children}</p>;
}

export function NotFoundState({
  title,
  description,
  to,
  linkLabel,
}: {
  title: string;
  description: string;
  to: string;
  linkLabel: string;
}) {
  return (
    <section className="not-found" aria-labelledby="not-found-title">
      <p className="not-found__code">404</p>
      <h1 id="not-found-title">{title}</h1>
      <p>{description}</p>
      <Link className="text-link text-link--framed" to={to}>
        {linkLabel}
      </Link>
    </section>
  );
}
