/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

/* Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

@Component({
  selector: 'mifosx-saving-products',
  templateUrl: './saving-products.component.html',
  styleUrls: ['./saving-products.component.scss']
})
export class SavingProductsComponent implements OnInit, AfterViewInit {

  savingProductsData: any;
  displayedColumns: string[] = ['name', 'shortName'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('buttonSavingProduct') buttonSavingProduct: ElementRef<any>;
  @ViewChild('templateButtonSavingProduct') templateButtonSavingProduct: TemplateRef<any>;
  @ViewChild('savingProductTable') savingProductTable: ElementRef<any>;
  @ViewChild('templateSavingProductTable') templateSavingProductTable: TemplateRef<any>;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe((data: { savingProducts: any }) => {
      this.savingProductsData = data.savingProducts;
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.savingProductsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showSavingsProductsPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonSavingProduct, this.buttonSavingProduct.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showSavingsProductsList === true) {
      setTimeout(() => {
        this.showPopover(this.templateSavingProductTable, this.savingProductTable.nativeElement, 'top', true);
      });
    }
  }

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  nextStep() {
    this.configurationWizardService.showSavingsProductsPage = false;
    this.configurationWizardService.showSavingsProductsList = false;
    this.configurationWizardService.showShareProducts = true;
    this.router.navigate(['/products']);
  }

  previousStep() {
    this.configurationWizardService.showSavingsProductsPage = false;
    this.configurationWizardService.showSavingsProductsList = false;
    this.configurationWizardService.showSavingsProducts = true;
    this.router.navigate(['/products']);
  }
}
