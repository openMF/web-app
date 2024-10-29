/** Angular Imports */
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { HomeRoutingModule } from './currency-routing.module';
import { PipesModule } from '../pipes/pipes.module';

/** Custom Components */
import { CurrencyComponent } from './currency.component';
import { TranslateModule } from '@ngx-translate/core';

/**
 * Home Component
 *
 * Home and dashboard components should be declared here.
 */
@NgModule({
  imports: [
    MatDialogModule,
    SharedModule,
    PipesModule,
    HomeRoutingModule,
    TranslateModule,
  ],
  declarations: [
    CurrencyComponent
  ],
  providers: [ ]
})
export class CurrencyModule { }
