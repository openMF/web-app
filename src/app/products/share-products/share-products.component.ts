/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-share-products',
  templateUrl: './share-products.component.html',
  styleUrls: ['./share-products.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class ShareProductsComponent implements OnInit, AfterViewInit {
  shareProductsData: any;
  displayedColumns: string[] = [
    'name',
    'shortName',
    'totalShares'
  ];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of create share product button */
  @ViewChild('buttonCreateShareProduct') buttonCreateShareProduct: ElementRef<any>;
  /* Template for popover on create share product button */
  @ViewChild('templateButtonCreateShareProduct') templateButtonCreateShareProduct: TemplateRef<any>;
  /* Reference of share products table */
  @ViewChild('shareProductsTable') shareProductsTable: ElementRef<any>;
  /* Template for popover on share products table */
  @ViewChild('templateShareProductsTable') templateShareProductsTable: TemplateRef<any>;

  /**
   * @param {ActivatedRoute} route ActivatedRoute.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService
  ) {
    this.route.data.subscribe((data: { shareProducts: any }) => {
      this.shareProductsData = data.shareProducts.pageItems;
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.shareProductsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showShareProductsPage === true) {
      setTimeout(() => {
        this.showPopover(
          this.templateButtonCreateShareProduct,
          this.buttonCreateShareProduct.nativeElement,
          'bottom',
          true
        );
      });
    }

    if (this.configurationWizardService.showShareProductsList === true) {
      setTimeout(() => {
        this.showPopover(this.templateShareProductsTable, this.shareProductsTable.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * Next Step (Fixed Deposit Products - Products Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showShareProductsPage = false;
    this.configurationWizardService.showShareProductsList = false;
    this.configurationWizardService.showFixedDepositProducts = true;
    this.router.navigate(['/products']);
  }

  /**
   * Previous Step (Share Products - Products Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showShareProductsPage = false;
    this.configurationWizardService.showShareProductsList = false;
    this.configurationWizardService.showShareProducts = true;
    this.router.navigate(['/products']);
  }
}
