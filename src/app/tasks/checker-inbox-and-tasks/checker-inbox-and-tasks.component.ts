/** Angular Imports */
import { Component } from '@angular/core';
import { MatCard, MatCardContent } from '@angular/material/card';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { HasPermissionDirective } from '../../directives/has-permission/has-permission.directive';
import { RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';

/**
 * Checker Inbox and Tasks Component
 */
@Component({
  selector: 'mifosx-checker-inbox-and-tasks',
  templateUrl: './checker-inbox-and-tasks.component.html',
  styleUrls: ['./checker-inbox-and-tasks.component.scss'],
  imports: [
    MatCard,
    MatCardContent,
    MatTabNav,
    HasPermissionDirective,
    MatTabLink,
    RouterLinkActive,
    RouterLink,
    MatTabNavPanel,
    RouterOutlet,
    NgxTranslatePipe
  ]
})
export class CheckerInboxAndTasksComponent {
  constructor() {}
}
