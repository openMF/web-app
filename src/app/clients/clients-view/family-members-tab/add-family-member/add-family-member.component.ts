import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { ClientsService } from '../../../clients.service';


@Component({
  selector: 'mifosx-add-family-member',
  templateUrl: './add-family-member.component.html',
  styleUrls: ['./add-family-member.component.scss']
})
export class AddFamilyMemberComponent implements OnInit {
  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** Add family member form. */
  addFamilyMemberForm: FormGroup;
  /** Add family member template. */
  addFamilyMemberTemplate: any;
  clientId: any;
  constructor(private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private clientsService: ClientsService) {
    this.route.data.subscribe((data: { clientTemplate: any }) => {
      this.addFamilyMemberTemplate = data.clientTemplate.familyMemberOptions;
    });
    this.clientId = this.route.parent.parent.snapshot.params['clientId'];

  }

  ngOnInit() {
    this.createAddFamilyMemberForm();

  }


  createAddFamilyMemberForm() {
    this.addFamilyMemberForm = this.formBuilder.group({
      'firstName': ['', Validators.required],
      'middleName': [''],
      'lastName': ['', Validators.required],
      'qualification': [''],
      'age': ['', Validators.required],
      'isDependent': [''],
      'relationshipId': ['', Validators.required],
      'genderId': ['', Validators.required],
      'professionId': [''],
      'maritalStatusId': [''],
      'dateOfBirth': ['', Validators.required]
    });
  }

  submit() {
    const prevDateOfBirth: Date = this.addFamilyMemberForm.value.dateOfBirth;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.addFamilyMemberForm.patchValue({
      dateOfBirth: this.datePipe.transform(prevDateOfBirth, dateFormat)
    });
    const familyMemberData = this.addFamilyMemberForm.value;
    familyMemberData.locale = 'en';
    familyMemberData.dateFormat = dateFormat;
    this.clientsService.addFamilyMember(this.clientId, familyMemberData).subscribe(res => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });

  }

}
