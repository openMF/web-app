import { Component, OnInit } from '@angular/core';
import  { FormGroup,FormBuilder,Validators,FormArray} from '@angular/forms';
import { Router ,ActivatedRoute } from  '@angular/router';

/* Custom Services */
import { ClientsService } from 'app/clients/clients.service';

@Component({
  selector: 'mifosx-create-survey',
  templateUrl: './create-survey.component.html',
  styleUrls: ['./create-survey.component.scss']
})
export class CreateSurveyComponent implements OnInit {
    SurveyForm: FormGroup;
    surveyData:any;

/**
* Retrieves the offices, currencies, payment types and gl accounts data from `resolve`.
* @param {FormBuilder} formBuilder Form Builder.
* @param {clientService} clientService Clients Service.

*/


  constructor(private formBuilder: FormBuilder,
              private clientService: ClientsService,
              private route: ActivatedRoute,
              private router:Router
              ) {
        this.route.data.subscribe((data: {
        surveys: any
        
      }) => {
        this.surveyData = data.surveys;
        
      });
   
      }

  ngOnInit() {
    this.createSurveyForm();
 
  }
  createSurveyForm() {
    this.SurveyForm =this.formBuilder.group({
        
        'ppi_household_members_cd_q1_householdmembers':[''],
        'ppi_highestschool_cd_q2_highestschool' : [''] ,
        'ppi_businessoccupation_cd_q3_businessoccupation' : ['']
         
    });
  }
  submit(){
   const Survey = this.SurveyForm.value;
   Survey.locale='en';
   Survey.dateFormat='yyyy-MM-dd';
  
  this.clientService.postCreateSurvey(Survey).subscribe(response => {
      this.router.navigate(['', response.clientId], { relativeTo: this.route });
    });
  }
    

  
 }




