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

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { OfficeNode } from './office-node.model';
import { NestedTreeControl } from '@angular/cdk/tree';
import {
  MatTreeNestedDataSource,
  MatTree,
  MatTreeNodeDef,
  MatTreeNode,
  MatTreeNodeToggle,
  MatNestedTreeNode,
  MatTreeNodeOutlet
} from '@angular/material/tree';
import { OfficeTreeService } from './office-tree-service.service';
import { TreeControlService } from 'app/shared/common-logic/tree-control.service';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { ExternalIdentifierComponent } from '../../shared/external-identifier/external-identifier.component';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Offices component.
 */
@Component({
  selector: 'mifosx-offices',
  templateUrl: './offices.component.html',
  styleUrls: ['./offices.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonToggleGroup,
    MatButtonToggle,
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
    MatPaginator,
    MatTree,
    MatTreeNodeDef,
    MatTreeNode,
    MatTreeNodeToggle,
    MatIconButton,
    MatNestedTreeNode,
    MatTreeNodeOutlet,
    MatCardTitle,
    MatTabGroup,
    MatTab,
    ExternalIdentifierComponent,
    DatePipe,
    DateFormatPipe
  ]
})
export class OfficesComponent implements OnInit, AfterViewInit {
  /** Button toggle group form control for type of view. (list/tree) */
  viewGroup = new UntypedFormControl('listView');

  /** Offices data. */
  officesData: any;
  /** Columns to be displayed in offices table. */
  displayedColumns: string[] = [
    'name',
    'externalId',
    'parentName',
    'openingDate'
  ];
  /** Data source for offices table. */
  dataSource: MatTableDataSource<any>;
  /** Nested tree control for offices tree. */
  nestedTreeControl: NestedTreeControl<OfficeNode>;
  /** Nested tree data source for offices tree. */
  nestedTreeDataSource: MatTreeNestedDataSource<OfficeNode>;
  /** Selected Office. */
  office: OfficeNode;
  /** Office data tables. */
  dataTablesData: any;
  /** Flag to check if tree is expanded or collapsed. */
  isTreeExpanded = true;

  /** Paginator for offices table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for offices table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of tree view button */
  @ViewChild('buttonTreeView') buttonTreeView: ElementRef<any>;
  /* Template for popover on tree view button */
  @ViewChild('templateButtonTreeView') templateButtonTreeView: TemplateRef<any>;
  /* Reference of offices table */
  @ViewChild('tableOffices') tableOffices: ElementRef<any>;
  /* Template for popover on offices table */
  @ViewChild('templateTableOffices') templateTableOffices: TemplateRef<any>;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {OfficeTreeService} officeTreeService office tree service.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private officeTreeService: OfficeTreeService,
    private treeControlService: TreeControlService,
    private configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService
  ) {
    this.route.data.subscribe((data: { offices: any; officeDataTables: any }) => {
      this.officesData = data.offices;
      officeTreeService.initialize(this.officesData);
      this.dataTablesData = data.officeDataTables;
    });
    this.nestedTreeControl = new NestedTreeControl<OfficeNode>(this.getChildren);
    this.nestedTreeDataSource = new MatTreeNestedDataSource<OfficeNode>();
  }

  /**
   * Filters data in offices table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the offices table.
   */
  ngOnInit() {
    this.setOffices();
    this.officeTreeService.treeDataChange.subscribe((officeTreeData: OfficeNode[]) => {
      this.nestedTreeDataSource.data = officeTreeData;
      this.nestedTreeControl.expand(this.nestedTreeDataSource.data[0]);
      this.nestedTreeControl.dataNodes = officeTreeData;
    });
  }

  /**
   * Initializes the data source, paginator and sorter for offices table.
   */
  setOffices() {
    this.dataSource = new MatTableDataSource(this.officesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * View selected office.
   * @param {OfficeNode} office Office to be viewed.
   */
  viewOfficeNode(office: OfficeNode) {
    if (office.id) {
      this.office = office;
    } else {
      delete this.office;
    }
  }

  /**
   * Closes the current view for office
   */
  closeOffice() {
    delete this.office;
  }

  /**
   * Checks if selected node in tree has children.
   */
  hasNestedChild = (_: number, node: OfficeNode) => node.children.length;

  /**
   * Gets the children of selected node in tree.
   */
  private getChildren = (node: OfficeNode) => of(node.children);

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
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showOfficeList === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonTreeView, this.buttonTreeView.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showOfficeTable === true) {
      setTimeout(() => {
        this.showPopover(this.templateTableOffices, this.tableOffices.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Next Step (Create Office Form) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showOfficeList = false;
    this.configurationWizardService.showOfficeTable = false;
    this.configurationWizardService.showOfficeForm = true;
    this.router.navigate(['/organization/offices/create']);
  }

  /**
   * Previous Step ( Manage Offices Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showOfficeList = false;
    this.configurationWizardService.showOfficeTable = false;
    this.configurationWizardService.showCreateOffice = true;
    this.router.navigate(['/organization']);
  }

  /**
   * Expand and Collapse the tree
   */
  toggleExpandCollapse() {
    this.isTreeExpanded = this.treeControlService.toggleExpandCollapse(this.nestedTreeControl, this.isTreeExpanded);
  }
}
