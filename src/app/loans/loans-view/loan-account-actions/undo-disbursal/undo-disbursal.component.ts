/** Angular Imports */
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
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

  @Input() actionName: string;

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
    this.loanId = this.route.snapshot.params['loanId'];
  }

  /**
   * Creates the undo disbursal form.
   */
  ngOnInit() {
    this.note = this.formBuilder.control('', Validators.required);
  }

  /**
   * Submits the undo disbursal form.
   */
  submit() {
    let command = 'undodisbursal';
    if (this.actionName === 'Undo Last Disbursal') {
      command = 'undolastdisbursal';
    }
    this.loansService.loanActionButtons(this.loanId, command, {'note': this.note.value}).subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }

}
