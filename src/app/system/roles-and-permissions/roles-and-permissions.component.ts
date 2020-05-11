/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/**
 * Roles and Permissions component.
 */
@Component({
  selector: 'mifosx-roles-and-permissions',
  templateUrl: './roles-and-permissions.component.html',
  styleUrls: ['./roles-and-permissions.component.scss']
})
export class RolesAndPermissionsComponent implements OnInit, AfterViewInit {

  /** Role data. */
  roleData: any;
  /** Columns to be displayed in roles and permissions table. */
  displayedColumns: string[] = ['name', 'description', 'disabled', 'actions'];
  /** Data source for roles and permissions table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for roles and permissions table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for roles and permissions table. */
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('buttonAddRole') buttonAddRole: ElementRef<any>;
  @ViewChild('templateButtonAddRole') templateButtonAddRole: TemplateRef<any>;
  @ViewChild('tableRolesandPermissions') tableRolesandPermissions: ElementRef<any>;
  @ViewChild('templateTableRolesandPermissions') templateTableRolesandPermissions: TemplateRef<any>;
  /**
   * Retrieves the roles data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe(( data: { roles: any }) => {
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

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showRolesandPermissionPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonAddRole, this.buttonAddRole.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showRolesandPermissionList === true) {
      setTimeout(() => {
        this.showPopover(this.templateTableRolesandPermissions, this.tableRolesandPermissions.nativeElement, 'top', true);
      });
    }
  }

  nextStep() {
    this.configurationWizardService.showRolesandPermissionPage = false;
    this.configurationWizardService.showRolesandPermissionList = false;
    this.configurationWizardService.showUsers = true;
    this.router.navigate(['/users']);
  }

  previousStep() {
    this.configurationWizardService.showRolesandPermissionPage = false;
    this.configurationWizardService.showRolesandPermissionList = false;
    this.configurationWizardService.showRolesandPermission = true;
    this.router.navigate(['/system']);
  }

}
