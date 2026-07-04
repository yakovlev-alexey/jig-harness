import { FeatureHighlightUi } from './feature-highlight';

type FeatureHighlightWidgetProps = {
  className?: string;
};

export function FeatureHighlightWidget({ className }: FeatureHighlightWidgetProps) {
  return <FeatureHighlightUi className={className} />;
}
