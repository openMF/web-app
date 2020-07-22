/** Recurring Deposits Account Buttons Configuration */
export class RecurringDepositsButtonsConfiguration {

  optionArray: {
    name: string,
    taskPermissionName?: string,
  }[];

  buttonsArray: {
    name: string,
    icon: string,
    taskPermissionName?: string,
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
            icon: 'fa fa-arrow-up'
          },
          {
            name: 'Premature Close',
            icon: 'fa fa-arrow-left'
          },
          {
            name: 'Calculate Interest',
            icon: 'fa fa-table',
          }
        ];
        break;
      case 'Submitted and pending approval':
        this.buttonsArray = [
          {
            name: 'Modify Application',
            icon: 'fa fa-pencil ',
          },
          {
            name: 'Approve',
            icon: 'fa fa-check'
          }
        ];
        break;
      case 'Approved':
        this.buttonsArray = [
          {
            name: 'Undo Approval',
            icon: 'fa fa-undo'
          },
          {
            name: 'Activate',
            icon: 'fa fa-check'
          }
        ];
      break;
      case 'Matured':
        this.buttonsArray = [
          {
            name: 'Close',
            icon: 'fa fa-arrow-right'
          },
          {
            name: 'Calculate Interest',
            icon: 'fa fa-table'
          },
          {
            name: 'Post Interest',
            icon: 'fa fa-table'
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
          },
          {
            name: 'Add Charge',
          }
        ];
        break;
      case 'Submitted and pending approval':
        this.optionArray = [
          {
            name: 'Reject'
          },
          {
            name: 'Withdraw By Client'
          },
          {
            name: 'Add Charge'
          },
          {
            name: 'Delete'
          }
        ];
        break;
      case 'Matured':
        this.optionArray = [
          {
            name: 'Add Charge'
          }
        ];
        break;
      case 'Approved':
      default:
        this.optionArray = [];
    }
  }

  addOption(option: {name: string, icon?: string, taskPermissionName?: string}) {
    this.optionArray.push(option);
  }

  addButton(option: { name: string, icon: string, taskPermissionName?: string }) {
    this.buttonsArray.push(option);
  }

}
