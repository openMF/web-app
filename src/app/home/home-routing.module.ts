/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { HomeComponent } from './home.component';
import { DashboardComponent } from './dashboard/dashboard.component';

/** Home and Dashboard Routes */
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

/**
 * Home Routing Module
 *
 * Configures the home and dashboard routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: []
})
export class HomeRoutingModule { }
