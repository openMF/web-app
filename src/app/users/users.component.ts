/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit  } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Services */
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';

/**
 * Users component.
 */
@Component({
  selector: 'mifosx-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit {

  /** Users data. */
  usersData: any;
  /** Columns to be displayed in users table. */
  displayedColumns: string[] = ['firstname', 'lastname', 'email', 'officeName'];
  /** Data source for users table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for users table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for users table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of create user button */
  @ViewChild('buttonCreateUser') buttonCreateUser: ElementRef<any>;
  /* Template for popover create user button */
  @ViewChild('templateButtonCreateUser') templateButtonCreateUser: TemplateRef<any>;
  /* Reference of users table */
  @ViewChild('usersTable') usersTable: ElementRef<any>;
  /* Template for popover on users table */
  @ViewChild('templateUsersTable') templateUsersTable: TemplateRef<any>;

  /**
   * Retrieves the users data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe(( data: { users: any }) => {
      this.usersData = data.users;
    });
  }

  /**
   * Filters data in users table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the users table.
   */
  ngOnInit() {
    this.setUsers();
  }

  /**
   * Initializes the data source, paginator and sorter for users table.
   */
  setUsers() {
    this.dataSource = new MatTableDataSource(this.usersData);
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
  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showUsers === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonCreateUser, this.buttonCreateUser.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showUsersList === true) {
      setTimeout(() => {
        this.showPopover(this.templateUsersTable, this.usersTable.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Next Step (Create User Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showUsers = false;
    this.configurationWizardService.showUsersList = false;
    this.configurationWizardService.showUsersForm = true;
    this.router.navigate(['/users/create']);
  }

  /**
   * Previous Step (Roles and Permission Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showUsers = false;
    this.configurationWizardService.showUsersList = false;
    this.configurationWizardService.showRolesandPermissionList = true;
    this.router.navigate(['/system/roles-and-permissions']);
  }

}
