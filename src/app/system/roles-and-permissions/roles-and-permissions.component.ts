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
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Roles and Permissions component.
 */
@Component({
  selector: 'mifosx-roles-and-permissions',
  templateUrl: './roles-and-permissions.component.html',
  styleUrls: ['./roles-and-permissions.component.scss'],
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
    MatTooltip,
    MatIconButton,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class RolesAndPermissionsComponent implements OnInit, AfterViewInit {
  /** Role data. */
  roleData: any;
  /** Columns to be displayed in roles and permissions table. */
  displayedColumns: string[] = [
    'name',
    'description',
    'disabled',
    'actions'
  ];
  /** Data source for roles and permissions table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for roles and permissions table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for roles and permissions table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of add role button */
  @ViewChild('buttonAddRole') buttonAddRole: ElementRef<any>;
  /* Template for popovver on add role button */
  @ViewChild('templateButtonAddRole') templateButtonAddRole: TemplateRef<any>;
  /* Reference of roles and permission table */
  @ViewChild('tableRolesandPermissions') tableRolesandPermissions: ElementRef<any>;
  /* Template for roles and permission table */
  @ViewChild('templateTableRolesandPermissions') templateTableRolesandPermissions: TemplateRef<any>;
  /**
   * Retrieves the roles data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService
  ) {
    this.route.data.subscribe((data: { roles: any }) => {
      this.roleData = data.roles;
    });
  }

  /**
   * Filters data in roles and permissions table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the roles and permissions table.
   */
  ngOnInit() {
    this.setRoles();
  }

  /**
   * Stops the propagation to view roles and permissions
   * @param event Mouse Event
   */
  routeEdit(event: MouseEvent) {
    event.stopPropagation();
  }

  /**
   * Initializes the data source, paginator and sorter for roles and permissions table.
   */
  setRoles() {
    this.dataSource = new MatTableDataSource(this.roleData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showRolesandPermissionPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonAddRole, this.buttonAddRole.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showRolesandPermissionList === true) {
      setTimeout(() => {
        this.showPopover(
          this.templateTableRolesandPermissions,
          this.tableRolesandPermissions.nativeElement,
          'top',
          true
        );
      });
    }
  }

  /**
   * Next Step (Users) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showRolesandPermissionPage = false;
    this.configurationWizardService.showRolesandPermissionList = false;
    this.configurationWizardService.showUsers = true;
    this.router.navigate(['/appusers']);
  }

  /**
   * Previous Step (Roles and Permission System Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showRolesandPermissionPage = false;
    this.configurationWizardService.showRolesandPermissionList = false;
    this.configurationWizardService.showRolesandPermission = true;
    this.router.navigate(['/system']);
  }
}
