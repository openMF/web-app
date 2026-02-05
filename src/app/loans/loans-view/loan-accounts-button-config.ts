/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { OptionData } from 'app/shared/models/option-data.model';

/** Recurring Deposits Account Buttons Configuration */
export class LoansAccountButtonConfiguration {
  optionArray: {
    name: string;
    taskPermissionName?: string;
  }[];

  optionPaymentArray: {
    name: string;
    taskPermissionName?: string;
  }[];

  buttonsArray: {
    name: string;
    icon: string;
    taskPermissionName?: string;
  }[];

  constructor(status: string, substatus: OptionData) {
    this.setOptions(status, substatus);
    this.setButtons(status);
  }

  get singleButtons() {
    return this.buttonsArray;
  }

  get options() {
    return this.optionArray;
  }

  get optionsPayment() {
    return this.optionPaymentArray;
  }

  setButtons(status: string) {
    switch (status) {
      case 'Active':
        this.buttonsArray = [
          {
            name: 'Add Loan Charge',
            icon: 'plus',
            taskPermissionName: 'CREATE_LOANCHARGE'
          },
          {
            name: 'Foreclosure',
            icon: 'heart-broken',
            taskPermissionName: 'FORECLOSURE_LOAN'
          },
          {
            name: 'Make Repayment',
            icon: 'coins',
            taskPermissionName: 'REPAYMENT_LOAN'
          },
          {
            name: 'Undo Disbursal',
            icon: 'undo',
            taskPermissionName: 'DISBURSALUNDO_LOAN'
          }
        ];
        break;
      case 'Submitted and pending approval':
        this.buttonsArray = [
          {
            name: 'Add Loan Charge',
            icon: 'plus',
            taskPermissionName: 'CREATE_LOANCHARGE'
          },
          {
            name: 'Approve',
            icon: 'check',
            taskPermissionName: 'APPROVE_LOAN'
          },
          {
            name: 'Modify Application',
            icon: 'edit',
            taskPermissionName: 'UPDATE_LOAN'
          },
          {
            name: 'Reject',
            icon: 'times',
            taskPermissionName: 'REJECT_LOAN'
          },
          {
            name: 'Attach Loan Originator',
            icon: 'edit',
            taskPermissionName: 'ATTACH_LOAN_ORIGINATOR'
          }
        ];
        break;
      case 'Approved':
        this.buttonsArray = [
          {
            name: 'Disburse',
            icon: 'hand-holding-usd',
            taskPermissionName: 'DISBURSE_LOAN'
          },
          {
            name: 'Disburse to Savings',
            icon: 'piggy-bank',
            taskPermissionName: 'DISBURSETOSAVINGS_LOAN'
          },
          {
            name: 'Undo Approval',
            icon: 'undo',
            taskPermissionName: 'APPROVALUNDO_LOAN'
          }
        ];
        break;
      case 'Overpaid':
        this.buttonsArray = [
          {
            name: 'Add Loan Charge',
            icon: 'plus',
            taskPermissionName: 'CREATE_LOANCHARGE'
          },
          {
            name: 'Transfer Funds',
            icon: 'exchange',
            taskPermissionName: 'CREATE_ACCOUNTTRANSFER'
          },
          {
            name: 'Credit Balance Refund',
            icon: 'coins',
            taskPermissionName: 'CREATE_CREDIT_BALANCE_REFUND'
          }
        ];
        break;
      case 'Closed (written off)':
        this.buttonsArray = [
          {
            name: 'Recovery Payment',
            icon: 'briefcase',
            taskPermissionName: 'RECOVERYPAYMENT_LOAN'
          },
          {
            name: 'Undo Write-off',
            icon: 'undo',
            taskPermissionName: 'UNDOWRITEOFF_LOAN'
          }
        ];
        break;
      case 'Closed (obligations met)':
        this.buttonsArray = [
          {
            name: 'Goodwill Credit',
            icon: 'coins',
            taskPermissionName: 'CREATE_GOODWILL_TRANSACTION'
          },
          {
            name: 'Interest Payment Waiver',
            icon: 'coins',
            taskPermissionName: 'CREATE_INTERESTPAYMENTWAIVER_TRANSACTION'
          },
          {
            name: 'Payout Refund',
            icon: 'coins',
            taskPermissionName: 'CREATE_PAYOUT_REFUND'
          },
          {
            name: 'Merchant Issued Refund',
            icon: 'coins',
            taskPermissionName: 'CREATE_MERCHANT_ISSUED_REFUND'
          }
        ];
        break;
      default:
        this.buttonsArray = [];
    }
  }

