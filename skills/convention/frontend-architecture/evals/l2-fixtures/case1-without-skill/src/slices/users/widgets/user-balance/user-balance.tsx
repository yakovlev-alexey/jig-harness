import { formatCurrency } from '../../../landing/utils/format-currency';

export function UserBalance({ amount }: { amount: number }) {
  return <span>{formatCurrency(amount)}</span>;
}
