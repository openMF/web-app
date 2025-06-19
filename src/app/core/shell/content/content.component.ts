/** Angular Imports */
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Content component.
 */
@Component({
  selector: 'mifosx-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss'],
  imports: [RouterOutlet]
})
export class ContentComponent {
  constructor() {}
}
