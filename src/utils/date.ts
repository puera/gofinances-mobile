import { DataListProps } from '../screens/Dashboard';

export function getLastTransaction(
  collection: DataListProps[],
  type: 'positive' | 'negative',
) {
  const transactions = collection
    .filter((transaction) => transaction.type === type)
    .map((transaction) => new Date(transaction.date).getTime());

  const lastTransaction = new Date(Math.max(...transactions));

  return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleDateString(
    'pt-BR',
    {
      month: 'long',
    },
  )}`;
}
