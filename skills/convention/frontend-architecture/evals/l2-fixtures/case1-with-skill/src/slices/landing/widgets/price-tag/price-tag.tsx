import { formatCurrency } from '../../../../common/utils/format-currency';

export function PriceTag({ amount }: { amount: number }) {
  return <span>{formatCurrency(amount)}</span>;
}
