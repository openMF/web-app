/** Angular Imports */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Content component.
 */
@Component({
  selector: 'mifosx-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterOutlet
  ]
})
export class ContentComponent {
  constructor() {}
}
