import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../core';
import { NavigationComponent } from './navigation.component';

const routes: Routes = [
  Route.withShell([
    {
      path: 'navigation',
      component: NavigationComponent,
      data: { title: extract('Navigation') }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class NavigationRoutingModule { }
