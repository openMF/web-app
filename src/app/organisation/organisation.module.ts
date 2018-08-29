import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '../core/core.module';
import { OrganisationComponent } from './organisation.component';
import { OrganisationRoutingModule } from './organisation-routing.module';
import { OfficesComponent } from './offices/offices.component';
import { CreateOfficeComponent } from './offices/create-office/create-office.component';
import { EditOfficeComponent } from './offices/edit-office/edit-office.component';
import { ViewOfficeComponent } from './offices/view-office/view-office.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule,
    OrganisationRoutingModule,
  ],
  declarations: [
    OrganisationComponent,
    OfficesComponent,
    CreateOfficeComponent,
    EditOfficeComponent,
    ViewOfficeComponent
  ]
})
export class OrganisationModule { }
