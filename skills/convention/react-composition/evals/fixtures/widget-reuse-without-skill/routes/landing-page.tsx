import { SignupCtaWidget } from '../slices/landing/widgets/signup-cta/signup-cta.widget';
import './landing-page.css';

export function LandingPage() {
  return (
    <main className="landing-page">
      <SignupCtaWidget />
    </main>
  );
}
