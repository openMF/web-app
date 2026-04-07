/** Recurring Deposits Account Buttons Configuration */
export class RecurringDepositsButtonsConfiguration {
  optionArray: {
    name: string;
    icon?: string;
    taskPermissionName: string;
  }[];

  buttonsArray: {
    name: string;
    icon: string;
    taskPermissionName: string;
  }[];

  constructor(status: string) {
    this.setOptions(status);
    this.setButtons(status);
  }

  get singleButtons() {
    return this.buttonsArray;
  }

  get options() {
    return this.optionArray;
  }

  setButtons(status: string) {
    switch (status) {
      case 'Active':
        this.buttonsArray = [
          {
            name: 'Deposit',
            icon: 'fa fa-arrow-up',
            taskPermissionName: 'DEPOSIT_RECURRINGDEPOSITACCOUNT'
          },
          {
            name: 'Withdrawal',
            icon: 'fa fa-arrow-down',
            taskPermissionName: 'WITHDRAWAL_RECURRINGDEPOSITACCOUNT'
          },
          {
            name: 'Premature Close',
            icon: 'fa fa-arrow-left',
            taskPermissionName: 'PREMATURECLOSE_RECURRINGDEPOSITACCOUNT'
          },
          {
            name: 'Calculate Interest',
            icon: 'fa fa-calculator',
            taskPermissionName: 'CALCULATEINTEREST_RECURRINGDEPOSITACCOUNT'
          },
          {
            name: 'Undo Activation',
            icon: 'fa fa-undo',
            taskPermissionName: 'UNDO_ACTIVATE_RECURRINGDEPOSITACCOUNT'
          }
        ];
        break;
      case 'Submitted and pending approval':
        this.buttonsArray = [
          {
            name: 'Modify Application',
            icon: 'fa fa-edit',
            taskPermissionName: 'UPDATE_RECURRINGDEPOSITACCOUNT'
          },
          {
            name: 'Approve',
            icon: 'fa fa-check',
            taskPermissionName: 'APPROVE_RECURRINGDEPOSITACCOUNT'
          }
        ];
        break;
      case 'Approved':
        this.buttonsArray = [
          {
            name: 'Undo Approval',
            icon: 'fa fa-undo',
            taskPermissionName: 'APPROVALUNDO_RECURRINGDEPOSITACCOUNT'
          },
          {
            name: 'Activate',
            icon: 'fa fa-check',
            taskPermissionName: 'ACTIVATE_RECURRINGDEPOSITACCOUNT'
          }
        ];
        break;
      case 'Matured':
        this.buttonsArray = [
          {
            name: 'Close',
            icon: 'fa fa-arrow-right',
            taskPermissionName: 'CLOSE_RECURRINGDEPOSITACCOUNT'
          },
          {
            name: 'Calculate Interest',
            icon: 'fa fa-calculator',
            taskPermissionName: 'CALCULATEINTEREST_RECURRINGDEPOSITACCOUNT'
          },
          {
            name: 'Post Interest',
            icon: 'fa fa-money',
            taskPermissionName: 'POSTINTEREST_RECURRINGDEPOSITACCOUNT'
          }
        ];
        break;
      default:
        this.buttonsArray = [];
    }
  }

  setOptions(status: string) {
    switch (status) {
      case 'Active':
        this.optionArray = [
          {
            name: 'Post Interest',
            icon: 'table',
            taskPermissionName: 'POSTINTEREST_RECURRINGDEPOSITACCOUNT'
          },
          {
            name: 'Add Charge',
            icon: 'plus',
            taskPermissionName: 'POSTINTEREST_RECURRINGDEPOSITACCOUNT'
          }
        ];
        break;
      case 'Submitted and pending approval':
        this.optionArray = [
          {
            name: 'Reject',
            icon: 'ban',
            taskPermissionName: 'REJECT_RECURRINGDEPOSITACCOUNT'
          },
          {
            name: 'Withdrawn by Client',
            icon: 'arrow-down',
            taskPermissionName: 'WITHDRAW_RECURRINGDEPOSITACCOUNT'
          },
          {
            name: 'Add Charge',
            icon: 'plus',
            taskPermissionName: 'ADDCHARGE_RECURRINGDEPOSITACCOUNT'
          },
          {
            name: 'Delete',
            icon: 'trash',
            taskPermissionName: 'DELETE_RECURRINGDEPOSITACCOUNT'
          }
        ];
        break;
      case 'Matured':
        this.optionArray = [
          {
            name: 'Add Charge',
            icon: 'plus',
            taskPermissionName: 'ADDCHARGE_RECURRINGDEPOSITACCOUNT'
          }
        ];
        break;
      case 'Approved':
      default:
        this.optionArray = [];
    }
  }

  addOption(option: { name: string; icon?: string; taskPermissionName: string }) {
    this.optionArray.push(option);
  }

  addButton(option: { name: string; icon: string; taskPermissionName: string }) {
    this.buttonsArray.push(option);
  }
}
