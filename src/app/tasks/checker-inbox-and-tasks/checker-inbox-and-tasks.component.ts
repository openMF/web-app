/** Angular Imports */
import { Component } from '@angular/core';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Checker Inbox and Tasks Component
 */
@Component({
  selector: 'mifosx-checker-inbox-and-tasks',
  templateUrl: './checker-inbox-and-tasks.component.html',
  styleUrls: ['./checker-inbox-and-tasks.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet
  ]
})
export class CheckerInboxAndTasksComponent {
  constructor() {}
}
