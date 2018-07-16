import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {

  officeData: string[];
  staffData: string[];
  genderData: string[];

  constructor() { }

  ngOnInit() {
  }

}
