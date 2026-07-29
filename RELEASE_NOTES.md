# Release Notes

## Version 1.4.12 - Community 1.0.0

    * Configurations
          * [HQX-306] - Add disbursement date loan repayment allocation protocol to system choice

## Version 1.4.11 - Community 1.0.0

    * Savings Accounts & Products
        * [FOX-212] - Add inScope field to LoanProduct entity to allow isolation of loan products in scope for field operations for summary calculations
    * Clients & Groups
        * [HQX-117] - Add standardized configurable kyc failure reasons
        * [HQX-120] - Display client status transitions
        * [HQX-322] - Show client account number against the loan account on group general view
    * Loans & Payments
        * [HQX-276] - Display client deleted loans for visibility
        * [HQX-120] - Display client status transitions
    * Maker Checker
        * [HQX-118] - Enable persistent filtering by office name, date range, and other key parameters, while retaining filters after submitting verification entries
        * [FNG-395] - Add country filter on Client KYC Verification list retrieval

## Version 1.4.10 - Community 1.0.0

    * Loans & Payments
        * [CP-4057] - Improve Rahisi Model UI to show more details and make it more user friendly
    * System
        * [FOX-202] - Resolve errors during create/modify custom fields of dropdown type
    * Savings Accounts & Products
        * [HQX-235] - Ability to download savings transaction template without selecting an office
    * Clients & Groups
        * [HQX-72] - Provide Visibility on Group Leader History
        * [HQX-270] - Ability to track historical group removal for audit & analysis

## Version 1.4.9.1 - Community 1.0.0

    * Clients
        * * [CP-4095] - Payment Provider External service: Introduce support of date format for a payment provider

## Version 1.4.9 - Community 1.0.0

    * Bulk Uploads
        * [CP-4042] - Add bulk upload to remove clients from groups
    * Loans & Payments
        * [CP-4067] - Apply country config to allow dynamic downpayment on loan products
        * [CP-4065] - Add Delivery Details Tab and Fetch Button in Loan Management

## Version 1.4.8.1 - Community 1.0.0

    * Bulk Uploads
        * [CP-4085] - Client Transfer: Rename client group transfer to client transfer and enable download template button only if the office is selected

## Version 1.4.8 - Community 1.0.0

    * Bulk Downloads
        * [CP-4041] - Enable bulk download for unqualified and non picker clients for a loan product
    * Bulk Uploads
        * [CP-4015] - Add bulk upload to move groups to different sites

## Version 1.4.7.1 - Community 1.0.0

    * Clients
        * [CP-4059] -  Client activation: allow activation of clients with inactive substatuses

## Version 1.4.7 - Community 1.0.0

    * Bulk Uploads
        * [CP-4014] - Update bulk savings account transactions to fetch by last ou
    * Clients
       * [CP-3711] - Enable bulk upload of existing farmers to existing groups
       * [CP-4053] - Squad Payment Provider setting: Remove validation on bank code field
    * Loans & Payments
       * [CP-4013] - Implement dynamic downpayment for Kenya
       * [CP-4058] - Hide dynamic downpayment

## Version 1.4.6 - Community 1.0.0

    * Configurations
        * [CP-3666] - Refactor Template Configuration with HTML Support Per Country
    * Navigation Bar
        * [CP-4004] - Disabling the notification tray for now since it's not being consumed
    * Clients
        * [CP-3711] - Enable bulk upload of existing farmers to existing groups

## Version 1.4.4 - Community 1.0.0

    * Clients
        * [CP-3935] - Add time a client landed in the checker inbox
        * [CP-3971] - Rename phone number field in UI to Paid By in transaction history
        * [CP-3536] - Fix Cannot read properties of undefined errors reported by Sentry

## Version 1.4.3 - Community 1.0.0

    * Clients
        * [CP-3882] - Add display for gender and KYC Failed fields in client profile
    * External Services
        * [CP-3932] - Revamp the notification external service UI

## Version 1.4.2 - Community 1.0.0

    * Maker Checker
        * [CP-3873] - KYC Maker Checker UI Improvements
        * [CP-3911] - Apply KYC backend changes to align with the updated requirements.
        * [CP-3927] - Enable search by client name and order by date on Failed KYC tab.

## Version 1.4.1 - Community 1.0.0

    * Clients
        * [CP-3663] - Fix: Only restrict cllient edits on clients with active loans
        * [CP-3771] - Remove required on loan end date mode override field on loan product creation & Edit

## Version 1.4.0 - Community 1.0.0

    * Loans & Payments
        * [CP-3722] - Hide previously taken input from loan product client eligibility
        * [CP-3771] - Enable loan end date to be overridden by the loan product configuration

    * Tranlations
        * [CP-3741] - Fix Translations Related to Angular Material Pagination and Breadcrumbs
        * [CP-3788] - Fix other translation reported issues

    * Maker Checker
        * [CP-3723] - Improve user experience for the maker

    * Clients
        * [CP-3810] - Client transfer offices dorpdown fetch lowest OUs. Search clients also sends countryId query param to filter country clients
        * [CP-3844] - Fix 404 after client transfer due to route hierarchy update

