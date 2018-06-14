import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '@app/core';
import { NavigationComponent } from './navigation.component';

const routes: Routes = [
  Route.withShell([
    { path: 'navigation', component: NavigationComponent}
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class NavigationRoutingModule { }
