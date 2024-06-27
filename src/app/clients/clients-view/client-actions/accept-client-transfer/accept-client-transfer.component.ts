/** Angular Imports */
import { Component, OnInit } from "@angular/core";
import { UntypedFormGroup, UntypedFormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

/** Custom Services */
import { ClientsService } from "app/clients/clients.service";
import { Dates } from "app/core/utils/dates";
import { SettingsService } from "app/settings/settings.service";
import { MatomoTracker } from "@ngx-matomo/tracker";

/**
 * Accept Client Transfer Component
 */
@Component({
  selector: "mifosx-accept-client-transfer",
  templateUrl: "./accept-client-transfer.component.html",
  styleUrls: ["./accept-client-transfer.component.scss"],
})
export class AcceptClientTransferComponent implements OnInit {
  /** Accept Client Transfer form. */
  acceptClientTransferForm: UntypedFormGroup;
  /** Client Id */
  clientId: any;
  /** Transfer Date */
  transferDate: any;

  /**
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ClientsService} clientsService Clients Service
   * @param {SettingsService} settingsService Settings Service.
   * @param {Dates} dateUtils Date Utils
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private clientsService: ClientsService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router,
    private matomoTracker: MatomoTracker
  ) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.transferDate = data.clientActionData;
    });
    this.clientId = this.route.parent.snapshot.params["clientId"];
  }

  /**
   * Creates the accept client transfer form.
   */
  ngOnInit() {
    //Matomo log activity
    this.matomoTracker.trackEvent('clients', 'acceptClientTransferStart',this.clientId);// change to track right info

    this.createAcceptClientTransferForm();
  }

  /**
   * Creates the accept client transfer form.
   */
  createAcceptClientTransferForm() {
    this.acceptClientTransferForm = this.formBuilder.group({
      transferDate: { value: new Date(this.transferDate), disabled: true },
      note: [""],
    });
  }

  /**
   * Submits the form and accept the transfer of client
   * if successful redirects to the client.
   */
  submit() {
    const acceptClientTransferFormData = this.acceptClientTransferForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevTransferDate: Date = this.acceptClientTransferForm.value.transferDate;
    if (acceptClientTransferFormData.transferDate instanceof Date) {
      acceptClientTransferFormData.transferDate = this.dateUtils.formatDate(prevTransferDate, dateFormat);
    }
    const data = {
      ...acceptClientTransferFormData,
      /*   dateFormat,
      locale */
    };

    //Matomo log activity
    this.matomoTracker.trackEvent('clients', 'acceptClientTransfer',this.clientId);// change to track right info

    this.clientsService.executeClientCommand(this.clientId, "acceptTransfer", data).subscribe(() => {
      this.router.navigate(["../../"], { relativeTo: this.route });
    });
  }
}
