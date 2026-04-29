/** Angular Imports */
import { NgModule, Optional, SkipSelf, Injector } from '@angular/core';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  HttpHandler,
  provideHttpClient,
  withInterceptorsFromDi
} from '@angular/common/http';
import { RouteReuseStrategy, RouterModule } from '@angular/router';

/** Translation Imports */
import { TranslateModule } from '@ngx-translate/core';

/** Custom Services */
import { AuthenticationService } from './authentication/authentication.service';
import { HttpService, HTTP_DYNAMIC_INTERCEPTORS } from './http/http.service';
import { HttpCacheService } from './http/http-cache.service';
import { ProgressBarService } from './progress-bar/progress-bar.service';

/** Custom Guards */
import { AuthenticationGuard } from './authentication/authentication.guard';

/** Custom Interceptors */
import { ProgressInterceptor } from './progress-bar/progress.interceptor';
import { ApiPrefixInterceptor } from './http/api-prefix.interceptor';
import { ErrorHandlerInterceptor } from './http/error-handler.interceptor';
import { CacheInterceptor } from './http/cache.interceptor';
import { AuthenticationInterceptor } from './authentication/authentication.interceptor';

/** Custom Strategies */
import { RouteReusableStrategy } from './route/route-reusable-strategy';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';

/** Custom Components */
import { ShellComponent } from './shell/shell.component';
import { SidenavComponent } from './shell/sidenav/sidenav.component';
import { ToolbarComponent } from './shell/toolbar/toolbar.component';
import { BreadcrumbComponent } from './shell/breadcrumb/breadcrumb.component';
import { ContentComponent } from './shell/content/content.component';

/**
 * Core Module
 *
 * Main app shell components and singleton services should be here.
 */
@NgModule({
  exports: [
    SharedModule // TO BE REMOVED: Once all components have replaced the core module import by shared module.

  ],
  imports: [
    SharedModule,
    TranslateModule,
    RouterModule,
    ShellComponent,
    SidenavComponent,
    ToolbarComponent,
    BreadcrumbComponent,
    ContentComponent
  ],
  providers: [
    AuthenticationService,
    AuthenticationGuard,
    AuthenticationInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthenticationInterceptor,
      multi: true
    },
    HttpCacheService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiPrefixInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorHandlerInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CacheInterceptor,
      multi: true
    },
    {
      provide: HttpClient,
      useClass: HttpService,
      deps: [
        HttpHandler,
        Injector,
        [
          new Optional(),
          HTTP_DYNAMIC_INTERCEPTORS
        ]
      ]
    },
    ProgressBarService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ProgressInterceptor,
      multi: true
    },
    {
      provide: RouteReuseStrategy,
      useClass: RouteReusableStrategy
    },
    provideHttpClient(withInterceptorsFromDi())
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
