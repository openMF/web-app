import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { LayoutModule } from '@angular/cdk/layout';
import { FlexLayoutModule } from '@angular/flex-layout';

import {  MatToolbarModule,
          MatButtonModule,
          MatSidenavModule,
          MatIconModule,
          MatListModule,
          MatGridListModule,
          MatCardModule,
          MatMenuModule,
          MatCheckboxModule,
          MatTooltipModule,
          MatDividerModule,
          MatSelectModule,
          MatInputModule,
          MatFormFieldModule,
          MatTabsModule } from '@angular/material';

import { TranslateModule } from '@ngx-translate/core';

import { RouteReusableStrategy } from './route-reusable-strategy';
import { AuthenticationService } from './authentication/authentication.service';
import { AuthenticationGuard } from './authentication/authentication.guard';
import { I18nService } from './i18n.service';
import { HttpService } from './http/http.service';
import { HttpCacheService } from './http/http-cache.service';
import { ApiPrefixInterceptor } from './http/api-prefix.interceptor';
import { ErrorHandlerInterceptor } from './http/error-handler.interceptor';
import { CacheInterceptor } from './http/cache.interceptor';

import { ShellComponent } from './shell/shell.component';
import { SidenavComponent } from './shell/sidenav/sidenav.component';
import { ToolbarComponent } from './shell/toolbar/toolbar.component';
import { ContentComponent } from './shell/content/content.component';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    TranslateModule,
    RouterModule,
    LayoutModule,
    FlexLayoutModule,
    MatSidenavModule,
    MatGridListModule,
    MatToolbarModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatDividerModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule
  ],
  declarations: [
    ShellComponent,
    SidenavComponent,
    ToolbarComponent,
    ContentComponent
  ],
  exports: [
  ],
  providers: [
    AuthenticationService,
    AuthenticationGuard,
    I18nService,
    HttpCacheService,
    ApiPrefixInterceptor,
    ErrorHandlerInterceptor,
    CacheInterceptor,
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
