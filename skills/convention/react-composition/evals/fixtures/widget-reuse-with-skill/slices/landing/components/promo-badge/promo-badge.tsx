import './promo-badge.css';

export function PromoBadge({ label }: { label: string }) {
  return <span className="promo-badge">{label}</span>;
}
