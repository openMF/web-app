import { Component, OnInit, HostListener, HostBinding } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

/** rxjs Imports */
import { merge, of } from 'rxjs';
import { filter, map, switchMap, catchError } from 'rxjs/operators';

/** Translation Imports */
import { TranslateService } from '@ngx-translate/core';

/** Environment Configuration */
import { environment } from 'environments/environment';

/** Custom Services */
import { Logger } from './core/logger/logger.service';
import { ThemeStorageService } from './shared/theme-picker/theme-storage.service';
import { AlertService } from './core/alert/alert.service';
import { AuthenticationService } from './core/authentication/authentication.service';
import { SettingsService } from './settings/settings.service';
import { IdleTimeoutService } from './home/timeout-dialog/idle-timeout.service';
import { SessionTimeoutDialogComponent } from './home/timeout-dialog/session-timeout-dialog.component';

/** Custom Items */
import { Alert } from './core/alert/alert.model';
import { KeyboardShortcutsConfiguration } from './keyboards-shortcut-config';
import { Dates } from './core/utils/dates';
import { animate, style, transition, trigger } from '@angular/animations';
import { I18nService } from './core/i18n/i18n.service';
import { ThemingService } from './shared/theme-toggle/theming.service';

/** Initialize Logger */
const log = new Logger('MifosX');

@Component({
  selector: 'mifosx-web-app',
  templateUrl: './web-app.component.html',
  styleUrls: ['./web-app.component.scss'],
  animations: [
    trigger('opacityScale', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(.95)' }),
        animate('100ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        style({ opacity: 1, transform: 'scale(1)' }),
        animate('75ms ease-in', style({ opacity: 0, transform: 'scale(.95)' })),
      ]),
    ]),
  ],
})
export class WebAppComponent implements OnInit {
  buttonConfig: KeyboardShortcutsConfiguration;
  i18nService: I18nService;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translateService: TranslateService,
    private themeStorageService: ThemeStorageService,
    public snackBar: MatSnackBar,
    private alertService: AlertService,
    private settingsService: SettingsService,
    private authenticationService: AuthenticationService,
    private themingService: ThemingService,
    private dateUtils: Dates,
    private idle: IdleTimeoutService,
    private dialog: MatDialog
  ) {}

  @HostBinding('class') public cssClass: string;

  ngOnInit() {
    this.themingService.theme.subscribe((value: string) => {
      this.cssClass = value;
    });
    this.themingService.setInitialDarkMode();
    this.themingService.setDarkMode(this.settingsService.themeDarkEnabled === 'true');

    if (environment.production) {
      Logger.enableProductionMode();
    }
    log.debug('init');

    this.translateService.addLangs(environment.supportedLanguages.split(','));
    this.translateService.use(this.settingsService.languageCode || environment.defaultLanguage);

    this.i18nService = new I18nService(this.translateService);

    this.router.events
  .pipe(
    filter((event) => event instanceof NavigationEnd),
    map(() => {
      let route = this.activatedRoute;
      while (route.firstChild) {
        route = route.firstChild;
      }
      return route;
    }),
    switchMap((route) => route.data.pipe(catchError(() => of({ title: 'APP_NAME' })))),
    switchMap((data) => {
      const rawTitle = data['title'] || 'APP_NAME';
      return this.translateService.get(`labels.titles.${rawTitle}`);
    })
  )
  .subscribe((translatedTitle) => {
    this.titleService.setTitle(translatedTitle);  
  });


    this.alertService.alertEvent.subscribe((alertEvent: Alert) => {
      this.snackBar.open(`${alertEvent.message}`, 'Close', {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    });

    this.buttonConfig = new KeyboardShortcutsConfiguration();

    if (environment.session.timeout.idleTimeout > 0) {
      this.idle.$onSessionTimeout.subscribe(() => {
        if (this.authenticationService.getUserLoggedIn()) {
          this.alertService.alert({
            type: 'Session timeout',
            message: this.translateService.instant('labels.text.Session timed out'),
          });
          this.dialog.open(SessionTimeoutDialogComponent);
          this.logout();
        }
      });
    }
  }

  logout() {
    this.authenticationService.logout().subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  help() {
    window.open('https://mifosforge.jira.com/wiki/spaces/docs/pages/52035622/User+Manual', '_blank');
  }

  @HostListener('window:keydown', ['$event'])
  onKeydownHandler(event: KeyboardEvent) {
    const routeD = this.buttonConfig.buttonCombinations.find(
      (x) =>
        x.ctrlKey === event.ctrlKey && x.shiftKey === event.shiftKey && x.altKey === event.altKey && x.key === event.key
    );
    if (routeD) {
      switch (routeD.id) {
        case 'logout':
          this.logout();
          break;
        case 'help':
          this.help();
          break;
        case 'runReport':
          document.getElementById('runReport')?.click();
          break;
        case 'cancel':
          const cancelButtons = Array.from(document.querySelectorAll('button')).filter((el) => el.textContent?.trim() === 'Cancel');
          cancelButtons[0]?.click();
          break;
        case 'submit':
          const submitButtons = Array.from(document.querySelectorAll('button')).filter((el) => el.textContent?.trim() === 'Submit');
          submitButtons[0]?.click();
          break;
        default:
          this.router.navigate([routeD.route], { relativeTo: this.activatedRoute });
      }
    }
  }
}
