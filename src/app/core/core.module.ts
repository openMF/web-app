import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy, RouterModule } from '@angular/router';

// To be removed, replace by shared material module
import { LayoutModule } from '@angular/cdk/layout';
import { FlexLayoutModule } from '@angular/flex-layout';

import {  MatCheckboxModule,
          MatButtonModule,
          MatInputModule,
          MatAutocompleteModule,
          MatDatepickerModule,
          MatFormFieldModule,
          MatRadioModule,
          MatSelectModule,
          MatSliderModule,
          MatSlideToggleModule,
          MatMenuModule,
          MatSidenavModule,
          MatToolbarModule,
          MatListModule,
          MatGridListModule,
          MatCardModule,
          MatStepperModule,
          MatTabsModule,
          MatExpansionModule,
          MatButtonToggleModule,
          MatChipsModule,
          MatIconModule,
          MatProgressSpinnerModule,
          MatProgressBarModule,
          MatDialogModule,
          MatTooltipModule,
          MatSnackBarModule,
          MatTableModule,
          MatTreeModule,
          MatSortModule,
          MatPaginatorModule,
          MatDividerModule,
          MatNativeDateModule} from '@angular/material';

import { TranslateModule } from '@ngx-translate/core';

import { RouteReusableStrategy } from './route-reusable-strategy';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationGuard } from './authentication/authentication.guard';
import { I18nService } from './i18n.service';
import { HttpService } from './http/http.service';
import { HttpCacheService } from './http/http-cache.service';
import { ProgressBarService } from './progress-bar.service';
import { ProgressInterceptor } from './progress.interceptor';
import { ApiPrefixInterceptor } from './http/api-prefix.interceptor';
import { ErrorHandlerInterceptor } from './http/error-handler.interceptor';
import { CacheInterceptor } from './http/cache.interceptor';

import { ShellComponent } from './shell/shell.component';
import { SidenavComponent } from './shell/sidenav/sidenav.component';
import { ThemePickerComponent } from './shell/toolbar/theme-picker/theme-picker.component';
import { ToolbarComponent } from './shell/toolbar/toolbar.component';
import { ContentComponent } from './shell/content/content.component';
import { BreadcrumbComponent } from './shell/breadcrumb/breadcrumb.component';
import { AuthenticationInterceptor } from './authentication/authentication.interceptor';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    TranslateModule,
    RouterModule,
    LayoutModule,
    FlexLayoutModule,
    MatCheckboxModule,
    MatCheckboxModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTableModule,
    MatTreeModule,
    MatSortModule,
    MatPaginatorModule,
    MatDividerModule
  ],
  declarations: [
    ShellComponent,
    SidenavComponent,
    ThemePickerComponent,
    ToolbarComponent,
    ContentComponent,
    BreadcrumbComponent
  ],
  exports: [
    LayoutModule,
    FlexLayoutModule,
    MatCheckboxModule,
    MatCheckboxModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTableModule,
    MatTreeModule,
    MatSortModule,
    MatPaginatorModule,
    MatDividerModule,
    ThemePickerComponent
  ],
  providers: [
    AuthenticationService,
    AuthenticationGuard,
    I18nService,
    HttpCacheService,
    ProgressBarService,
    ProgressInterceptor,
    ApiPrefixInterceptor,
    ErrorHandlerInterceptor,
    CacheInterceptor,
    AuthenticationInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ProgressInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true
    },
    {
      provide: HttpClient,
      useClass: HttpService
    },
    {
      provide: RouteReuseStrategy,
      useClass: RouteReusableStrategy
    }
  ]
})
export class CoreModule {

  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    // Import guard
    if (parentModule) {
      throw new Error(`${parentModule} has already been loaded. Import Core module in the AppModule only.`);
    }
  }

}
