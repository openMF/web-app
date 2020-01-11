import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { DatePipe } from '@angular/common';

/** Custom Components */
import { CancelDialogComponent } from 'app/shared/cancel-dialog/cancel-dialog.component';

/** Custom Services */
import { ProductsService } from 'app/products/products.service';

/**
 * Create tax-group component.
 */
@Component({
  selector: 'mifosx-create-tax-group',
  templateUrl: './create-tax-group.component.html',
  styleUrls: ['./create-tax-group.component.scss']
})

export class CreateTaxGroupComponent implements OnInit {

  /** Minimum start date allowed. */
  minDate = new Date(new Date().setFullYear(new Date().getFullYear() - 20));
  /** Maximum start date allowed. */
  maxDate = new Date();
  /** tax Group Form. */
  TaxGroupForm: FormGroup;
  /** tax Component Data. */
  taxComponentData: any;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe,
              public dialog: MatDialog,
              private productService: ProductsService) {}

  /**
   * Creates the tax Component form
   * Fetches data from Taxcomponent and stores it in taxComponentData
   */
  ngOnInit() {

    // initaialising the form
    this.createTaxGroupForm();

    // Getting the tax component data and storing it in taxComponentData
    this.route.data.subscribe((data: { taxComponents: any }) => {
      this.taxComponentData = data.taxComponents;
    });
  }

  /**
   * Creates the tax Group form
   */
  createTaxGroupForm() {
    this.TaxGroupForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'taxComponents': this.formBuilder.array([])
    });
  }

  /**
   * Gets the taxcomponent form array.
   * @returns {FormArray} taxcomponent form array.
   */
  get taxComponents(): FormArray {
    return this.TaxGroupForm.get('taxComponents') as FormArray;
  }

  /**
   * Creates a tax component form group
   * @returns {FormGroup} tax component form group.
   */
  createTaxComponentForm(): FormGroup {
    return this.formBuilder.group({
      'taxComponentId': [''],
      'startDate': ['']
    });
  }

  /**
   * Adds a tax component to the taxcomponents formArray
   */
  addTaxComponent(): void {
    this.taxComponents.push(this.createTaxComponentForm());
  }

  /**
   * Cancels the group form creation and redirects to Tax Groups page.
   */
  cancelTaxGroupForm() {
    const cancelTaxGroupDialogRef = this.dialog.open(CancelDialogComponent);
    cancelTaxGroupDialogRef.afterClosed().subscribe((response: any) => {
      if (response.cancel) {
        this.router.navigate(['../'], {relativeTo: this.route});
      }
    });
  }

  /**
   * Submits the tax-group creation form and creates tax-group,
   * if successful redirects to tax-group
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const dateFormat = 'dd-MMMM-yyyy';

    // storing the taxComponents array.
    const taxComponentArray = this.TaxGroupForm.value.taxComponents;

    // Transforming each startDate and adding to the taxComponentArray
    taxComponentArray.forEach((taxcomponent: { startDate: any; taxComponentId: any; }) => {
      const prevStartdate: Date = taxcomponent.startDate;
          taxcomponent.startDate = this.datePipe.transform(prevStartdate, dateFormat);
    });
    const taxGroup = this.TaxGroupForm.value;
    taxGroup.locale = 'en';
    taxGroup.dateFormat = dateFormat;
    this.productService.createTaxGroup(taxGroup).subscribe((response: any) => {
      // Natvigate to the Tax Group Managing page after successful form creation.
      this.router.navigate(['../'], {relativeTo: this.route});
    });
  }
 }
