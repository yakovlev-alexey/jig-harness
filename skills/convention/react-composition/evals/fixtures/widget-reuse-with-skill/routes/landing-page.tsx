import { FeatureHighlightWidget } from '../slices/landing/widgets/feature-highlight/feature-highlight.widget';
import { SignupCtaWidget } from '../slices/landing/widgets/signup-cta/signup-cta.widget';
import './landing-page.css';

export function LandingPage() {
  return (
    <main className="landing-page">
      <FeatureHighlightWidget className="landing-page__highlight" />
      <SignupCtaWidget />
    </main>
  );
}
