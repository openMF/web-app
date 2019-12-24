import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { OrganizationService } from '../../organization.service';
import * as _moment from 'moment';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-create-office',
  templateUrl: './create-offices.component.html',
  styleUrls: ['./create-offices.component.scss']
})

export class CreateOfficesComponent implements OnInit {
  newOfficeForm: FormGroup;
  officeData: any;
  minDate = new Date(1990, 0, 1);
  maxDate = new Date();
  constructor(private formBuilder: FormBuilder, private organizationService: OrganizationService, private router: Router,
    private route: ActivatedRoute) {
    this.route.data.subscribe((data: {
      offices: any
    }) => {
      this.officeData = data.offices;

    });
  }

  ngOnInit() {
    this.createOfficeForm();
  }

  createOfficeForm() {
    this.newOfficeForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'parentId': ['', Validators.required],
      'openingDate': ['', Validators.required],
      'externalId': [''],
    });
  }

  submit() {
    const newOfficeFormValue = this.newOfficeForm.value;
    newOfficeFormValue.locale = 'en';
    newOfficeFormValue.dateFormat = 'dd MMMM yyyy';
    newOfficeFormValue.openingDate = _moment(newOfficeFormValue.openingDate).startOf('day').format('DD MMM YYYY');
    this.organizationService.createOffice(newOfficeFormValue).subscribe((response => {
      this.router.navigate(['../'], { relativeTo: this.route });
    })
    );
  }
}