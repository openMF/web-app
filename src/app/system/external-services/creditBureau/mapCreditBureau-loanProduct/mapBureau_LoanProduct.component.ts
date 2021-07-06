import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CreditBureauService} from '../../../../clients/clients-view/credit-report/creditbureau.service';
import {DatePipe} from '@angular/common';
import {SystemService} from '../../../system.service';




@Component({
  selector: 'mifosx-creditbureaumapping',
  templateUrl: './mapBureau_LoanProduct.component.html',
  styleUrls: ['./mapBureau_LoanProduct.component.scss']
})

export class MapBureauLoanProductComponent implements OnInit {

  organisationCreditBureauConfigurationData: any;
  CreditBureauMappingForm: FormGroup;

  /** Loans Account Template */
  @Input() loansAccountTemplate: any;

  loanProductsData: any;
  // Data required to map creaditBureau with LoanProduct
  loanProductId: any;
  isCreditcheckMandatory: any;
  skipCreditcheckInFailure: any;
  stalePeriod: any;

  creditbureauid: any;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private creditBureauService: CreditBureauService,
              private datePipe: DatePipe,
              private systemService: SystemService) {
    this.route.data.subscribe((data: { OrganisationCreditBureauData: any , loanProducts: any }) => {
      this.organisationCreditBureauConfigurationData = data.OrganisationCreditBureauData;
      this.loanProductsData = data.loanProducts;
    });
  }

  ngOnInit() {
    this.creditBureauConfiguration();
  }

  creditBureauConfiguration() {
    this.CreditBureauMappingForm = this.formBuilder.group({
      'loanProductId': [''],
      'isCreditcheckMandatory': [''],
      'skipCreditcheckInFailure': [''],
      'stalePeriod': [''],
      'locale': ['en'],
    });
    this.buildDependencies();
  }

  buildDependencies() {
    this.loanProductId = this.CreditBureauMappingForm.get('loanProductId');
    this.isCreditcheckMandatory = this.CreditBureauMappingForm.get('isCreditcheckMandatory');
    this.skipCreditcheckInFailure = this.CreditBureauMappingForm.get('skipCreditcheckInFailure');
    this.stalePeriod = this.CreditBureauMappingForm.get('stalePeriod');
  }

  submit(organisationCreditBureauId: any) {
     this.creditbureauid = organisationCreditBureauId.value;
    this.systemService.postCreditBureauMapping( this.creditbureauid.organisationCreditBureauId , this.CreditBureauMappingForm.value).subscribe((response: any) => {
    });
    this.router.navigate(['../system/external-services/creditBureau']);
  }
}
