import './feature-highlight.css';

type FeatureHighlightUiProps = {
  className?: string;
};

export function FeatureHighlightUi({ className }: FeatureHighlightUiProps) {
  return (
    <div className={['feature-highlight', className].filter(Boolean).join(' ')}>
      <p className="feature-highlight__text">
        Vertical slices, generators, and lint-enforced conventions.
      </p>
    </div>
  );
}
