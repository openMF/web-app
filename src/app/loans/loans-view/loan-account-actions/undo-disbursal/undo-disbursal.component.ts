/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormControl, FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { LoansService } from '../../../loans.service';

/**
 * Undo Disbursal component.
 */
@Component({
  selector: 'mifosx-undo-disbursal',
  templateUrl: './undo-disbursal.component.html',
  styleUrls: ['./undo-disbursal.component.scss']
})
export class UndoDisbursalComponent implements OnInit {

  /** Loan ID. */
  loanId: any;
  /** Undo disbursal form. */
  note: FormControl;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loansService Loans Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private loansService: LoansService,
              private router: Router,
              private route: ActivatedRoute) {
    this.loanId = this.route.parent.snapshot.params['loanId'];
  }

  /**
   * Creates the undo disbursal form.
   */
  ngOnInit() {
    this.note = this.formBuilder.control('');
  }

  /**
   * Submits the undo disbursal form.
   */
  submit() {
    this.loansService.loanActionButtons(this.loanId, 'undodisbursal', {'note': this.note.value}).subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }

}
