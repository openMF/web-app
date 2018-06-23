import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Component, OnInit, ViewChild} from '@angular/core';

import { ArchwizardModule } from 'angular-archwizard';
import { CoreModule } from '../core/core.module';

import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';
import { CreateClientComponent} from './create-client/create-client.component';
import { ViewClientComponent } from './view-client/view-client.component';
import { ViewLoanComponent } from './view-loan/view-loan.component';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    ClientsRoutingModule,
    ArchwizardModule,
  ],
  declarations: [
    ClientsComponent,
    CreateClientComponent,
    ViewClientComponent,
    ViewLoanComponent
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ClientsModule { }
