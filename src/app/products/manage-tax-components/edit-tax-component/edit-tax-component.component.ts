/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { ProductsService } from '../../products.service';

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
  taxComponentForm: FormGroup;
  /** Tax Component data. */
  taxComponentData: any;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ProductsService} productsService Products Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {DatePipe} datePipe Date Pipe to format date.
   */
  constructor(private formBuilder: FormBuilder,
              private productsService: ProductsService,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe) {
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
      'creditAccountType': [{value: this.taxComponentData.creditAccountType.value, disabled: true}],
      'creditAccount': [{value: this.taxComponentData.creditAccount.name, disabled: true}]
    });
  }

  /**
   * Submits the edit tax component form and edits tax component,
   * if successfull redirects to tax component.
   */
  submit() {
    const prevStartDate: Date = this.taxComponentForm.value.startDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.taxComponentForm.patchValue({
      startDate: this.datePipe.transform(prevStartDate, dateFormat)
    });
    const taxComponent = this.taxComponentForm.value;
    taxComponent.locale = 'en';
    taxComponent.dateFormat = dateFormat;
    this.productsService.updateTaxComponent(this.taxComponentData.id, taxComponent).subscribe((response: any) => {
      this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
    });
  }

}
