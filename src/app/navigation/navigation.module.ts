import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '../core/core.module';
import { NavigationComponent } from './navigation.component';
import { NavigationRoutingModule } from './navigation-routing.module';


@NgModule({
  imports: [
    CoreModule,
    CommonModule,
    NavigationRoutingModule
  ],
  declarations: [NavigationComponent]
})
export class NavigationModule { }
