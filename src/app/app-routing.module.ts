/** Angular Imports */
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Not Found Component
import { NotFoundComponent } from './not-found/not-found.component';
// import { TranslateModule } from '@ngx-translate/core';

/**
 * Fallback to this route when no prior route is matched.
 */
const routes: Routes = [
  {
    path: '**',
    component: NotFoundComponent
  }
];

/**
 * App Routing Module.
 *
 * Configures the fallback route.
 */
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: true }),
    // TranslateModule
  ],
  exports: [
    RouterModule,
    // TranslateModule
  ],
  providers: []
})
export class AppRoutingModule { }
