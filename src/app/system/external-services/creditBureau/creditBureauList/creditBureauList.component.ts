import {Component, Input , OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router, Routes} from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { CreditBureauService } from 'app/clients/clients-view/credit-report/creditbureau.service';
import {DatePipe} from '@angular/common';


@Component({
  selector: 'mifosx-creditbureaulist',
  templateUrl: './creditBureauList.component.html',
  styleUrls: ['./creditBureauList.component.scss']
})
export class CreditBureauListComponent implements OnInit {

  CreditBureauForm: FormGroup;

  creditBureauList: any;
  creditBureauId: any;
  id: any;


  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { creditBureauData: any }) => {
      this.creditBureauList = data.creditBureauData;
    });
  }
  ngOnInit() {
    this.createCreditBureauForm();
  }
  createCreditBureauForm() {
    this.CreditBureauForm = this.formBuilder.group({
      'BureauId': [''],
    });
    this.buildDependencies();
  }

  buildDependencies() {
    this.id = this.CreditBureauForm.get('BureauId');
  }
  submit() {
   const creditBureauId = this.CreditBureauForm.value.BureauId;
      this.router.navigate(['system/external-services/creditBureau/creditBureauConfiguration/', creditBureauId]);
  }

}
