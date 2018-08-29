import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as moment from 'moment';
import { OrganisationService } from '../../organisation.service';
import { Router, ActivatedRouteSnapshot, ActivatedRoute } from '@angular/router';
@Component({
  selector: 'mifosx-edit-office',
  templateUrl: './edit-office.component.html',
  styleUrls: ['./edit-office.component.scss']
})
export class EditOfficeComponent implements OnInit {
  officeForm: FormGroup;
  currentOfficeId: Number;
  currentOffice: any;
  offices: any;

  minDate = new Date(1900, 0, 1);
  maxDate = new Date();
  constructor(private formBuilder: FormBuilder, private organisationService: OrganisationService, private router: Router,
    private route: ActivatedRoute) {
    this.route.data.subscribe((data: { office: any, offices: any }) => {
      this.currentOffice = data.office;
      this.currentOfficeId = data.office.id;
      this.offices = data.offices;
    });

  }

  ngOnInit() {
    this.createOfficeForm();
  }

  createOfficeForm() {
    this.officeForm = this.formBuilder.group({
      'name': [this.currentOffice.name, Validators.required],
      'parentId': [this.currentOffice.nameDecorated, Validators.required],
      'openingDate': [new Date(this.currentOffice.openingDate), Validators.required],
      'externalId': [this.currentOffice.externalId],
    });
  }

  submit() {
    const officeFormValue = this.officeForm.value;
    officeFormValue.locale = 'en';
    officeFormValue.dateFormat = 'dd MMMM yyyy';
    officeFormValue.openingDate = moment(officeFormValue.openingDate).startOf('day').format('DD MMM YYYY');
    this.organisationService.updateOffice(officeFormValue, this.currentOfficeId).subscribe(response => {
      this.router.navigate(['../../', response.officeId], { relativeTo: this.route });
    }
    );
  }
}
