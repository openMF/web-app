/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Custom Components */
import { HomeComponent } from './home.component';

/** Custom Resolvers */
import { OfficesResolver } from '../accounting/common-resolvers/offices.resolver';

/** Home Routes */
// Dashboard Routes commented out
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
      data: { title: 'Home' },
      resolve: {
        offices: OfficesResolver
      }
    }
  ])

];

/**
 * Home Routing Module
 *
 * Configures the home routes.
 */
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [OfficesResolver]
})
export class HomeRoutingModule {}
