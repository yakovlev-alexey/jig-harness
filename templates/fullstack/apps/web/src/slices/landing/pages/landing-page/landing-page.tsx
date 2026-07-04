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
