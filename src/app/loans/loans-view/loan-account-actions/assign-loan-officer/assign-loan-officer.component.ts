import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoansService } from 'app/loans/loans.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

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
    private dateUtils: Dates,
    private settingsService: SettingsService) {
      this.loanId = this.route.snapshot.params['loanId'];
    }

  /**
   * Creates the assign officer form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const assignOfficerFormData = this.assignOfficerForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const assignmentDate = this.assignOfficerForm.value.assignmentDate;
    if (assignOfficerFormData.assignmentDate instanceof Date) {
      assignOfficerFormData.assignmentDate = this.dateUtils.formatDate(assignmentDate, dateFormat);
    }
    const data = {
      ...assignOfficerFormData,
      dateFormat,
      locale
    };
    data.fromLoanOfficerId = this.dataObject.loanOfficerId || '';
    this.loanService.loanActionButtons(this.loanId, 'assignLoanOfficer', data)
      .subscribe((response: any) => {
        this.router.navigate([`../../general`], { relativeTo: this.route });
    });
  }

}
