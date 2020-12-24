/** Angular Imports */
import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {SystemService} from '../../system.service';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'mifosx-creditbureausummary',
  templateUrl: './creditBureauSummary.component.html',
  styleUrls: ['./creditBureauSummary.component.scss']
})
export class CreditBureauSummaryComponent {

  creditBureauSummary: any;
  creditBureauSummaryDataSource: any;
  creditBureauMappingDataSource: any;

  organisationCreditBureauConfigurationForm: FormGroup;
  organisationCreditBureauMappingConfigurationForm: FormGroup;

  creditBureauSummaryDisplayedColumns: string[] = ['CBId', 'Alias', 'CBName', 'CBProduct', 'country', 'isActive', 'action'];
  creditBureauMappingDisplayedColumns: string[] = ['CBId', 'Alias', 'CBSummary', 'CBProduct', 'CreditCheckMandatory', 'skipCreditCheck' , 'stalePeriod' , 'isActive', 'action'];

  constructor(private route: ActivatedRoute, private router: Router, private systemService: SystemService, private changeDetectorRefs: ChangeDetectorRef, private formBuilder: FormBuilder) {
    this.route.data.subscribe(( data: { creditBureauSummary: any, creditBureauMapping: any}) => {
      this.creditBureauSummaryDataSource = data.creditBureauSummary;
      this.creditBureauMappingDataSource = data.creditBureauMapping;
    });
  }

  toggleAliasStatus(configuration: any) {

    this.organisationCreditBureauConfigurationForm = this.formBuilder.group({
      'creditBureauId': configuration.organisationCreditBureauId,
      'isActive': !configuration.isActive
    });
    this.updateBureauConfiguration(configuration);
  }
  updateBureauConfiguration(configuration: any) {
    this.systemService.updateOrganisationCreditBureauConfiguration(this.organisationCreditBureauConfigurationForm.value)
      .subscribe((response: any) => {
        configuration.isActive = response.isActive;
        window.location.reload();
      });
  }
  toggleMappingStatus(configuration: any) {
    this.organisationCreditBureauMappingConfigurationForm = this.formBuilder.group({
      'creditbureauLoanProductMappingId': configuration.creditbureauLoanProductMappingId,
      'isActive': !configuration.isActive
    });
    this.updateBureauMappingConfiguration(configuration);
  }
  updateBureauMappingConfiguration(configuration: any) {
    this.systemService.updateMappingConfiguration(this.organisationCreditBureauMappingConfigurationForm.value)
      .subscribe((response: any) => {
        configuration.isActive = response.isActive;
        window.location.reload();
      });
  }
}
