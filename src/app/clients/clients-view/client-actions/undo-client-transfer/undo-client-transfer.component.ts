/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Undo Client Transfer Component
 */
@Component({
  selector: 'mifosx-undo-client-transfer',
  templateUrl: './undo-client-transfer.component.html',
  styleUrls: ['./undo-client-transfer.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class UndoClientTransferComponent implements OnInit {
  /** Undo Client Transfer form. */
  undoClientTransferForm: UntypedFormGroup;
  /** Client Id */
  clientId: any;
  /** Transfer Date */
  transferDate: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ClientsService} clientsService Clients Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private clientsService: ClientsService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.transferDate = data.clientActionData;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  /**
   * Creates the undo client transfer form.
   */
  ngOnInit() {
    this.createUndoClientTransferForm();
  }

  /**
   * Creates the undo client transfer form.
   */
  createUndoClientTransferForm() {
    this.undoClientTransferForm = this.formBuilder.group({
      transferDate: { value: new Date(this.transferDate), disabled: true },
      note: ['']
    });
  }

  /**
   * Submits the form and undo the transfer of client
   * if successful redirects to the client.
   */
  submit() {
    const undoClientTransferFormData = this.undoClientTransferForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransferDate: Date = this.undoClientTransferForm.value.transferDate;
    if (undoClientTransferFormData.transferDate instanceof Date) {
      undoClientTransferFormData.transferDate = this.dateUtils.formatDate(prevTransferDate, dateFormat);
    }
    const data = {
      ...undoClientTransferFormData
    };
    this.clientsService.executeClientCommand(this.clientId, 'withdrawTransfer', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }
}
