/** Keyboard Shortcuts Button Configuration */
export class KeyboardShortcutsConfiguration {

    buttonsArray: {
        title: string,
        ctrlKey: boolean,
        shiftKey: boolean,
        altKey: boolean,
        key: string,
        route: string,
        id?: string
    }[];

    constructor() {
        this.makeCombination();
    }

    makeCombination() {
        this.buttonsArray = [
            // Navigation Page - Shift + N
            {
                title: 'Navigation Page',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'N',
                route: 'navigation'
            },
            // Run Report - Shift + T
            {
                title: 'Run Report',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'T',
                route: '',
                id: 'runReport'
            },
            // Checker Inbox & Pending Tasks - Shift + I
            {
                title: 'Checker Inbox & Pending Tasks',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'I',
                route: 'checker-inbox-and-tasks/checker-inbox'
            },
            // Collection Sheet- Ctrl + Alt + O
            // {
            //     title: 'Collection Sheet',
            //     ctrlKey: true,
            //     shiftKey: false,
            //     altKey: true,
            //     key: 'o',
            //     route: ''
            // },
            // Create Client - Shift + C
            {
                title: 'Create Client',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'C',
                route: 'clients/create'
            },
            // Create Group - Shift + G
            {
                title: 'Create Group',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'G',
                route: 'groups/create'
            },
            // Create Center - Shift + Q
            {
                title: 'Create Center',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'Q',
                route: 'centers/create'
            },
            // Frequent Posting - Shift + F
            {
                title: 'Frequent Posting',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'F',
                route: 'accounting/journal-entries/frequent-postings'
            },
            // Closure Entries - Shift + E
            {
                title: 'Closure Entries',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'E',
                route: 'accounting/closing-entries'
            },
            // Journal Entry - Shift + J
            {
                title: 'Journal Entry',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'J',
                route: 'accounting/journal-entries/create'
            },
            // Reports - Shift + R
            {
                title: 'Reports',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'R',
                route: 'reports'
            },
            // Accounting - Shift + A
            {
                title: 'Accounting',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'A',
                route: 'accounting'
            },
            // Save/Submit Forms - Shift + S
            {
                title: 'Save/Submit Forms',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'S',
                route: '',
                id: 'submit'
            },
            // Cancel - Shift + X
            {
                title: 'Cancel',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'X',
                route: '',
                id: 'cancel'
            },
            // Help - Shift + H
            {
                title: 'Help',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'H',
                route: '',
                id: 'help'
            },
            // Pagination: Next - Ctrl + n
            // {
            //     title: 'Pagination: Next'
            //     ctrlKey: true,
            //     shiftKey: false,
            //     altKey: true,
            //     key: 'n',
            //     route: ''
            // },
            // Pagination: Previous - Ctrl + p
            // {
            //     title: 'Pagination: Previous'
            //     ctrlKey: true,
            //     shiftKey: false,
            //     altKey: true,
            //     key: 'p',
            //     route: ''
            // },
            // Logout - Shift + L
            {
                title: 'Logout',
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                key: 'L',
                route: '',
                id: 'logout'
            }
        ];
    }

    get buttonCombinations() {
        return this.buttonsArray;
    }

}
