/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * Undo Client Transfer Component
 */
@Component({
  selector: 'mifosx-undo-client-transfer',
  templateUrl: './undo-client-transfer.component.html',
  styleUrls: ['./undo-client-transfer.component.scss']
})
export class UndoClientTransferComponent implements OnInit {

  /** Undo Client Transfer form. */
  undoClientTransferForm: FormGroup;
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
  constructor(private formBuilder: FormBuilder,
              private clientsService: ClientsService,
              private route: ActivatedRoute,
              private router: Router) {
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
      'transferDate': {value: new Date(this.transferDate), disabled: true},
      'note': ['']
    });
  }

  /**
   * Submits the form and undo the transfer of client
   * if successful redirects to the client.
   */
  submit() {
    const data = {
      ...this.undoClientTransferForm.value,
    };
    this.clientsService.executeClientCommand(this.clientId, 'withdrawTransfer', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