  setOptions(status: string, substatus: OptionData) {
    switch (status) {
      case 'Active':
        this.optionArray = [
          {
            name: 'Waive Interest',
            taskPermissionName: 'WAIVEINTERESTPORTION_LOAN'
          },
          {
            name: 'Reschedule',
            taskPermissionName: 'CREATE_RESCHEDULELOAN'
          },
          {
            name: 'Write Off',
            taskPermissionName: 'WRITEOFF_LOAN'
          },
          {
            name: 'Close (as Rescheduled)',
            taskPermissionName: 'CLOSEASRESCHEDULED_LOAN'
          },
          {
            name: 'Close',
            taskPermissionName: 'CLOSE_LOAN'
          },
          {
            name: 'Loan Screen Report',
            taskPermissionName: 'READ_LOAN'
          },
          {
            name: 'View Guarantors',
            taskPermissionName: 'READ_GUARANTOR'
          },
          {
            name: 'Create Guarantor',
            taskPermissionName: 'CREATE_GUARANTOR'
          },
          {
            name: 'Recover From Guarantor',
            taskPermissionName: 'RECOVERGUARANTEES_LOAN'
          },
          {
            name: 'Sell Loan',
            taskPermissionName: 'SALE_LOAN'
          }
        ];
        if (!this.isContractTermination(substatus)) {
          this.optionArray.push({
            name: 'Contract Termination',
            taskPermissionName: 'CONTRACT_TERMINATION_LOAN'
          });
        }
        this.optionPaymentArray = [
          {
            name: 'Goodwill Credit',
            taskPermissionName: 'CREATE_GOODWILL_TRANSACTION'
          },
          {
            name: 'Interest Payment Waiver',
            taskPermissionName: 'CREATE_INTERESTPAYMENTWAIVER_TRANSACTION'
          },
          {
            name: 'Payout Refund',
            taskPermissionName: 'CREATE_PAYOUT_REFUND'
          },
          {
            name: 'Merchant Issued Refund',
            taskPermissionName: 'CREATE_MERCHANT_ISSUED_REFUND'
          }
        ];
        break;
      case 'Submitted and pending approval':
        this.optionArray = [
          {
            name: 'Withdrawn by Client',
            taskPermissionName: 'WITHDRAW_LOAN'
          },
          {
            name: 'Delete',
            taskPermissionName: 'DELETE_LOAN'
          },
          {
            name: 'Add Collateral',
            taskPermissionName: 'CREATE_COLLATERAL'
          },
          {
            name: 'View Guarantors',
            taskPermissionName: 'READ_GUARANTOR'
          },
          {
            name: 'Create Guarantor',
            taskPermissionName: 'CREATE_GUARANTOR'
          },
          {
            name: 'Loan Screen Reports',
            taskPermissionName: 'READ_LOAN'
          }
        ];
        this.optionPaymentArray = [];
        break;
      case 'Approved':
        this.optionArray = [
          {
            name: 'Add Loan Charge',
            taskPermissionName: 'CREATE_LOANCHARGE'
          },
          {
            name: 'View Guarantors',
            taskPermissionName: 'READ_GUARANTOR'
          },
          {
            name: 'Create Guarantor',
            taskPermissionName: 'CREATE_GUARANTOR'
          },
          {
            name: 'Loan Screen Report',
            taskPermissionName: 'READ_LOAN'
          }
        ];
        this.optionPaymentArray = [];
        break;
      default:
        this.optionArray = [];
        this.optionPaymentArray = [];
    }
  }

  addOption(option: { name: string; icon?: string; taskPermissionName?: string }) {
    this.optionArray.push(option);
  }

  addButton(option: { name: string; icon: string; taskPermissionName?: string }) {
    this.buttonsArray.push(option);
  }

  private isContractTermination(substatus: OptionData): boolean {
    if (substatus == null) {
      return false;
    }
    return substatus.code === 'loanSubStatus.loanSubStatusType.contractTermination';
  }
}
