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
            // Navigation Page - ctrl + n
            {
                title: 'Navigation Page',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 'n',
                route: 'navigation'
            },
            // Run Report - ctrl + t
            {
                title: 'Run Report',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 't',
                route: '',
                id: 'runReport'
            },
            // Checker Inbox & Pending Tasks - ctrl + i
            {
              title: 'Checker Inbox & Pending Tasks',
              ctrlKey: true,
              shiftKey: false,
              altKey: false,
              key: 'i',
              route: 'checker-inbox-and-tasks/checker-inbox'
            },
            // Collection Sheet- ctrl + alt + o
            // {
            // title: 'Collection Sheet',
            // ctrlKey: true,
            // shiftKey: false,
            // altKey: true,
            // key: 'o',
            // route: ''
            // },
            // Create Client - ctrl + c
            {
                title: 'Create Client',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 'c',
                route: 'clients/create'
            },
            // Create Group - ctrl + g
            {
                title: 'Create Group',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 'g',
                route: 'groups/create'
            },
            // Create Center - ctrl + q
            {
                title: 'Create Center',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 'q',
                route: 'centers/create'
            },
            // Frequent Posting - ctrl + f
            {
                title: 'Frequent Posting',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 'f',
                route: 'accounting/journal-entries/frequent-postings'
            },
            // Closure Entries - ctrl + e
            {
                title: 'Closure Entries',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 'e',
                route: 'accounting/closing-entries'
            },
            // Journal Entry - ctrl + j
            {
                title: 'Journal Entry',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 'j',
                route: 'accounting/journal-entries/create'
            },
            // Reports - ctrl + r
            {
                title: 'Reports',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 'r',
                route: 'reports'
            },
            // Accounting - ctrl + a
            {
                title: 'Accounting',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 'a',
                route: 'accounting'
            },
            // Save/Submit Forms - ctrl + s
            {
                title: 'Save/Submit Forms',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 's',
                route: '',
                id: 'submit'
            },
            // Cancel - ctrl + x
            {
                title: 'Cancel',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 'x',
                route: '',
                id: 'cancel'
            },
            // Help - ctrl + h
            {
                title: 'Help',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 'h',
                route: '',
                id: 'help'
            },
            // Pagination: Next - ctrl + n
            // {
            //     title: 'Pagination: Next'
            //     ctrlKey: true,
            //     shiftKey: false,
            //     altKey: true,
            //     key: 'n,
            //     route: ''
            // },
            // Pagination: Previous - ctrl + p
            // {
            //     title: 'Pagination: Previous'
            //     ctrlKey: true,
            //     shiftKey: false,
            //     altKey: true,
            //     key: 'p,
            //     route: ''
            // },
            // Logout - ctrl + l
            {
                title: 'Logout',
                ctrlKey: true,
                shiftKey: false,
                altKey: false,
                key: 'l',
                route: '',
                id: 'logout'
            }
        ];
    }

    get buttonCombinations() {
        return this.buttonsArray;
    }

}
