import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LoansService } from 'app/loans/loans.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-assign-loan-officer',
  templateUrl: './assign-loan-officer.component.html',
  styleUrls: ['./assign-loan-officer.component.scss']
})
export class AssignLoanOfficerComponent implements OnInit {

  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  loanOfficers: any[];
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Assign loan Officer form. */
  assignOfficerForm: FormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} systemService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private formBuilder: FormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private datePipe: DatePipe,
    private settingsService: SettingsService) {
      this.loanId = this.route.parent.snapshot.params['loanId'];
    }

  /**
   * Creates the assign officer form.
   */
  ngOnInit() {
    this.createassignOfficerForm();
    this.loanOfficers = this.dataObject.loanOfficerOptions;
  }

  /**
   * Creates the create close form.
   */
  createassignOfficerForm() {
    this.assignOfficerForm = this.formBuilder.group({
      'toLoanOfficerId': ['', Validators.required],
      'assignmentDate': [new Date(), Validators.required]
    });
  }

  submit() {
    const assignmentDate = this.assignOfficerForm.value.assignmentDate;
    const dateFormat = this.settingsService.dateFormat;
    this.assignOfficerForm.patchValue({
      assignmentDate: this.datePipe.transform(assignmentDate, dateFormat)
    });
    const assignForm = this.assignOfficerForm.value;
    assignForm.locale = this.settingsService.language.code;
    assignForm.dateFormat = dateFormat;
    assignForm.fromLoanOfficerId = this.dataObject.loanOfficerId || '';

    this.loanService.loanActionButtons(this.loanId, 'assignLoanOfficer', assignForm)
      .subscribe((response: any) => {
        this.router.navigate([`../../general`], { relativeTo: this.route });
    });
  }

}
