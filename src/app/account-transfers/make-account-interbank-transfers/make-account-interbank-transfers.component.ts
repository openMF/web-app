import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

import { MatInput } from '@angular/material/input';

@Component({
  selector: 'mifosx-make-account-interbank-transfers',
  templateUrl: './make-account-interbank-transfers.component.html',
  styleUrls: ['./make-account-interbank-transfers.component.scss']
})
export class MakeAccountInterbankTransfersComponent {

  @Input() makeAccountTransferForm: FormGroup;
  @Input() balance: number;

    /** Minimum date allowed. */
    minDate = new Date(2000, 0, 1);
    /** Maximum date allowed. */
    maxDate = new Date(2100, 0, 1);

  getErrorMessage = (input: string) => {
    return this.makeAccountTransferForm.get(input).invalid || false;
}

get f(): any {
    return this.makeAccountTransferForm.controls;
}

}
