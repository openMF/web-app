import { Component, Input } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'mifosx-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  imports: [
    MatFormField,
    MatLabel,
    MatSelect,
    ReactiveFormsModule,
    NgFor,
    MatOption,
    NgIf,
    MatIconButton,
    MatSuffix,
    MatIcon,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class DropdownComponent {
  @Input() placeHolderText: string;
  @Input() labelText: string;
  @Input() selectOptions: any[] = [];
  @Input() controlSelect: UntypedFormControl;
  @Input() required: boolean;

  constructor(private translateService: TranslateService) {}

  getPlaceHolderText(): string {
    return this.placeHolderText ? this.translateService.instant('labels.inputs.' + this.placeHolderText) : '';
  }

  getLabelText(): string {
    return this.labelText ? this.translateService.instant('labels.inputs.' + this.labelText) : '';
  }

  clearProperty() {
    this.controlSelect.patchValue('');
  }
}
