/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { OrganizationRoutingModule } from './organization-routing.module';

/** Custom Components */
import { OrganizationComponent } from './organization.component';



@NgModule({
  imports: [
    SharedModule,
    OrganizationRoutingModule
  ],
  declarations: [
    OrganizationComponent,
  ]
})
export class OrganizationModule { }
