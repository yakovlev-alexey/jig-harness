import { PromoBadge } from '../../components/promo-badge/promo-badge';
import './signup-cta.css';

export function SignupCtaUi() {
  return (
    <section className="signup-cta">
      <PromoBadge label="Sign up" />
    </section>
  );
}
