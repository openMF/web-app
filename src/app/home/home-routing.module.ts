import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Route, extract } from '../core';
import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  Route.withShell([
    {
      path: '',
      redirectTo: '/home',
      pathMatch: 'full'
    },
    {
      path: 'home',
      component: HomeComponent,
      data: { title: extract('Home') }
    },
    {
      path: 'dashboard',
      component: DashboardComponent,
      data: { title: extract('Dashboard'), breadcrumb: 'Dashboard' }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class HomeRoutingModule { }
