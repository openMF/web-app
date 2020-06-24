/** Shares Account Buttons Configuration */
export class SharesButtonsConfiguration {

  optionArray: {
    name: string,
    taskPermissionName: string,
  }[];

  buttonsArray: {
    name: string,
    icon: string,
    taskPermissionName: string,
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
            name: 'Apply Additional Shares',
            icon: 'fa fa-arrow-right',
            taskPermissionName: 'APPLYADDITIONAL_SHAREACCOUNT'
          },
          {
            name: 'Approve Additional Shares',
            icon: 'fa fa-arrow-right',
            taskPermissionName: 'APPROVEADDITIONAL_SHAREACCOUNT'
          },
          {
            name: 'Reject Additional Shares',
            icon: 'fa fa-arrow-left',
            taskPermissionName: 'REJECTADDITIONAL_SHAREACCOUNT'
          },
          {
            name: 'Redeem Shares',
            icon: 'fa fa-arrow-left',
            taskPermissionName: 'WITHDRAW_SAVINGSACCOUNT'
          }
        ];
        break;
      case 'Submitted and pending approval':
        this.buttonsArray = [
          {
            name: 'Modify Application',
            icon: 'fa fa-pencil ',
            taskPermissionName: 'UPDATE_SHAREACCOUNT'
          },
          {
            name: 'Approve',
            icon: 'fa fa-check',
            taskPermissionName: 'APPROVE_SHAREACCOUNT'
          }
        ];
        break;
      case 'Approved':
        this.buttonsArray = [
          {
            name: 'Undo Approval',
            icon: 'fa fa-undo',
            taskPermissionName: 'APPROVALUNDO_SHAREACCOUNT'
          },
          {
            name: 'Activate',
            icon: 'fa fa-check',
            taskPermissionName: 'ACTIVATE_SHAREACCOUNT'
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
            name: 'Close',
            taskPermissionName: 'CLOSE_SHAREACCOUNT'
          }
        ];
        break;
      case 'Submitted and pending approval':
        this.optionArray = [
          {
            name: 'Reject',
            taskPermissionName: 'REJECT_SHAREACCOUNT'
          },
          {
            name: 'Delete',
            taskPermissionName: 'DELETE_SHAREACCOUNT'
          }
        ];
        break;
      case 'Approved':
      default:
        this.optionArray = [];
    }
  }

  addOption(option: {name: string, taskPermissionName: string}) {
    this.optionArray.push(option);
  }

  removeButton(name: string) {
    const buttonNames = this.buttonsArray.map(entry => entry.name);
    const index = buttonNames.indexOf(name);
    this.buttonsArray.splice(index, 1);
  }

}
