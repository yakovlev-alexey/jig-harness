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
