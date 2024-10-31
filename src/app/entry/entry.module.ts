/** Angular Imports */
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { EntryRoutingModule } from './entry-routing.module';
import { PipesModule } from '../pipes/pipes.module';

/** Custom Components */
import { EntryComponent } from './entry.component';
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
    EntryRoutingModule,
    TranslateModule,
  ],
  declarations: [
    EntryComponent
  ],
  providers: [ ]
})
export class EntryModule { }
