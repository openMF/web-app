import { MatPaginatorModule } from '@angular/material/paginator';
/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * Users component.
 */
@Component({
  selector: 'mifosx-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FontAwesomeModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule
  ]
})
export class UsersComponent implements OnInit, AfterViewInit {
  /** User data */
  usersData: any[] = [];
  usersZitadelData: any[] = [];

  /** Columns */
  displayedColumns: string[] = [
    'firstname',
    'lastname',
    'email',
    'officeName'
  ];

  /** DataSources */
  dataSource = new MatTableDataSource<any>();
  dataSourceZitadel = new MatTableDataSource<any>();

  /** References for pagination and sorting */
  @ViewChild('paginatorUsers', { static: true }) paginatorUsers!: MatPaginator;
  @ViewChild('sortUsers', { static: true }) sortUsers!: MatSort;

  @ViewChild('paginatorZitadel', { static: true }) paginatorZitadel!: MatPaginator;
  @ViewChild('sortZitadel', { static: true }) sortZitadel!: MatSort;

  /* Buttons and popovers */
  @ViewChild('buttonCreateUser') buttonCreateUser!: ElementRef<any>;
  @ViewChild('templateButtonCreateUser') templateButtonCreateUser!: TemplateRef<any>;
  @ViewChild('usersTable') usersTable!: ElementRef<any>;
  @ViewChild('templateUsersTable') templateUsersTable!: TemplateRef<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService
  ) {}

  ngOnInit() {
    // Get data from resolver
    this.route.data.subscribe((data: { users: any; usersZitadel: any }) => {
      this.usersData = data.users || [];
      this.usersZitadelData = data.usersZitadel || [];

      // Initialize tables
      this.dataSource = new MatTableDataSource(this.usersData);
      this.dataSourceZitadel = new MatTableDataSource(this.usersZitadelData);

      // Assign paginator and sort AFTER having data
      this.dataSource.paginator = this.paginatorUsers;
      this.dataSource.sort = this.sortUsers;

      this.dataSourceZitadel.paginator = this.paginatorZitadel;
      this.dataSourceZitadel.sort = this.sortZitadel;
    });
  }

  /** Filter tables */
  applyFilter(filterValue: string) {
    const filter = filterValue.trim().toLowerCase();
    this.dataSource.filter = filter;
    this.dataSourceZitadel.filter = filter;
  }

  /** Show popover */
  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean) {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showUsers) {
      setTimeout(() => {
        this.showPopover(this.templateButtonCreateUser, this.buttonCreateUser.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showUsersList) {
      setTimeout(() => {
        this.showPopover(this.templateUsersTable, this.usersTable.nativeElement, 'top', true);
      });
    }
  }

  /** Navigate */
  nextStep() {
    this.configurationWizardService.showUsers = false;
    this.configurationWizardService.showUsersList = false;
    this.configurationWizardService.showUsersForm = true;
    this.router.navigate(['/appusers/create']);
  }

  previousStep() {
    this.configurationWizardService.showUsers = false;
    this.configurationWizardService.showUsersList = false;
    this.configurationWizardService.showRolesandPermissionList = true;
    this.router.navigate(['/system/roles-and-permissions']);
  }
}
