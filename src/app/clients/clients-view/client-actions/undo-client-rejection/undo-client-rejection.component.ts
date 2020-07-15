/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * Undo Client Rejection Component
 */
@Component({
  selector: 'mifosx-undo-client-rejection',
  templateUrl: './undo-client-rejection.component.html',
  styleUrls: ['./undo-client-rejection.component.scss']
})
export class UndoClientRejectionComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Undo Client Rejection form. */
  undoClientRejectionForm: FormGroup;
  /** Client Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {clientsService} clientsService Cliens Service
   * @param {DatePipe} datePipe Date Pipe
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private clientsService: ClientsService,
              private datePipe: DatePipe,
              private route: ActivatedRoute,
              private router: Router) {
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  /**
   * Creates the undo client rejection form.
   */
  ngOnInit() {
    this.createUndoClientRejectionForm();
  }

  /**
   * Creates the undo client rejection form.
   */
  createUndoClientRejectionForm() {
    this.undoClientRejectionForm = this.formBuilder.group({
      'reopenedDate': ['', Validators.required]
    });
  }

  /**
   * Submits the form and undo client rejection,
   * if successful redirects to the client.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const prevReopenedDate: Date = this.undoClientRejectionForm.value.reopenedDate;
    this.undoClientRejectionForm.patchValue({
      reopenedDate: this.datePipe.transform(prevReopenedDate, dateFormat),
    });
    const data = {
      ...this.undoClientRejectionForm.value,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'undoRejection', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
