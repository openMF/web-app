/**
 * Purchased Share Model
 */
export interface PurchasedShare {
  transactionDate: string;
  transactionType: string;
  totalShares: number;
  purchasedOrRedeemedPrice: string;
  chargeAmount: string;
  amountRecievedOrReturned: string;
}
