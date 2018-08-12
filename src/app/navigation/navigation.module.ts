/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { NavigationRoutingModule } from './navigation-routing.module';

/** Custom Components */
import { NavigationComponent } from './navigation.component';

/**
 * Navigation Module
 *
 * Navigation components should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    NavigationRoutingModule
  ],
  declarations: [
    NavigationComponent
  ]
})
export class NavigationModule { }
