/**
 * Charge Model
 */
export interface Charge {
  name: string;
  feeOrPenalty: string;
  paymentDueAt: string;
  calculationType: string;
  due: string;
  paid: string;
  waived: string;
  outstanding: string;
}