## Version 1.3.9.1 - Community 1.0.0

    * Organization Units
        * [CP-3734] - Show OU Path for client, groups and offices
    * Clients
        * [CP-3663] - Restrict Client Info Edits when a client has active loans.
    * External Services
            * [CP-3737] - Bug to fix payment provider form validation to cater for providers using API key as authentication method. Also make subEntityCode optional

## Version 1.3.9 - Community 1.0.0

    * Loans & Payments
        * [CP-3646] - Allow loan charges to optionally be rounded down to the nearest whole number
    * External Services
        * [CP-3554] - Modify payment provider form validation to cater for providers using API key as authentication method


    * Translations
        * [CP-3366] - Translation in Organisation related UI
        * [CP-3367] - Translation in System related UI
        * [CP-3721] - Implement translation in shared, home,navigation UIs

## Version 1.3.8.1 - Community 1.0.0

    * Miscellaneous
        * [CP-1689] - Configure Real User Monitoring with Elastic APM

## Version 1.3.8 - Community 1.0.0

    * [CP-3564] - Show loan status and substatus on loan view

## Version 1.3.7.2 - Community 1.0.0

    * [SER-3365] - Implement label translation in Product related UIs

## Version 1.3.7.1 - Community 1.0.0

    * [CP-3527] - Rename Loan Dates for Kenya to match their expectation

## Version 1.3.7 - Community 1.0.0

    * [CP-3502] - Send country when submitting the account transfer bulk upload
    * [CP-3538] - Show the transfer description in the view transaction interface if the repayment is from account transfer
    * [CP-3288] - External Service: Add new pages for order integration configuration

## Version 1.3.6 - Community 1.0.0

    * [SER-3363] - Implement label translation in Client related UIs
    * [SER-3259] - External Service: Add new page for payment provider configuration
    * [SER-3364] - Implement label translation in Groups and Loans related UIs
    * [SER-3313] - Add bulk account transaction transfer

## Version 1.3.5 - Community 1.0.0

    * [SER-2577] - Allow group movement regardless of loan status and office
    * [SER-3227] - Change link color for group and office labels in the client detail page.
    * [SER-2543] - Implement the user agent
    * [SER-3214] - Use the updated configuration for OTP verification in the UI
    * [SER-3204] - Move the audit page from System to Organization page
    * [SER-3281] - Integrate Fineract UI with Sentry for error analytics and tracing
    * chore - Change Mifos name on the UI to Fineract

## Version 1.3.4.2 - Community 1.0.0

    * [SER-3241] - Loan Product UI Fixes - Short name, channels, and client eligibility validation

## Version 1.3.4.1 - Community 1.0.0

    * [SER-3203] - Make country support required in SMS campaign template retrieval to allow fetching country specific SMS provider details
    * [SER-3088] - Add country filter on SMS campaigns list API

## Version 1.3.4 - Community 1.0.0

    * [SER-3008] - Added ability to load organisational units (OUs) up to custom levels of the OU hierarchy config
    * [SER-2803] - Added configuration for automatically triggerring deployment with Github Release

## Version 1.3.3 - Community 1.0.0

    * [SER-2961] - Client's Date of Birth (DOB) should be available on the client profile.
    * [SER-2955] - Revise the global configuration pages to incorporate the new isStringValue flag field.
    * [SER-2902] - Disable loan submit button for a specific period to avoid double clicks.
    * [SER-2664] -  Show only client eligible loan products
    * [SER-2881] -  Re-enable configuration of the currency multiple from directly on the UI during Loan Definition

## Version 1.3.2 - Community 1.0.0

    * [SER-2947] - Show or hide some menus based on user permissions.
    * [SER-2956] - Fix regression on Display Terms&Conditions on loan product page

## Version 1.3.1 - Community 1.0.0

    * [SER-2854] Editing a loan product leads to loss of attached charges
    * [SER-2854] - Removed currency control subscription on charges step during loan product update that clears charges on currency change
    * [SER-2929] - Show only active offices when creating clients and load only active offices when searcing offices by country.
    * [SER-2859] - Accept a string value to be passed when creating a new configuration, but only for the 'skip-ocr-credit-score-users' config at this time.

