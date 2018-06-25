import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { filter } from 'rxjs/operators';

import { Breadcrumb } from './breadcrumb.model';

@Component({
  selector: 'mifosx-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {

  breadcrumbs: Breadcrumb[];

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router) {
    this.generateBreadcrumbs();
  }

  generateBreadcrumbs() {
    const routeDataBreadcrumb = 'breadcrumb';
    const routeParamBreadcrumb = 'routeParamBreadcrumb';
    const onNavigationEnd = this.router.events.pipe(filter(event => event instanceof NavigationEnd));

    onNavigationEnd.subscribe(() => {
      this.breadcrumbs = [];
      let currentRoute = this.activatedRoute.root;
      let url = '';

      while (currentRoute.children.length > 0) {
        const childrenRoutes = currentRoute.children;
        let breadcrumbLabel = 'Home';

        childrenRoutes.forEach(route => {
          currentRoute = route;
          if (route.outlet !== 'primary') {
            return;
          }
          const hasData = (route.routeConfig && route.routeConfig.data);
          if (hasData) {
            if (route.snapshot.data.hasOwnProperty(routeParamBreadcrumb)) {
              breadcrumbLabel = route.snapshot.params[route.snapshot.data[routeParamBreadcrumb]];
            } else if (route.snapshot.data.hasOwnProperty(routeDataBreadcrumb)) {
              breadcrumbLabel = route.snapshot.data[routeDataBreadcrumb];
            }
          }

          const routeURL = route.snapshot.url.map(segment => segment.path).join('/');
          url += `/${routeURL}`;

          const breadcrumb: Breadcrumb = {
            label: breadcrumbLabel,
            url: url
          };

          if (breadcrumb.url !== '//home') {
            this.breadcrumbs.push(breadcrumb);
          }
        });
      }
    });
  }

  ngOnInit() {
  }

}
