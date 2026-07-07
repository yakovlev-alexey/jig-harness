import './feature-highlight.css';

export function FeatureHighlightUi({ className }: { className?: string }) {
  return (
    <section className={['feature-highlight', className].filter(Boolean).join(' ')}>
      <span className="feature-highlight__badge">Featured</span>
    </section>
  );
}
