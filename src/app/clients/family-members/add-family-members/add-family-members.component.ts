import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ClientsService } from '../../clients.service';

@Component({
  selector: 'mifosx-add-family-members',
  templateUrl: './add-family-members.component.html',
  styleUrls: ['./add-family-members.component.scss']
})
export class AddFamilyMemberComponent implements OnInit {

  /** add family member entry form. */
  familyMemberForm: FormGroup;
  genderIdData: any;
  maritalStatusIdData: any;
  professionIdData: any;
  relationshipIdData: any;
  paramsSubscription: Subscription;
  id: number;



  constructor(private formBuilder: FormBuilder,
    private clientService: ClientsService,
    private route: ActivatedRoute,
    private router: Router) {
    this.route.data.subscribe((data: { familyMember: any }) => {
      this.genderIdData = data.familyMember.genderIdOptions;
      this.maritalStatusIdData = data.familyMember.maritalStatusIdOptions;
      this.professionIdData = data.familyMember.professionIdOptions;
      this.relationshipIdData = data.familyMember.relationshipIdOptions;
    });
  }

  ngOnInit() {
    this.paramsSubscription = this.route.params
      .subscribe(
        (params: Params) => {
          this.id = Number(params['id']);
        }
      );
    this.createFamilyMemberForm();
  }

  /**
   * Creates the add family member form.
   */
  createFamilyMemberForm() {
    this.familyMemberForm = this.formBuilder.group({
      'firstName': ['', Validators.required],
      'middleName': [''],
      'lastName': ['', Validators.required],
      'qualification': [''],
      'mobileNumber': [''],
      'age': ['', Validators.required],
      'isDependent': [false],
      'relationshipId': [''],
      'maritalStatusId': [''],
      'genderId': [''],
      'professionId': [''],
      'dateOfBirth': ['', Validators.required]
    });
  }

  /**
   * Submits the add family member form and creates a family member,
   * if successful redirects to family member page.
   */
  submit() {
    const familyMember = this.familyMemberForm.value;
    familyMember.locale = 'en';
    familyMember.dateFormat = 'yyyy-MM-dd';
    if (familyMember.dateOfBirth instanceof Date) {
      let day = familyMember.dateOfBirth.getDate();
      let month = familyMember.dateOfBirth.getMonth() + 1;
      const year = familyMember.dateOfBirth.getFullYear();
      if (day < 10) {
        day = `0${day}`;
      }
      if (month < 10) {
        month = `0${month}`;
      }
      familyMember.dateOfBirth = `${year}-${month}-${day}`;
    }

    this.clientService.addFamilyMember(familyMember, this.id).subscribe(response => {
      this.router.navigate(['/clients/view/', this.id], { relativeTo: this.route });
    });
  }
}


