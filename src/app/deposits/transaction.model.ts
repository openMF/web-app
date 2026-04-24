export type TransactionCommand = 'deposit' | 'withdrawal';

export type TransactionTypeFlags = {
  [key in TransactionCommand]: boolean;
};
