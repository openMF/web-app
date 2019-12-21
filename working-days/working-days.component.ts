import { Component, OnInit } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';
import { NgModule } from '@angular/core';

@NgModule({
  declarations:[
    WorkingDaysComponent
  ],
imports: [
  MatCheckboxModule,
  MatSelectModule,
  MatButtonModule,
  MatFormFieldModule,
  MatTableModule,
  Router,
  ActivatedRoute
]
})

@Component({
  selector: 'mifosx-working-days',
  templateUrl: './working-days.component.html',
  styleUrls: ['./working-days.component.scss']
})
export class WorkingDaysComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
