import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '../core/core.module';
import { MatTableModule } from '@angular/material/table';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ArchwizardModule } from 'angular-archwizard';

import { ClientsRoutingModule } from './clients-routing.module';
import { ClientsComponent } from './clients.component';
import { CreateClientComponent} from './create-client/create-client.component';
import { ViewClientComponent } from './view-client/view-client.component';
import { ViewLoanComponent } from './view-loan/view-loan.component';
import { CreateAddressComponent } from './create-address/create-address.component';

import { ClientsService } from './clients.service';

@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    ClientsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    BrowserModule,  // tslint:disable
    HttpModule, 
    MatTableModule,
    ArchwizardModule,
  ],
  declarations: [
    ClientsComponent,
    CreateClientComponent,
    ViewClientComponent,
    ViewLoanComponent,
    CreateAddressComponent
],
  providers: [
    ClientsService,
    HttpModule  // tslint:disable
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ClientsModule { }
