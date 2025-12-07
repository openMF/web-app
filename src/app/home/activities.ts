interface Activity {
  activity: string;
  path: string;
}

const activities: Activity[] = [
  // Main Navigation
  { activity: 'dashboard', path: '/dashboard' },
  { activity: 'navigation', path: '/navigation' },
  { activity: 'reports', path: '/reports' },

  // Clients
  { activity: 'clients', path: '/clients' },
  { activity: 'create client', path: '/clients/create' },

  // Groups
  { activity: 'groups', path: '/groups' },
  { activity: 'create group', path: '/groups/create' },

  // Centers
  { activity: 'centers', path: '/centers' },
  { activity: 'create center', path: '/centers/create' },

  // Loans
  { activity: 'loans', path: '/loans' },
  { activity: 'create loan', path: '/loans/create' },
  { activity: 'loan products', path: '/products/loan-products' },
  { activity: 'create loan product', path: '/products/loan-products/create' },

  // Savings
  { activity: 'savings', path: '/savings' },
  { activity: 'create savings account', path: '/savings/create' },
  { activity: 'saving products', path: '/products/saving-products' },
  { activity: 'create saving product', path: '/products/saving-products/create' },
  { activity: 'gsim accounts', path: '/savings/gsim' },

  // Shares
  { activity: 'shares', path: '/shares' },
  { activity: 'create share account', path: '/shares/create' },
  { activity: 'share products', path: '/products/share-products' },
  { activity: 'create share product', path: '/products/share-products/create' },

  // Products
  { activity: 'products', path: '/products' },
  { activity: 'fixed deposit products', path: '/products/fixed-deposit-products' },
  { activity: 'create fixed deposit product', path: '/products/fixed-deposit-products/create' },
  { activity: 'recurring deposit products', path: '/products/recurring-deposit-products' },
  { activity: 'create recurring deposit product', path: '/products/recurring-deposit-products/create' },
  { activity: 'charges', path: '/products/charges' },
  { activity: 'create charge', path: '/products/charges/create' },
  { activity: 'floating rates', path: '/products/floating-rates' },
  { activity: 'create floating rate', path: '/products/floating-rates/create' },
  { activity: 'product mix', path: '/products/products-mix' },
  { activity: 'create product mix', path: '/products/products-mix/create' },
  { activity: 'manage tax configurations', path: '/products/manage-tax-configurations' },
  { activity: 'manage tax components', path: '/products/manage-tax-components' },
  { activity: 'manage tax groups', path: '/products/manage-tax-groups' },
  { activity: 'collaterals', path: '/products/collaterals' },
  { activity: 'create collateral', path: '/products/collaterals/create' },

  // Accounting
  { activity: 'accounting', path: '/accounting' },
  { activity: 'journal entries', path: '/accounting/journal-entries' },
  { activity: 'create journal entry', path: '/accounting/journal-entries/create' },
  { activity: 'frequent postings', path: '/accounting/frequent-postings' },
  { activity: 'chart of accounts', path: '/accounting/chart-of-accounts' },
  { activity: 'closing entries', path: '/accounting/closing-entries' },
  { activity: 'create closing entry', path: '/accounting/closing-entries/create' },
  { activity: 'accounting rules', path: '/accounting/accounting-rules' },
  { activity: 'create accounting rule', path: '/accounting/accounting-rules/create' },
  { activity: 'periodic accruals', path: '/accounting/periodic-accruals' },
  { activity: 'provisioning entries', path: '/accounting/provisioning-entries' },
  { activity: 'create provisioning entry', path: '/accounting/provisioning-entries/create' },
  { activity: 'financial activity mappings', path: '/accounting/financial-activity-mappings' },
  { activity: 'migrate opening balances', path: '/accounting/migrate-opening-balances' },

  // Organization
  { activity: 'organization', path: '/organization' },
  { activity: 'offices', path: '/organization/offices' },
  { activity: 'create office', path: '/organization/offices/create' },
  { activity: 'employees', path: '/organization/employees' },
  { activity: 'create employee', path: '/organization/employees/create' },
  { activity: 'currencies', path: '/organization/currencies' },
  { activity: 'holidays', path: '/organization/holidays' },
  { activity: 'create holiday', path: '/organization/holidays/create' },
  { activity: 'tellers', path: '/organization/tellers' },
  { activity: 'create teller', path: '/organization/tellers/create' },
  { activity: 'payment types', path: '/organization/payment-types' },
  { activity: 'password preferences', path: '/organization/password-preferences' },
  { activity: 'working days', path: '/organization/working-days' },
  { activity: 'sms campaigns', path: '/organization/sms-campaigns' },
  { activity: 'create sms campaign', path: '/organization/sms-campaigns/create' },
  { activity: 'provisioning criteria', path: '/organization/provisioning-criteria' },
  { activity: 'create provisioning criteria', path: '/organization/provisioning-criteria/create' },
  { activity: 'bulk import', path: '/organization/bulk-import' },
  { activity: 'bulk loan reassignment', path: '/organization/bulk-loan-reassignmnet' },
  { activity: 'standing instructions history', path: '/organization/standing-instructions-history' },
  { activity: 'fund mapping', path: '/organization/fund-mapping' },
  { activity: 'manage funds', path: '/organization/manage-funds' },
  { activity: 'create fund', path: '/organization/manage-funds/create' },
  { activity: 'investors', path: '/organization/investors' },
  { activity: 'adhoc query', path: '/organization/adhoc-query' },
  { activity: 'create adhoc query', path: '/organization/adhoc-query/create' },

  // System
  { activity: 'system', path: '/system' },
  { activity: 'codes', path: '/system/codes' },
  { activity: 'create code', path: '/system/codes/create' },
  { activity: 'data tables', path: '/system/data-tables' },
  { activity: 'create data table', path: '/system/data-tables/create' },
  { activity: 'manage hooks', path: '/system/manage-hooks' },
  { activity: 'create hook', path: '/system/manage-hooks/create' },
  { activity: 'manage reports', path: '/system/manage-reports' },
  { activity: 'create custom report', path: '/system/manage-reports/create' },
  { activity: 'manage surveys', path: '/system/manage-surveys' },
  { activity: 'create survey', path: '/system/manage-surveys/create' },
  { activity: 'roles and permissions', path: '/system/roles-and-permissions' },
  { activity: 'add role', path: '/system/roles-and-permissions/add' },
  { activity: 'global configurations', path: '/system/global-configurations' },
  { activity: 'configure maker checker tasks', path: '/system/configure-maker-checker-tasks' },
  { activity: 'manage jobs', path: '/system/manage-jobs' },
  { activity: 'account number preferences', path: '/system/account-number-preferences' },
  { activity: 'create account number preference', path: '/system/account-number-preferences/create' },
  { activity: 'audit trails', path: '/system/audit-trails' },
  { activity: 'external services', path: '/system/external-services' },
  { activity: 'email configuration', path: '/system/external-services/email' },
  { activity: 'sms configuration', path: '/system/external-services/sms' },
  { activity: 'notification configuration', path: '/system/external-services/notification' },
  { activity: 'amazon s3 configuration', path: '/system/external-services/amazon-s3' },
  { activity: 'external events', path: '/system/external-events' },
  { activity: 'manage external events', path: '/system/manage-external-events' },
  { activity: 'entity to entity mapping', path: '/system/entity-to-entity-mapping' },
  { activity: 'entity data table checks', path: '/system/entity-data-table-checks' },
  { activity: 'create entity data table check', path: '/system/entity-data-table-checks/create' },

  // Users
  { activity: 'users', path: '/appusers' },

  // Collections
  { activity: 'collection sheet', path: '/collections/collection-sheet' },
  { activity: 'individual collection sheet', path: '/collections/individual-collection-sheet' },

  // Account Transfers
  { activity: 'account transfers', path: '/account-transfers' },
  { activity: 'create standing instructions', path: '/account-transfers/create-standing-instructions' },
  { activity: 'make account transfer', path: '/account-transfers/make-account-transfer' },
  { activity: 'list standing instructions', path: '/account-transfers/list-standing-instructions' },

  // Tasks
  { activity: 'tasks', path: '/tasks/checker-inbox-and-tasks' },
  { activity: 'checker inbox', path: '/tasks/checker-inbox-and-tasks/checker-inbox' },
  { activity: 'client approval', path: '/tasks/checker-inbox-and-tasks/client-approval' },
  { activity: 'loan approval', path: '/tasks/checker-inbox-and-tasks/loan-approval' },
  { activity: 'loan disbursal', path: '/tasks/checker-inbox-and-tasks/loan-disbursal' },
  { activity: 'reschedule loan', path: '/tasks/checker-inbox-and-tasks/reschedule-loan' },

  // Templates
  { activity: 'templates', path: '/templates' },

  // Legacy empty path entries (keeping for backward compatibility)
  { activity: '', path: 'home' }
];

export { activities };
