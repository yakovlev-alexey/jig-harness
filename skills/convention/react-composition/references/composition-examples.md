# React composition examples

## Route file composes widgets and components (rc-no-page-imports-page, rc-fs-routing)

```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router';
import { HeroBanner } from '@/slices/landing/components/hero-banner/hero-banner';
import { FeatureHighlightWidget } from '@/slices/landing/widgets/feature-highlight/feature-highlight.widget';
import './index.css';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  return (
    <main className="home-page">
      <HeroBanner />
      <FeatureHighlightWidget className="home-page__highlight" />
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
.home-page__highlight {
  max-width: 36rem;
}
```

Pages pass positioning classes; widgets/components accept optional `className`.
