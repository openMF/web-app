export const ButtonConfig = {
  'Submitted and pending approval': {
    singlebuttons: [
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
    ],
    options: [
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
    ],
  },

  Approved: {
    singlebuttons: [
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
    ],
    options: [
      {
        name: 'Add Loan Charge',
        taskPermissionName: 'CREATE_LOANCHARGE',
      },
      {
        name: 'List Guarantor',
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
    ],
  },

  Active: {
    singlebuttons: [
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
    ],
    options: [
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
        name: 'List Guarantor',
        taskPermissionName: 'READ_GUARANTOR',
      },
      {
        name: 'Create Guarantor',
        taskPermissionName: 'CREATE_GUARANTOR',
      },
      {
        name: 'Recover Guarantee',
        taskPermissionName: 'RECOVERGUARANTEES_LOAN',
      },
    ],
  },

  Overpaid: {
    singlebuttons: [
      {
        name: 'Transfer Funds',
        icon: 'fa fa-exchange',
        taskPermissionName: 'CREATE_ACCOUNTTRANSFER',
      },
    ],
  },

  'Closed (written off)': {
    singlebuttons: [
      {
        name: 'Recovery Payment',
        icon: 'fa fa-briefcase',
        taskPermissionName: 'RECOVERYPAYMENT_LOAN',
      },
    ],
  },
};
