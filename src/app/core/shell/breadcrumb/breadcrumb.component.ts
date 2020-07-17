/** Angular Imports */
import { Component, OnInit , TemplateRef, ElementRef , ViewChild,
         AfterViewInit} from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

/** rxjs Imports */
import { filter } from 'rxjs/operators';

/** Custom Model */
import { Breadcrumb } from './breadcrumb.model';

/** Custom Services */
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

/**
 * Route data property to generate breadcrumb using a static string.
 *
 * Example- breadcrumb: 'Home'
 */
const routeDataBreadcrumb = 'breadcrumb';
/**
 * Route data property to generate breadcrumb using given route parameter name.
 *
 * Example- routeParamBreadcrumb: 'id'
 */
const routeParamBreadcrumb = 'routeParamBreadcrumb';
/**
 * Route data property to generate breadcrumb using resolved data property name.
 *
 * Use array to specify name for a nested object property.
 *
 * Example- routeResolveBreadcrumb: ['user', 'username']
 */
const routeResolveBreadcrumb = 'routeResolveBreadcrumb';
/**
 * Route data property to specify whether generated breadcrumb should have a link.
 *
 * True by default. Specify false if a link is not required.
 *
 * Example- addBreadcrumbLink: false
 */
const routeAddBreadcrumbLink = 'addBreadcrumbLink';

/**
 * Generate breadcrumbs dynamically via route configuration.
 */
@Component({
  selector: 'mifosx-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit, AfterViewInit {

  /** Array of breadcrumbs. */
  breadcrumbs: Breadcrumb[];
  /* Reference of breadcrumb */
  @ViewChild('breadcrumb') breadcrumb: ElementRef<any>;
  /* Template for popover on breadcrumb */
  @ViewChild('templateBreadcrumb') templateBreadcrumb: TemplateRef<any>;

  /**
   * Generates the breadcrumbs.
   * @param {ActivatedRoute} activatedRoute Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private activatedRoute: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.generateBreadcrumbs();
  }

  ngOnInit() {
  }

  /**
   * Generates the array of breadcrumbs for the visited route.
   */
  generateBreadcrumbs() {
    const onNavigationEnd = this.router.events.pipe(filter(event => event instanceof NavigationEnd));

    onNavigationEnd.subscribe(() => {
      this.breadcrumbs = [];
      let currentRoute = this.activatedRoute.root;
      let currentUrl = '';

      while (currentRoute.children.length > 0) {
        const childrenRoutes = currentRoute.children;
        let breadcrumbLabel: any;
        let url: any;

        childrenRoutes.forEach(route => {
          currentRoute = route;
          breadcrumbLabel = false;

          if (route.outlet !== 'primary') {
            return;
          }

          const routeURL = route.snapshot.url.map(segment => segment.path).join('/');
          currentUrl += `/${routeURL}`;

          if (currentUrl === '/') {
            breadcrumbLabel = 'Home';
          }

          const hasData = (route.routeConfig && route.routeConfig.data);

          if (hasData) {
            if (route.snapshot.data.hasOwnProperty(routeResolveBreadcrumb) && route.snapshot.data[routeResolveBreadcrumb]) {
              breadcrumbLabel = route.snapshot.data;
              route.snapshot.data[routeResolveBreadcrumb].forEach((property: any) => {
                breadcrumbLabel = breadcrumbLabel[property];
              });
            } else if (route.snapshot.data.hasOwnProperty(routeParamBreadcrumb) && route.snapshot.paramMap.get(route.snapshot.data[routeParamBreadcrumb])) {
              breadcrumbLabel = route.snapshot.paramMap.get(route.snapshot.data[routeParamBreadcrumb]);
            } else if (route.snapshot.data.hasOwnProperty(routeDataBreadcrumb)) {
              breadcrumbLabel = route.snapshot.data[routeDataBreadcrumb];
            }

            if (route.snapshot.data.hasOwnProperty(routeAddBreadcrumbLink)) {
              url = route.snapshot.data[routeAddBreadcrumbLink];
            } else {
              url = currentUrl;
            }
          }

          const breadcrumb: Breadcrumb = {
            label: breadcrumbLabel,
            url: url
          };

          if (breadcrumbLabel) {
            this.breadcrumbs.push(breadcrumb);
          }
        });
      }
    });
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showBreadcrumbs === true) {
    setTimeout(() => {
        this.showPopover(this.templateBreadcrumb, this.breadcrumb.nativeElement, 'bottom', true);
      });
    }
  }

  /**
   * Next Step (Home) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showBreadcrumbs = false;
    this.configurationWizardService.showHome = true;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/home']);
  }

  /**
   * Previous Step (SideNavBar) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showBreadcrumbs = false;
    this.configurationWizardService.showSideNavChartofAccounts = true;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['/home']);
  }

}
