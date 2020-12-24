import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CreditBureauService} from '../../../../clients/clients-view/credit-report/creditbureau.service';
import {DatePipe} from '@angular/common';
import {SystemService} from '../../../system.service';




@Component({
  selector: 'mifosx-creditbureauconfiguration',
  templateUrl: './creditBureauConfiguration.component.html',
  styleUrls: ['./creditBureauConfiguration.component.scss']
})

export class CreditBureauConfigurationComponent implements OnInit {

  creditBureauConfigurationData: any;
  CreditBureauConfigurationForm: FormGroup;

  configkey: any;
  value: any;
  description: any;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private creditBureauService: CreditBureauService,
              private datePipe: DatePipe,
              private systemService: SystemService) {
    this.route.data.subscribe((data: { configurationData: any }) => {
      this.creditBureauConfigurationData = data.configurationData;
    });
  }

  ngOnInit() {
    this.creditBureauConfiguration();
  }

  creditBureauConfiguration() {
    this.CreditBureauConfigurationForm = this.formBuilder.group({
      'configkey': [''],
      'value': [''],
      'description': ['']
    });
    this.buildDependencies();
  }

  buildDependencies() {
   this.configkey = this.CreditBureauConfigurationForm.get('configkey');
    this.value = this.CreditBureauConfigurationForm.get('value');
    this.description = this.CreditBureauConfigurationForm.get('description');
  }

  submit() {
    const configurationId = this.CreditBureauConfigurationForm.get('configkey').value;
    this.systemService.putConfiguration( configurationId , this.CreditBureauConfigurationForm.value).subscribe((response: any) => {
    });
  }

  cancel() {
    this.router.navigate(['system/external-services/creditBureau/creditBureauList']);
  }
}
