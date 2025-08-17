/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { StaffService, CentersService, GroupsService, ClientService } from '@fineract/client';
import { RunReportsService as CustomreportAPi } from 'app/customApis.service';

/** Custom Components */
import { OfficeNavigationComponent } from './office-navigation/office-navigation.component';
import { StaffNavigationComponent } from './staff-navigation/staff-navigation.component';
import { CenterNavigationComponent } from './center-navigation/center-navigation.component';
import { GroupNavigationComponent } from './group-navigation/group-navigation.component';
import { ClientNavigationComponent } from './client-navigation/client-navigation.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Navigation component.
 */
@Component({
  selector: 'mifosx-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    OfficeNavigationComponent,
    StaffNavigationComponent,
    CenterNavigationComponent,
    GroupNavigationComponent,
    ClientNavigationComponent
  ]
})
export class NavigationComponent implements OnInit {
  /** Navigation Components */
  @ViewChild(OfficeNavigationComponent) officeNavigationComponent: OfficeNavigationComponent;
  @ViewChild(StaffNavigationComponent) staffNavigationComponent: StaffNavigationComponent;
  @ViewChild(CenterNavigationComponent) centerNavigationComponent: CenterNavigationComponent;
  @ViewChild(GroupNavigationComponent) groupNavigationComponent: GroupNavigationComponent;
  @ViewChild(ClientNavigationComponent) clientNavigationComponent: ClientNavigationComponent;

  /** Office data */
  officeData: any;
  /** Employee data */
  employeeData: any;
  /** Center data */
  centerData: any;
  /** Group data */
  groupData: any;
  /** Client data */
  clientData: any;

  /** Office selector */
  officeSelector = new UntypedFormControl();
  /** Employee selector */
  employeeSelector = new UntypedFormControl();
  /** Center selector */
  centerSelector = new UntypedFormControl();
  /** Group selector */
  groupSelector = new UntypedFormControl();
  /** Client selector */
  clientSelector = new UntypedFormControl();

  /** Selected Item */
  selectedItem: any;
  /** Selected Item Accounts */
  selectedItemAccounts: any;
  /** Selected Item Summary */
  selectedItemSummary: any;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {StaffService} staffService Staff Service.
   * @param {CentersService} centersService Centers Service.
   * @param {GroupsService} groupsService Groups Service.
   * @param {ClientService} clientService Client Service.
   * @param {CustomreportAPi} CustomreportAPi Run Reports Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private staffService: StaffService,
    private centersService: CentersService,
    private groupsService: GroupsService,
    private clientService: ClientService,
    private customreportAPi: CustomreportAPi,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  /**
   * Sets all selectors
   */
  ngOnInit() {
    this.setOfficeSelector();
    this.setEmployeeSelector();
    this.setCenterSelector();
    this.setGroupSelector();
    this.setClientSelector();
  }

  /**
   * Sets the office selector
   */
  setOfficeSelector() {
    this.officeSelector.valueChanges.subscribe((officeId) => {
      this.employeeSelector.reset(null, { emitEvent: false });
      this.centerSelector.reset(null, { emitEvent: false });
      this.groupSelector.reset(null, { emitEvent: false });
      this.clientSelector.reset(null, { emitEvent: false });
      this.employeeData = null;
      this.centerData = null;
      this.groupData = null;
      this.clientData = null;
      this.selectedItem = this.officeData.find((office: any) => office.id === officeId);
      this.selectedItem.itemType = 'office';
      this.staffService.retrieveAll16(officeId).subscribe((employees: any) => {
        this.employeeData = employees;
        if (this.employeeData.length) {
          this.employeeSelector.enable();
        } else {
          this.employeeSelector.disable();
        }
      });
    });
  }

  /**
   * Sets the employee selector
   */
  setEmployeeSelector() {
    this.employeeSelector.valueChanges.subscribe((employeeId) => {
      if (employeeId) {
        this.centerSelector.reset(null, { emitEvent: false });
        this.groupSelector.reset(null, { emitEvent: false });
        this.clientSelector.reset(null, { emitEvent: false });
        this.centerData = null;
        this.groupData = null;
        this.clientData = null;
        this.selectedItem = this.employeeData.find((employee: any) => employee.id === employeeId);
        this.selectedItem.itemType = 'employee';
        this.customreportAPi.getCentersFromStaffId(employeeId).subscribe((centers: any) => {
          this.centerData = centers;
          if (this.centerData.length) {
            this.centerSelector.enable();
          } else {
            this.centerSelector.disable();
          }
        });
      }
    });
  }

  /**
   * Sets the center selector
   */
  setCenterSelector() {
    this.centerSelector.valueChanges.subscribe((centerId) => {
      if (centerId) {
        this.groupSelector.reset(null, { emitEvent: false });
        this.clientSelector.reset(null, { emitEvent: false });
        this.groupData = null;
        this.clientData = null;
        this.customreportAPi.getCenter(centerId).subscribe((center: any) => {
          this.selectedItem = center;
          this.selectedItem.itemType = 'center';
          this.groupData = center.groupMembers ? center.groupMembers : [];
          if (this.groupData.length) {
            this.groupSelector.enable();
          } else {
            this.groupSelector.disable();
          }
        });
        this.selectedItemAccounts = null;
        this.centersService.retrieveGroupAccount(centerId).subscribe((centerAccounts: any) => {
          this.selectedItemAccounts = centerAccounts;
        });
        this.selectedItemSummary = null;
        this.customreportAPi.getCenterSummary(centerId).subscribe((centerSummary: any) => {
          this.selectedItemSummary = centerSummary[0];
        });
      }
    });
  }

  /**
   * Sets the group selector
   */
  setGroupSelector() {
    this.groupSelector.valueChanges.subscribe((groupId) => {
      if (groupId) {
        this.clientSelector.reset(null, { emitEvent: false });
        this.clientData = null;
        this.groupsService.retrieveOne15(groupId).subscribe((group: any) => {
          this.selectedItem = group;
          this.selectedItem.itemType = 'group';
          this.clientData = group.clientMembers ? group.clientMembers : [];
          if (this.clientData.length) {
            this.clientSelector.enable();
          } else {
            this.clientSelector.disable();
          }
        });
        this.selectedItemAccounts = null;
        this.groupsService.retrieveAccounts(groupId).subscribe((groupAccounts: any) => {
          this.selectedItemAccounts = groupAccounts;
        });
      }
    });
  }

  /**
   * Sets the client selector
   */
  setClientSelector() {
    this.clientSelector.valueChanges.subscribe((clientId) => {
      if (clientId) {
        this.selectedItemAccounts = null;
        this.clientService.retrieveAssociatedAccounts(clientId).subscribe((client: any) => {
          this.selectedItem = client;
          this.selectedItem.itemType = 'client';
        });
        this.clientService.retrieveAssociatedAccounts(clientId).subscribe((clientAccounts: any) => {
          this.selectedItemAccounts = clientAccounts;
        });
      }
    });
  }
}
