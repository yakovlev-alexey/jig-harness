import { PromoBadge } from '../../components/promo-badge/promo-badge';
import './feature-highlight.css';

export function FeatureHighlightUi({ className }: { className?: string }) {
  return (
    <section className={['feature-highlight', className].filter(Boolean).join(' ')}>
      <PromoBadge label="Featured" />
    </section>
  );
}
