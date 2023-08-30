/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';

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
  undoClientRejectionForm: UntypedFormGroup;
  /** Client Id */
  clientId: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {clientsService} clientsService Cliens Service
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private clientsService: ClientsService,
              private dateUtils: Dates,
              private route: ActivatedRoute,
              private router: Router,
              private settingsService: SettingsService) {
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  /**
   * Creates the undo client rejection form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
    const undoClientRejectionFormData = this.undoClientRejectionForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevReopenedDate: Date = this.undoClientRejectionForm.value.reopenedDate;
    if (undoClientRejectionFormData.reopenedDate instanceof Date) {
      undoClientRejectionFormData.reopenedDate = this.dateUtils.formatDate(prevReopenedDate, dateFormat);
    }
    const data = {
      ...undoClientRejectionFormData,
      dateFormat,
      locale
    };
    this.clientsService.executeClientCommand(this.clientId, 'undoRejection', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
