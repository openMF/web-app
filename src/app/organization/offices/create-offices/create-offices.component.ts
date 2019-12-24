import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationService } from '../../organization.service';
import * as _moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'mifosx-create-offices',
  templateUrl: './create-offices.component.html',
  styleUrls: ['./create-offices.component.scss']
})

export class CreateOfficesComponent implements OnInit {
  officeForm: FormGroup;
  officeData: any;
  /** Minimum Due Date allowed. */
  minDate = new Date(1990, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  constructor(private formBuilder: FormBuilder, private organizationService: OrganizationService, private router: Router,
    private route: ActivatedRoute, private datePipe: DatePipe) {
    this.route.data.subscribe((data: {
      offices: any
    }) => {
      this.officeData = data.offices;

    });
  }

  ngOnInit() {
    this.createofficeForm();
  }

  /*
  Creates the Office Form
  */

  createofficeForm() {
    this.officeForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'parentId': ['', Validators.required],
      'openingDate': ['', Validators.required],
      'externalId': [''],
    });
  }

  submit() {
    const officeFormValue = this.officeForm.value;
    officeFormValue.locale = 'en';
    officeFormValue.dateFormat = 'dd MM yyyy';
    officeFormValue.openingDate = this.datePipe.transform(officeFormValue.openingDate, officeFormValue.dateFormat);
    this.organizationService.createOffice(officeFormValue).subscribe((response => {
      this.router.navigate(['../'], { relativeTo: this.route });
    })
    );
  }
}
