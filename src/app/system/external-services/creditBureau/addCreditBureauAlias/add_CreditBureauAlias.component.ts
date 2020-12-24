import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CreditBureauService} from '../../../../clients/clients-view/credit-report/creditbureau.service';
import {DatePipe} from '@angular/common';
import {SettingsService} from '../../../../settings/settings.service';
import {HttpParams} from '@angular/common/http';
import {MatTableDataSource} from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import {SystemService} from '../../../system.service';




@Component({
  selector: 'mifosx-creditbureaualias',
  templateUrl: './add_CreditBureauAlias.component.html',
  styleUrls: ['./add_CreditBureauAlias.component.scss']
})

export class AddCreditBureauAliasComponent implements OnInit {

  creditbureaus: any;
  CreditBureauAliasForm: FormGroup;

  alias: any;
  creditBureauId: any;
  description: any;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private creditBureauService: CreditBureauService,
              private datePipe: DatePipe,
              private systemService: SystemService) {
    this.route.data.subscribe((data: { creditBureauData: any }) => {
      this.creditbureaus = data.creditBureauData;
    });
  }

  ngOnInit() {
    this.creditBureauAlias();
  }

  creditBureauAlias() {
    this.CreditBureauAliasForm = this.formBuilder.group({
      'alias': [''],
      'creditBureauId': [''],
    });
    this.buildDependencies();
  }
  buildDependencies() {
    this.alias = this.CreditBureauAliasForm.get('alias');
    this.creditBureauId = this.CreditBureauAliasForm.get('creditBureauId');
  }
  submit() {
    const creditBureauId = this.CreditBureauAliasForm.get('creditBureauId').value;
    this.systemService.postCreditBureauAlias( creditBureauId , this.CreditBureauAliasForm.value).subscribe((response: any) => {
    });
    this.router.navigate(['../system/external-services/creditBureau']);
  }
}
