import {Component, Input , OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router, Routes} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { CreditBureauService } from 'app/clients/clients-view/credit-report/creditbureau.service';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import {ClientsService} from '../../clients.service';
import {DatePipe} from '@angular/common';
import {SettingsService} from '../../../settings/settings.service';
import {Route} from '../../../core/route/route.service';
import {extract} from '../../../core/i18n/i18n.service';
import {ThitsaworksComponent} from '../credit-report/thitsaworks/thitsaworks.component';
import {CreditBureauResolver} from '../../common-resolvers/credit-bureau.resolver';

@Component({
  selector: 'mifosx-creditreport-tab',
  templateUrl: './credit-report.component.html',
  styleUrls: ['./credit-report.component.scss']
})
  export class CreditReportComponent implements OnInit {


  CreditBureauForm: FormGroup;

  creditBureauList: any;

  creditBureauName: any;


  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private creditBureauService: CreditBureauService,
              private datePipe: DatePipe,
              private settingsService: SettingsService) {
    this.route.data.subscribe((data: { creditBureauData: any }) => {
      this.creditBureauList = data.creditBureauData;
    });
  }


  ngOnInit() {
    this.createCreditBureauForm();
  }
  createCreditBureauForm() {
    this.CreditBureauForm = this.formBuilder.group({
      'creditBureauName': [''],
    });
    this.buildDependencies();
  }

  buildDependencies() {
    this.creditBureauName = this.CreditBureauForm.get('creditBureauName');
  }
  submit() {
    this.creditBureauName = this.CreditBureauForm.value.creditBureauName;
    this.router.navigate(['../creditReport/', this.creditBureauName]);
  }

  upload() {
    this.creditBureauName = this.CreditBureauForm.value.creditBureauName;
    this.router.navigate(['../creditReport/upload/']);
  }



}


