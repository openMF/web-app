import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-make-account-interbank-transfers',
  templateUrl: './make-account-interbank-transfers.component.html',
  styleUrls: ['./make-account-interbank-transfers.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    CdkTextareaAutosize
  ]
})
export class MakeAccountInterbankTransfersComponent {
  @Input() makeAccountTransferForm: FormGroup;
  @Input() balance: number;

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date(2100, 0, 1);
}
