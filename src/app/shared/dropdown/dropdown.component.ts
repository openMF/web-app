import { Component, Input } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'mifosx-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent {

  @Input() placeHolderText: string;
  @Input() labelText: string;
  @Input() selectOptions: any[] = [];
  @Input() controlSelect: UntypedFormControl;
  @Input() required: boolean;

  constructor(private translateService: TranslateService) { }

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
