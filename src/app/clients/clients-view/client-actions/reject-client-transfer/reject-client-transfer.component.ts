/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * Reject Client Transfer Component
 */
@Component({
  selector: 'mifosx-reject-client-transfer',
  templateUrl: './reject-client-transfer.component.html',
  styleUrls: ['./reject-client-transfer.component.scss']
})
export class RejectClientTransferComponent implements OnInit {

  /** Reject Client Transfer form. */
  rejectClientTransferForm: FormGroup;
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

  ngOnInit() {
    this.createRejectClientTransferForm();
  }

  /**
   * Creates the reject client transfer form.
   */
  createRejectClientTransferForm() {
    this.rejectClientTransferForm = this.formBuilder.group({
      'transferDate': {value: new Date(this.transferDate), disabled: true},
      'note': ['']
    });
  }

  /**
   * Submits the form and reject the transfer of client
   * if successful redirects to the client.
   */
  submit() {
    const data = {
      ...this.rejectClientTransferForm.value,
    };
    this.clientsService.executeClientCommand(this.clientId, 'rejectTransfer', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
