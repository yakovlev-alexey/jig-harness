# React composition examples

## Page composes widgets and components (rc-no-page-imports-page)

```tsx
// landing-page.tsx
import { HeroBanner } from '../../components/hero-banner/hero-banner';
import { FeatureHighlightWidget } from '../../widgets/feature-highlight/feature-highlight.widget';
import './landing-page.css';

export function LandingPage() {
  return (
    <main className="landing-page">
      <HeroBanner />
      <FeatureHighlightWidget className="landing-page__highlight" />
    </main>
  );
}
```

## Widget folder (rc-widget-suffix, rc-colocated-css)

```text
widgets/feature-highlight/
  feature-highlight.tsx
  feature-highlight.css
  feature-highlight.widget.tsx
```

```tsx
// feature-highlight.widget.tsx
import { FeatureHighlightUi } from './feature-highlight';

export function FeatureHighlightWidget({ className }: { className?: string }) {
  return <FeatureHighlightUi className={className} />;
}
```

## BEM (rc-bem-class-names)

```css
.landing-page__highlight {
  max-width: 36rem;
}
```

Pages pass positioning classes; widgets/components accept optional `className`.
