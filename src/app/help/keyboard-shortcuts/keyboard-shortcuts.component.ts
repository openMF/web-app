/** Angular Imports */
import { Component, OnInit } from '@angular/core';

/** Custom Model */
import { KeyboardShortcut } from './keyboard-shortcut.model';

/** Data for Keyboard Shortcuts Table */
const KEYBOARD_SHORTCUT_DATA: KeyboardShortcut[] = [
  { keys: 'Alt + Shift + N', action: 'Open Navigation Page' },
  { keys: 'Alt + I', action: 'Open Checker Inbox & Pending Tasks' },
  { keys: 'Control + Shift + O', action: 'Open Collection Sheet' },
  { keys: 'Control + Shift + C', action: 'Create Client' },
  { keys: 'Control + Shift + G', action: 'Create Group' },
  { keys: 'Alt + Q', action: 'Create Center' },
  { keys: 'Control + Shift + F', action: 'Open Frequent Postings' },
  { keys: 'Control + Shift + E', action: 'Open Closure Entries' },
  { keys: 'Control + Shift + J', action: 'Create Journal Entry' },
  { keys: 'Control + Shift + R', action: 'Open Reports' },
  { keys: 'Control + Shift + A', action: 'Open Accounting Page' },
  { keys: 'Control + S', action: 'Save/Submit Forms' },
  { keys: 'Control + R', action: 'Run Report' },
  { keys: 'Control + Shift + X', action: 'Cancel' },
  { keys: 'Control + Shift + L', action: 'Logout' },
  { keys: 'Alt + X', action: 'Search' },
  { keys: 'Control + Shift + H', action: 'Help' },
  { keys: 'Alt + N', action: 'Pagination: Next' },
  { keys: 'Alt + P', action: 'Pagination: Previous' }
];

/**
 * Keyboard shortcuts component.
 */
@Component({
  selector: 'mifosx-keyboard-shortcuts',
  templateUrl: './keyboard-shortcuts.component.html',
  styleUrls: ['./keyboard-shortcuts.component.scss']
})
export class KeyboardShortcutsComponent implements OnInit {

  displayedColumns: string[] = ['keys', 'action'];
  dataSource = KEYBOARD_SHORTCUT_DATA;

  constructor() {  }

  public ngOnInit() {
  }
}
