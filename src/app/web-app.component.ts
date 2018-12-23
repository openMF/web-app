/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MatSnackBar } from '@angular/material';

/** rxjs Imports */
import { merge } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

/** Translation Imports */
import { TranslateService } from '@ngx-translate/core';

/** Environment Configuration */
import { environment } from 'environments/environment';

/** Custom Services */
import { Logger } from './core/logger/logger.service';
import { I18nService } from './core/i18n/i18n.service';
import { ThemeStorageService } from './shared/theme-picker/theme-storage.service';
import { AlertService } from './core/alert/alert.service';
import { KeyboardShortcutsService } from './help/keyboard-shortcuts/keyboard-shortcuts.service';
import { AuthenticationService } from './core/authentication/authentication.service';
import { SearchService } from './shared/search/search.service';

/** Custom Models */
import { Alert } from './core/alert/alert.model';

/** Initialize Logger */
const log = new Logger('MifosX');

/**
 * Main web app component.
 */
@Component({
  selector: 'mifosx-web-app',
  templateUrl: './web-app.component.html',
  styleUrls: ['./web-app.component.scss']
})
export class WebAppComponent implements OnInit {

  /**
   * @param {Router} router Router for navigation.
   * @param {ActivatedRoute} activatedRoute Activated Route.
   * @param {Title} titleService Title Service.
   * @param {TranslateService} translateService Translate Service.
   * @param {I18nService} i18nService I18n Service.
   * @param {ThemeStorageService} themeStorageService Theme Storage Service.
   * @param {MatSnackBar} snackBar Material Snackbar for notifications.
   * @param {AlertService} alertService Alert Service.
   * @param {KeyboardShortcutsService} keyboardShortcuts Keyboard Shortcuts Service.
   * @param {AuthenticationService} authenticationService Authentication service.
   * @param {SearchService} searchService Search service to manage search input visibility.
   */
  constructor(private router: Router,
              private activatedRoute: ActivatedRoute,
              private titleService: Title,
              private translateService: TranslateService,
              private i18nService: I18nService,
              private themeStorageService: ThemeStorageService,
              public snackBar: MatSnackBar,
              private alertService: AlertService,
              private keyboardShortcuts: KeyboardShortcutsService,
              private authenticationService: AuthenticationService,
              private searchService: SearchService) { }

  /** Keyboard shortcuts listener */
  keyboardShortcutsListener: any = undefined;

  /**
   * Initial Setup:
   *
   * 1) Logger
   *
   * 2) Language and Translations
   *
   * 3) Page Title
   *
   * 4) Theme
   *
   * 5) Alerts
   *
   * 6) Keyboard Shortcuts
   */
  ngOnInit() {
    // Setup logger
    if (environment.production) {
      Logger.enableProductionMode();
    }
    log.debug('init');

    // Setup translations
    this.i18nService.init(environment.defaultLanguage, environment.supportedLanguages);

    // Change page title on navigation or language change, based on route data
    const onNavigationEnd = this.router.events.pipe(filter(event => event instanceof NavigationEnd));
    merge(this.translateService.onLangChange, onNavigationEnd)
      .pipe(
        map(() => {
          let route = this.activatedRoute;
          while (route.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        filter(route => route.outlet === 'primary'),
        mergeMap(route => route.data)
      )
      .subscribe(event => {
        const title = event['title'];
        if (title) {
          this.titleService.setTitle(`${this.translateService.instant(title)} | Mifos X`);
        }
      });

    // Setup theme
    const theme = this.themeStorageService.getTheme();
    if (theme) {
      this.themeStorageService.installTheme(theme);
    }

    // Setup alerts
    this.alertService.alertEvent.subscribe((alertEvent: Alert) => {
      this.snackBar.open(`${alertEvent.message}`, 'Close', {
        duration: 2000,
        horizontalPosition: 'right',
        verticalPosition: 'top'
      });
    });

    // Keyboard Shortcuts Listener
    this.keyboardShortcutsListener = this.keyboardShortcuts.listen(
      {
        // Open Navigation Page
        'Alt.Shift.n': (event: KeyboardEvent): void => {
          this.router.navigate(['navigation']);
          event.preventDefault();
        },
        // Open Checker Inbox & Pending Tasks
        'Alt.i': (event: KeyboardEvent): void => {
          // TODO: Update once the route is created
          event.preventDefault();
        },
        // Open Collection Sheet
        'Control.Shift.o': (event: KeyboardEvent): void => {
          // TODO: Update once the route is created
          event.preventDefault();
        },
        // Create Client
        'Control.Shift.c': (event: KeyboardEvent): void => {
          // TODO: Update once the route is created
          event.preventDefault();
        },
        // Create Group
        'Control.Shift.g': (event: KeyboardEvent): void => {
          // TODO: Update once the route is created
          event.preventDefault();
        },
        // Create Center
        'Alt.q': (event: KeyboardEvent): void => {
          // TODO: Update once the route is created
          event.preventDefault();
        },
        // Open Frequent Postings
        'Control.Shift.f': (event: KeyboardEvent): void => {
          this.router.navigate(['accounting/journal-entries/frequent-postings']);
          event.preventDefault();
        },
        // Open Closure Entries
        'Control.Shift.e': (event: KeyboardEvent): void => {
          this.router.navigate(['accounting/closing-entries']);
          event.preventDefault();
        },
        // Open Journal Entries
        'Control.Shift.j': (event: KeyboardEvent): void => {
          this.router.navigate(['accounting/journal-entries/create']);
          event.preventDefault();
        },
        // Open Reports
        'Control.Shift.r': (event: KeyboardEvent): void => {
          // TODO: Update once the route is created
          event.preventDefault();
        },
        // Open Accounting page
        'Control.Shift.a': (event: KeyboardEvent): void => {
          this.router.navigate(['accounting']);
          event.preventDefault();
        },
        // Save/Submit Forms
        'Control.s': (event: KeyboardEvent): void => {
          // TODO: Update once the save implementation is done
          event.preventDefault();
        },
        // Run Report
        'Control.r': (event: KeyboardEvent): void => {
          // TODO: Update once the run implementation is done
          event.preventDefault();
        },
        // Cancel
        'Control.Shift.x': (event: KeyboardEvent): void => {
          // TODO: Update once the cancel implementation is done
          event.preventDefault();
        },
        // Logout
        'Control.Shift.l': (event: KeyboardEvent): void => {
          this.authenticationService.logout()
            .subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
          event.preventDefault();
        },
        // Help
        'Control.Shift.h': (event: KeyboardEvent): void => {
          // TODO: Implement the routing to mifos wiki based on the current page
          event.preventDefault();
        },
        // Pagination: Next
        'Alt.n': (event: KeyboardEvent): void => {
          // TODO: Update once the shortcut is implemented in paginator
          event.preventDefault();
        },
        // Pagination: Previous
        'Alt.p': (event: KeyboardEvent): void => {
          // TODO: Update once the shortcut is implemented in paginator
          event.preventDefault();
        },
        // Search
        'Alt.x': (event: KeyboardEvent): void => {
          this.searchService.toggleSearchVisibility();
          // TODO: Add focus to the seachbar
          event.preventDefault();
        }
      }
    );
  }
}
