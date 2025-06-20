import { Component, Input } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIconButton,
    MatIcon
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
