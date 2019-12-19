import { Component, OnInit } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { NgModule } from '@angular/core';

@NgModule({
imports: [
  MatCheckboxModule,
  MatSelectModule,
  MatButtonModule
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
