/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';

/**
 * Accept Client Transfer Component
 */
@Component({
  selector: 'mifosx-accept-client-transfer',
  templateUrl: './accept-client-transfer.component.html',
  styleUrls: ['./accept-client-transfer.component.scss']
})
export class AcceptClientTransferComponent implements OnInit {

  /** Accept Client Transfer form. */
  acceptClientTransferForm: FormGroup;
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
   * Creates the accept client transfer form.
   */
  ngOnInit() {
    this.createAcceptClientTransferForm();
  }

  /**
   * Creates the accept client transfer form.
   */
  createAcceptClientTransferForm() {
    this.acceptClientTransferForm = this.formBuilder.group({
      'transferDate': {value: new Date(this.transferDate), disabled: true},
      'note': ['']
    });
  }

  /**
   * Submits the form and accept the transfer of client
   * if successful redirects to the client.
   */
  submit() {
    const data = {
      ...this.acceptClientTransferForm.value,
    };
    this.clientsService.executeClientCommand(this.clientId, 'acceptTransfer', data).subscribe(() => {
      this.router.navigate(['../../'], { relativeTo: this.route });
    });
  }

}
