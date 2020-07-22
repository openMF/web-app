/** Recurring Deposits Account Buttons Configuration */
export class LoansAccountButtonConfiguration {

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
                        name: 'Add Loan Charge',
                        icon: 'fa fa-plus',
                        taskPermissionName: 'CREATE_LOANCHARGE',
                    },
                    {
                        name: 'Foreclosure',
                        icon: 'icon-dollar',
                        taskPermissionName: 'FORECLOSURE_LOAN',
                    },
                    {
                        name: 'Make Repayment',
                        icon: 'fa fa-dollar',
                        taskPermissionName: 'REPAYMENT_LOAN',
                    },
                    {
                        name: 'Undo Disbursal',
                        icon: 'fa fa-undo',
                        taskPermissionName: 'DISBURSALUNDO_LOAN',
                    },
                ];
                break;
            case 'Submitted and pending approval':
                this.buttonsArray = [
                    {
                        name: 'Add Loan Charge',
                        icon: 'fa fa-plus',
                        taskPermissionName: 'CREATE_LOANCHARGE',
                    },
                    {
                        name: 'Approve',
                        icon: 'fa fa-check',
                        taskPermissionName: 'APPROVE_LOAN',
                    },
                    {
                        name: 'Modify Application',
                        icon: 'fa fa-pincel-square-o',
                        taskPermissionName: 'UPDATE_LOAN',
                    },
                    {
                        name: 'Reject',
                        icon: 'fa fa-times',
                        taskPermissionName: 'REJECT_LOAN',
                    },
                ];
                break;
            case 'Approved':
                this.buttonsArray = [
                    {
                        name: 'Disburse',
                        icon: 'fa fa-flag',
                        taskPermissionName: 'DISBURSE_LOAN',
                    },
                    {
                        name: 'Disburse to Savings',
                        icon: 'fa fa-flag',
                        taskPermissionName: 'DISBURSETOSAVINGS_LOAN',
                    },
                    {
                        name: 'Undo Approval',
                        icon: 'fa fa-undo',
                        taskPermissionName: 'APPROVALUNDO_LOAN',
                    },
                ];
                break;
            case 'Overpaid':
                this.buttonsArray = [
                    {
                        name: 'Transfer Funds',
                        icon: 'fa fa-exchange',
                        taskPermissionName: 'CREATE_ACCOUNTTRANSFER',
                    },
                ];
                break;
            case 'Closed (written off)':
                this.buttonsArray = [
                    {
                        name: 'Recovery Payment',
                        icon: 'fa fa-briefcase',
                        taskPermissionName: 'RECOVERYPAYMENT_LOAN',
                    },
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
                        name: 'Waive Interest',
                        taskPermissionName: 'WAIVEINTERESTPORTION_LOAN',
                    },
                    {
                        name: 'Reschedule',
                        taskPermissionName: 'CREATE_RESCHEDULELOAN',
                    },
                    {
                        name: 'Write Off',
                        taskPermissionName: 'WRITEOFF_LOAN',
                    },
                    {
                        name: 'Close (as Rescheduled)',
                        taskPermissionName: 'CLOSEASRESCHEDULED_LOAN',
                    },
                    {
                        name: 'Close',
                        taskPermissionName: 'CLOSE_LOAN',
                    },
                    {
                        name: 'Loan Screen Report',
                        taskPermissionName: 'READ_LOAN',
                    },
                    {
                        name: 'View Guarantors',
                        taskPermissionName: 'READ_GUARANTOR',
                    },
                    {
                        name: 'Create Guarantor',
                        taskPermissionName: 'CREATE_GUARANTOR',
                    },
                    {
                        name: 'Recover From Guarantor',
                        taskPermissionName: 'RECOVERGUARANTEES_LOAN',
                    },
                ];
                break;
            case 'Submitted and pending approval':
                this.optionArray = [
                    {
                        name: 'Withdrawn by client',
                        taskPermissionName: 'WITHDRAW_LOAN',
                    },
                    {
                        name: 'Delete',
                        taskPermissionName: 'DELETE_LOAN',
                    },
                    {
                        name: 'Add Collateral',
                        taskPermissionName: 'CREATE_COLLATERAL',
                    },
                    {
                        name: 'View Guarantors',
                        taskPermissionName: 'READ_GUARANTOR',
                    },
                    {
                        name: 'Create Guarantor',
                        taskPermissionName: 'CREATE_GUARANTOR',
                    },
                    {
                        name: 'Loan Screen Reports',
                        taskPermissionName: 'READ_LOAN',
                    },
                ];
                break;
            case 'Approved':
                this.optionArray = [
                    {
                        name: 'Add Loan Charge',
                        taskPermissionName: 'CREATE_LOANCHARGE',
                    },
                    {
                        name: 'View Guarantors',
                        taskPermissionName: 'READ_GUARANTOR',
                    },
                    {
                        name: 'Create Guarantor',
                        taskPermissionName: 'CREATE_GUARANTOR',
                    },
                    {
                        name: 'Loan Screen Report',
                        taskPermissionName: 'READ_LOAN',
                    },
                ];
                break;
            default:
                this.optionArray = [];
        }
    }

    addOption(option: { name: string, icon?: string, taskPermissionName?: string }) {
        this.optionArray.push(option);
    }

    addButton(option: { name: string, icon: string, taskPermissionName?: string }) {
        this.buttonsArray.push(option);
    }

}
