/** TODO: Refactor Permissions */
export const BulkImports = [
    {
      name: 'Offices',
      entityType: 'offices',
      urlSuffix: '/offices',
      permission: 'READ_OFFICE',
      formFields: 0
    },
    {
      name: 'Users',
      entityType: 'users',
      urlSuffix: '/users',
      permission: 'READ_CLIENT',
      formFields: 2
    },
    {
      name: 'Groups',
      entityType: 'groups',
      urlSuffix: '/groups',
      permission: 'READ_CLIENT',
      formFields: 2
    },
    {
      name: 'Centers',
      entityType: 'centers',
      urlSuffix: '/centers',
      permission: 'READ_CENTERS',
      formFields: 2
    },
    {
      name: 'Clients',
      entityType: 'client',
      urlSuffix: '/clients',
      permission: 'READ_CLIENT',
      formFields: 3
    },
    {
      name: 'Employees',
      entityType: 'staff',
      urlSuffix: '/staff',
      permission: 'READ_CLIENT',
      formFields: 1
    },
    {
      name: 'Guarantors',
      entityType: 'guarantors',
      urlSuffix: '/loans/1/guarantors',
      permission: 'READ_CLIENT',
      formFields: 1
    },
    {
      name: 'Journal Entries',
      entityType: 'gljournalentries',
      urlSuffix: '/journalentries',
      permission: 'READ_CLIENT',
      formFields: 1
    },
    {
      name: 'Loan Accounts',
      entityType: 'loans',
      urlSuffix: '/loans',
      permission: 'READ_CLIENT',
      formFields: 2
    },
    {
      name: 'Savings Accounts',
      entityType: 'savingsaccount',
      urlSuffix: '/savingsaccounts',
      permission: 'READ_CLIENT',
      formFields: 2
    },
    {
      name: 'Fixed Deposit Accounts',
      entityType: 'fixeddepositaccounts',
      urlSuffix: '/fixeddepositaccounts',
      permission: 'READ_CLIENT',
      formFields: 2
    },
    {
      name: 'Reccuring Deposit Accounts',
      entityType: 'recurringdeposits',
      urlSuffix: '/recurringdepositaccounts',
      permission: 'READ_CLIENT',
      formFields: 2
    },
    {
      name: 'Chart of Accounts',
      entityType: 'chartofaccounts',
      urlSuffix: '/glaccounts',
      permission: 'READ_CLIENT',
      formFields: 2
    },
    {
      name: 'Share Accounts',
      entityType: 'shareaccounts',
      urlSuffix: '/accounts/share',
      permission: 'READ_CLIENT',
      formFields: 1
    },
    {
      name: 'Loan Repayments',
      entityType: 'loantransactions',
      urlSuffix: '/loans/repayments',
      permission: 'READ_CLIENT',
      formFields: 1
    },
    {
      name: 'Savings Transactions',
      entityType: 'savingstransactions',
      urlSuffix: '/savingsaccounts/transactions',
      permission: 'READ_CLIENT',
      formFields: 1
    },
    {
      name: 'Fixed Deposit Transactions',
      entityType: 'fixeddeposittransactions',
      urlSuffix: '/fixeddepositaccounts/transaction',
      permission: 'READ_CLIENT',
      formFields: 1
    },
    {
      name: 'Recurring Deposit Transactions',
      entityType: 'recurringdepositstransactions',
      urlSuffix: '/recurringdepositaccounts/transactions',
      permission: 'READ_CLIENT',
      formFields: 1
    },
  ];
