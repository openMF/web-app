/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

/** Routing Imports */
import { Route } from '../core/route/route.service';

/** Translation Imports */
import { extract } from '../core/i18n/i18n.service';

/** Custom Components */
import { SearchPageComponent } from './search-page/search-page.component';

/** Custom Resolvers */
import { SearchResolver } from './search.resolver';

/** Search Routes */
const routes: Routes = [
  Route.withShell([
    {
      path: 'search',
      component: SearchPageComponent,
      data: { title: extract('Search'), breadcrumb: 'Search' },
      runGuardsAndResolvers: 'paramsOrQueryParamsChange',
      resolve: {
        searchResults: SearchResolver
      }
    }
  ])
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  providers: [SearchResolver],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