## Version 1.3.0 - Community 1.0.0

    * [SER-1406] - Fix create client errors
    * [SER-842] - Allow an authorised user to select an active country so that s/he can make any changes to a specific country
    * [SER-1544] - Office dropdown in Create/Edit Client interface should be searchable
    * [SER-1543] - Office dropdown in Import Client interface should be searchable
    * [SER-1541] - Office dropdownlist in the transfer client interface should be searchable
    * [SER-1569] - Check how transfer client endpoint works
    * [SER-1538] - Implement healthy path upload in Fineract UI v2
    * [SER-1542] - Fix new loan application error
    * [SER-1617] - Fix error when accessing group member details from Group details page
    * [SER-1536] - Implement Loan Top-up in Fineract UI
    * [SER-1618] - Search Client on the client list interface by multiple fields as done in the old version
    * [SER-1895] - Fix Fineract UI Signout Redirect Keycloak Error
    * [SER-1532] - Hide fields in the loan creation process
    * [SER-1924] - Allow some transaction types clickable
    * [SER-1524] - Fix pagination issue
    * [SER-1916] - Create a UI for repayments download
    * [SER-1112] - Create UI for field configuration (CRUD)
    * [SER-1963] - Fix the OU tree selection issue on the loan product creation
    * [SER-1898] - Fix Office Bulk Import
    * [SER-1899] - Fix Clients Bulk Import
    * [SER-1900] - Fix Groups Bulk Import
    * [SER-2043] - Hide unused bulk import items
    * [SER-1562] - Refresh automatically after uploading a file
    * [SER-1521] - As a country admin, I should be able to add an extension charge
    * [SER-2030] - Implement loan terms and conditions
    * [SER-2045] - Add delete button for loan product
    * [SER-2093] - Add qualification rules on loan products
    * [SER-2438] - Fix view client details
    * [SER-2093] - Add qualification rules on loan products
    * [SER-2396] - Deploy fineract UI v2 on the integration cluster (Added missing envs)
    * [SER-2440] - Revise the country selection option to check for the Head Office instead of roles
    * [SER-2446] - Add ng-select as drop down in client and group creation
    * [SER-2458] - Replace mat-select-filter in all interfaces with ng select
    * [SER-2304] - Upgrade to angular 14
    * [SER-2036] - Return groups based on the selected country
    * [SER-2034] - Return clients based on the selected country.
    * [SER-2039] - Return loan products based on the selected country.
    * [SER-2510] - show office hierrachy path name, show only required menus.
    * [SER-1922] - Fineract v2  - Loan type to be visible in loan product view and edit screens
    * [SER-1912] - Fineract v2  - Show OU Location Hierarchy Details When Displaying Clients
    * [SER-1911] - Fineract v2  - Show OU Location Hierarchy Details When Displaying Groups
    * [SER-2486] - Creating savings account and mapping it to loans and country
    * [SER-2523] - Implementation of payment channel selection in configuration
    * [SER-1896] - Hide the add button on the lowest level OU in the tree.
    * [SER-1561] - show the proper office name instead of the name decorated.
    * [SER-1908] - Include Phone Number in Repayment Transaction Details
    * [SER-1913] - Exclude the ability to Edit Repayments in Fineract
    * [SER-2549] - Implement Loan Account Bulk Upload in Fineract v2
    * [SER-2595] - Fix Add hooks interface for Rabbit MQ template, also clears cached data when there is a PUT,POST or DELETE request, a fix for the reacitvate interface.
    * [SER-2600] - Fix edit loan product failing due to unsupported fields being submitted
    * [SER-2600] - Fix terms and conditions not being populated correctly on create & edit loan product pages
    * [SER-2600] - User creation: Set sendPasswordToEmail to always be false
    * [SER-2600] - Group management: Fix adding client to a group failing due to initialization error.
    * [SER-2601] - Show credit score data if available for a client, show client identity value, show OU path when you search for a client.
    * [SER-2606] - Remove staff id from payload when creating users.
    * [SER-2663] - Show overpaid amount if possible on the account summary and also removing the interests sub-column from the transactions interface.
    * [SER-2680] - change input type for mobile number field from number to tel to client create and edit interfaces
    * [SER-2686] - fix hook routing key editing bug, fix resetting the selected office parent when you select radio button, and fix keycloak error.
    * [SER-2701] - fix credit score label data, ability to activate, deactivate and delete and office from UI
    * [SER-2735] - show currency and loan product name when displaying savings products in list, view and edit view.
    * [SER-2742] - show activate button when a group has been deactivated.
    * [SER-2763] - fix for view client signature and click group name from client view
    * [SER-2805] - show proper error message when error status is 400, show client office in the client view,show a searchable dropdown when creating a new client loan.
    * [SER-2537] - Add country link to SMS campaigns
    * [SER-2809] - Fix navigations in the group view interface
    * [SER-2507] - Require OTP validation when updating clients
    * [SER-2818] - Remove templates link to organisation.
    * [SER-2803] - Move build from Azure pipeline to GitHub Actions
    * [SER-2745] - Fix file name in the bulk import downloads to use file name from the API
    * [SER-2847] - Allow overide of OCR checks if a user has the SKIP_VERIFICATION_CLIENT permission.
    * [SER-2892] - Search fields on Client Search and Filter Bars are labeled with "Search for Client" and "Filter by Client" respectively and fix null objects in the view jobs interface.
    * [SER-2926] - Remove loan payment button from the UI

## Version 1.0.0 - for use with Fineract Web App

    * This repository was forked from Mifos Web App
    ## to force a commit.
