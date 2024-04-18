/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { ProductsService } from '../../products.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Edit tax component.
 */
@Component({
  selector: 'mifosx-edit-tax-component',
  templateUrl: './edit-tax-component.component.html',
  styleUrls: ['./edit-tax-component.component.scss']
})
export class EditTaxComponentComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Tax Component form. */
  taxComponentForm: UntypedFormGroup;
  /** Tax Component data. */
  taxComponentData: any;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ProductsService} productsService Products Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {Dates} dateUtils Date Utils to format date.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private productsService: ProductsService,
              private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { taxComponent: any }) => {
      this.taxComponentData = data.taxComponent;
    });
  }

  /**
   * Creates the edit tax component form.
   */
  ngOnInit() {
    this.editTaxComponent();
  }

  /**
   * Edit tax component form.
   */
  editTaxComponent() {
    this.taxComponentForm = this.formBuilder.group({
      'name': [this.taxComponentData.name, [Validators.required]],
      'percentage': [this.taxComponentData.percentage, [Validators.required, Validators.pattern('^(0*[1-9][0-9]*(\\.[0-9]+)?|0+\\.[0-9]*[1-9][0-9]*)$'), Validators.max(100)]],
      'startDate': [this.taxComponentData.startDate && new Date(this.taxComponentData.startDate)],
      'creditAccountType': [{ value: this.taxComponentData.creditAccountType.value, disabled: true }],
      'creditAccount': [{ value: this.taxComponentData.creditAccount.name, disabled: true }]
    });
  }

  /**
   * Submits the edit tax component form and edits tax component,
   * if successfull redirects to tax component.
   */
  submit() {
    const taxComponentFormData = this.taxComponentForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevStartDate: Date = this.taxComponentForm.value.startDate;
    if (taxComponentFormData.startDate instanceof Date) {
      taxComponentFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    const data = {
      ...taxComponentFormData,
      dateFormat,
      locale
    };
    this.productsService.updateTaxComponent(this.taxComponentData.id, data).subscribe((response: any) => {
      this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
    });
  }

}
