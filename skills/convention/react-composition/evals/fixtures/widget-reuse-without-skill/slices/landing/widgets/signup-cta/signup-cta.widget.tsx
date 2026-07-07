import { FeatureHighlightWidget } from '../feature-highlight/feature-highlight.widget';
import { SignupCtaUi } from './signup-cta';

export function SignupCtaWidget() {
  return (
    <section className="signup-cta-widget">
      <FeatureHighlightWidget />
      <SignupCtaUi />
    </section>
  );
}
