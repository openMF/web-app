import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';

import { SharedModule } from '../shared';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { QuoteService } from './quote.service';
import { DashboardComponent } from './dashboard/dashboard.component';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    NgxChartsModule,
    SharedModule,
    HomeRoutingModule
  ],
  declarations: [
    HomeComponent,
    DashboardComponent
  ],
  providers: [
    QuoteService
  ]
})
export class HomeModule { }
