/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

@Component({
  selector: 'mifosx-codes',
  templateUrl: './codes.component.html',
  styleUrls: ['./codes.component.scss']
})
export class CodesComponent implements OnInit, AfterViewInit {

  /** Codes data. */
  codesData: any;
  /** Columns to be displayed in codes table. */
  displayedColumns: string[] = ['name', 'systemDefined'];
  /** Data source for codes table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for codes table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for codes table. */
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('buttonCreateCode') buttonCreateCode: ElementRef<any>;
  @ViewChild('templateButtonCreateCode') templateButtonCreateCode: TemplateRef<any>;
  @ViewChild('tableCodes') tableCodes: ElementRef<any>;
  @ViewChild('templateTableCodes') templateTableCodes: TemplateRef<any>;

  /**
   * Retrieves the codes data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe(( data: { codes: any }) => {
      this.codesData = data.codes;
    });
  }

  /**
   * Sets the codes table.
   */
  ngOnInit() {
    this.setCodes();
  }

  /**
   * Initializes the data source, paginator and sorter for codes table.
   */
  setCodes() {
    this.dataSource = new MatTableDataSource(this.codesData);
    console.log(this.codesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in codes table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showSystemCodesPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonCreateCode, this.buttonCreateCode.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showSystemCodesList === true) {
      setTimeout(() => {
        this.showPopover(this.templateTableCodes, this.tableCodes.nativeElement, 'top', true);
      });
    }
  }

  nextStep() {
    this.configurationWizardService.showSystemCodesPage = false;
    this.configurationWizardService.showSystemCodesList = false;
    this.configurationWizardService.showSystemCodesForm = true;
    this.router.navigate(['/system/codes/create']);
  }

  previousStep() {
    this.configurationWizardService.showSystemCodesPage = false;
    this.configurationWizardService.showSystemCodesList = false;
    this.configurationWizardService.showSystemCodes = true;
    this.router.navigate(['/system']);
  }

}
