/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { TemplatesRoutingModule } from './templates-routing.module';

/** Custom Components */
import { TemplatesComponent } from './templates.component';

/**
 * Templates Module
 *
 * Templates components should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    TemplatesRoutingModule
  ],
  declarations: [
    TemplatesComponent
  ]
})
export class TemplatesModule { }
