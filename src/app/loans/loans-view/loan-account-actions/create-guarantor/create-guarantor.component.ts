/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { DatePipe } from '@angular/common';

/**
 * Create Guarantor Action
 */
@Component({
  selector: 'mifosx-create-guarantor',
  templateUrl: './create-guarantor.component.html',
  styleUrls: ['./create-guarantor.component.scss']
})
export class CreateGuarantorComponent implements OnInit {

  @Input() dataObject: any;
  /** New Guarantor Form */
  newGuarantorForm: FormGroup;
  /** Loan ID */
  loanId: string;
  /** Relation Types */
  relationTypes: any;
  /** Show Client Details Form */
  showClientDetailsForm = false;
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loanService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {DatePipe} datePipe Date Pipe.
   */
  constructor(private formBuilder: FormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe) {
    this.loanId = this.route.parent.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.createNewGuarantorForm();
    this.setNewGuarantorDetailsForm();
    this.buildDependencies();
  }

  /** Create Guarantor Details Form */
  createNewGuarantorForm() {
    this.newGuarantorForm = this.formBuilder.group({
      'existingClient': [''],
      'name': ['', Validators.required],
      'clientRelationshipTypeId': ['']
    });
  }

  /** Sets Guarantor Details Form */
  setNewGuarantorDetailsForm() {
    this.relationTypes = this.dataObject.allowedClientRelationshipTypes;
    this.newGuarantorForm.patchValue({
      existingClient: true
    });
  }

  /**
   * Add guarantor detail fields to the UI.
   */
  buildDependencies() {
    this.newGuarantorForm.get('existingClient').valueChanges.subscribe(() => {
      this.showClientDetailsForm = !this.showClientDetailsForm;
      if (this.showClientDetailsForm) {
        this.newGuarantorForm.addControl('firstname', new FormControl(''));
        this.newGuarantorForm.addControl('lastname', new FormControl(''));
        this.newGuarantorForm.addControl('dob', new FormControl(''));
        this.newGuarantorForm.addControl('addressLine1', new FormControl(''));
        this.newGuarantorForm.addControl('addressLine2', new FormControl(''));
        this.newGuarantorForm.addControl('city', new FormControl(''));
        this.newGuarantorForm.addControl('zip', new FormControl(''));
        this.newGuarantorForm.addControl('mobileNumber', new FormControl(''));
        this.newGuarantorForm.addControl('housePhoneNumber', new FormControl(''));
        this.newGuarantorForm.removeControl('name');
      } else {
        this.newGuarantorForm.addControl('name', new FormControl(''));
        this.newGuarantorForm.removeControl('firstname');
        this.newGuarantorForm.removeControl('lastname');
        this.newGuarantorForm.removeControl('dob');
        this.newGuarantorForm.removeControl('addressLine1');
        this.newGuarantorForm.removeControl('addressLine2');
        this.newGuarantorForm.removeControl('city');
        this.newGuarantorForm.removeControl('zip');
        this.newGuarantorForm.removeControl('mobileNumber');
        this.newGuarantorForm.removeControl('housePhoneNumber');
      }
    });
  }

  /** Submits the new guarantor details form */
  submit() {
    const prevdob: Date = this.newGuarantorForm.value.dob;
    const guarantorTypeId: number = this.newGuarantorForm.value.existingClient ? this.dataObject.guarantorTypeOptions[0].id : this.dataObject.guarantorTypeOptions[2].id;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'dd-MM-yyyy';
    const locale = 'en';
    const newGuarantorData = {
      ... this.newGuarantorForm.value,
      dob: this.datePipe.transform(prevdob, dateFormat),
      locale,
      dateFormat,
      guarantorTypeId
    };
    delete newGuarantorData.existingClient;
    this.loanService.createNewGuarantor(this.loanId, newGuarantorData)
      .subscribe((response: any) => {
        this.router.navigate(['../general'], { relativeTo: this.route });
      });
  }

}
