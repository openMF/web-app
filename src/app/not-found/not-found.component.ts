import { Component } from '@angular/core';
import {Location} from '@angular/common';

@Component({
  selector: 'mifosx-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {

constructor(private location: Location) {}

  goBack(): void {
  this.location.back();
  }

}
