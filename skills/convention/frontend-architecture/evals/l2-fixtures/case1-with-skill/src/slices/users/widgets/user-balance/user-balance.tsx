import { formatCurrency } from '../../../../common/utils/format-currency';

export function UserBalance({ amount }: { amount: number }) {
  return <span>{formatCurrency(amount)}</span>;
}
