import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss'],
  imports: [
    MatButton,
    FaIconComponent,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class NotFoundComponent {
  constructor(private location: Location) {}

  goBack(): void {
    this.location.back();
  }
}
