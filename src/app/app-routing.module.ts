import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Fallback when no prior route is matched
const routes: Routes = [
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
