/** Angular Imports */
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';

/** Custom Services */
import { ReportsService } from '../reports.service';

/**
 * XBRL Component
 */
@Component({
  selector: 'mifosx-xbrl',
  templateUrl: './xbrl.component.html',
  styleUrls: ['./xbrl.component.scss']
})
export class XBRLComponent implements OnInit, AfterViewInit {

  /** Mix Taxonomy Array */
  mixtaxonomyArray: any = [];
  /** Mix Mappings */
  mixMappingJson: any;
  /** GL Accounts data */
  glAccounts: any;
  /** Filtered GL Accounts */
  filteredGlAccounts: any;
  /** Columns to be displayed in reports table. */
  displayedColumns: string[] = ['info', 'name', 'dimension', 'mapping'];
  /** Data source for reports table. */
  dataSource = new MatTableDataSource();
  /** XBRL save status */
  XBRLSuccess = false;

  /**
   * Retrieves data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * Prevents reuse of Route Params while navigating.
   * @param {Router} router: Route.
   * @param {ReportService} reportService ReportService
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private reportService: ReportsService) {
    this.route.data.subscribe(( data: { mixtaxonomy: any, mixmapping: any, glAccounts: any }) => {
      this.mixtaxonomyArray = data.mixtaxonomy;
      this.mixMappingJson = data.mixmapping.config || JSON.stringify({});
      this.glAccounts = data.glAccounts;
    });
  }

  /**
   * Creates Mappings, sets the dataSource and datasource filterPredicate.
   */
  ngOnInit() {
    if (localStorage.getItem('XbrlReportSaveSuccess')) {
      localStorage.removeItem('XbrlReportSaveSuccess');
      this.XBRLSuccess = true;
      setTimeout(() => { this.XBRLSuccess = false; }, 3000);
    }
    this.createMappings();
    this.dataSource = new MatTableDataSource(this.mixtaxonomyArray);
    this.setDatasourceFilter();
  }

 /**
  * Subscribe to taxonomy's value changes and filters options accordingly.
  */
  ngAfterViewInit() {
    this.mixtaxonomyArray.forEach((taxonomy: any) => {
      taxonomy.mapping?.valueChanges.subscribe( (value: string) => {
        this.filteredGlAccounts = this.applyFilter(value);
      });
    });
  }

  /**
   * Maps Taxonomy to it's value and add's formcontrol.
   */
  createMappings() {
    this.mixtaxonomyArray.forEach((taxonomy: any) => {
      const mapping = JSON.parse(this.mixMappingJson)[taxonomy.id];
        taxonomy.mapping = new FormControl('');
        taxonomy.mapping.value = mapping || '';
    });
  }

  /**
   * Sets custom datasource filter.
   */
  setDatasourceFilter() {
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      return data.type.toString() === filter;
    };
    this.dataSource.filter = '0'; // defaults to 'Portfolio'
  }

  /**
   * Filter for GL Account AutoComplete.
   * @param {string} value Filter Value.
   */
  applyFilter(value: string) {
    const filterValue = value.toLowerCase();
    return this.glAccounts.filter(
      (entry: any) => entry.name.toLowerCase().includes(filterValue) || entry.glCode.includes(filterValue)
    );
  }

  /**
   * Filters Taxonomies by index.
   * @param {number} index number representing type of taxonomy.
   */
  filterTaxonomiesBy(index: number) {
    this.dataSource.filter = index.toString();
  }

  /**
   * Displays gl account name in form control input.
   * @param {any} glAccount Gl Account data.
   * @returns {string} Gl Account name if valid otherwise undefined.
   */
  displayGLAccount(glAccount?: any): string | undefined {
    if (typeof(glAccount) === 'object') {
     return glAccount ? glAccount.name + ' (' + glAccount.glCode + ')' : undefined;
    } else {
      return glAccount;
    }
  }

  /**
   * Reloads the component post saving changes.
   */
  reloadComponent() {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate(['./xbrl']);
  }

  /**
   * Posts Taxonomy Data onto the API.
   */
  submit() {
    const config: any = {};
    const serialObject: any = {};
    this.mixtaxonomyArray.forEach( (taxonomy: any) => {
      config[taxonomy.id] = taxonomy.mapping.value;
    });
    serialObject['config'] = JSON.stringify(config);
    serialObject['identifier'] = 'default;';
    this.reportService.editMixMappings(serialObject).subscribe((response: any) => {
      localStorage.setItem('XbrlReportSaveSuccess', 'true');
      this.reloadComponent();
    });
  }

}
