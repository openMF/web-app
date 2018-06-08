import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NavigationComponent } from './navigation.component';

const routes: Routes = [
  { path: 'navigation', component: NavigationComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class NavigationRoutingModule { }
