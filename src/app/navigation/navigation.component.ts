/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, ViewChild, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { NavigationService } from './navigation.service';

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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavigationComponent implements OnInit {
  private navigationService = inject(NavigationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

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
  officeSelector = new FormControl();
  /** Employee selector */
  employeeSelector = new FormControl();
  /** Center selector */
  centerSelector = new FormControl();
  /** Group selector */
  groupSelector = new FormControl();
  /** Client selector */
  clientSelector = new FormControl();

  /** Selected Item */
  selectedItem: any;
  /** Selected Item Accounts */
  selectedItemAccounts: any;
  /** Selected Item Summary */
  selectedItemSummary: any;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {NavigationService} navigationService Navigation Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { offices: any }) => {
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
    this.officeSelector.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((officeId) => {
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
      this.navigationService.getEmployees(officeId).subscribe((employees: any) => {
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
    this.employeeSelector.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((employeeId) => {
      if (employeeId) {
        this.centerSelector.reset(null, { emitEvent: false });
        this.groupSelector.reset(null, { emitEvent: false });
        this.clientSelector.reset(null, { emitEvent: false });
        this.centerData = null;
        this.groupData = null;
        this.clientData = null;
        this.selectedItem = this.employeeData.find((employee: any) => employee.id === employeeId);
        this.selectedItem.itemType = 'employee';
        this.navigationService.getCentersFromStaffId(employeeId).subscribe((centers: any) => {
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
    this.centerSelector.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((centerId) => {
      if (centerId) {
        this.groupSelector.reset(null, { emitEvent: false });
        this.clientSelector.reset(null, { emitEvent: false });
        this.groupData = null;
        this.clientData = null;
        this.navigationService.getCenter(centerId).subscribe((center: any) => {
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
        this.navigationService.getCenterAccounts(centerId).subscribe((centerAccounts: any) => {
          this.selectedItemAccounts = centerAccounts;
        });
        this.selectedItemSummary = null;
        this.navigationService.getCenterSummary(centerId).subscribe((centerSummary: any) => {
          this.selectedItemSummary = centerSummary[0];
        });
      }
    });
  }

  /**
   * Sets the group selector
   */
  setGroupSelector() {
    this.groupSelector.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((groupId) => {
      if (groupId) {
        this.clientSelector.reset(null, { emitEvent: false });
        this.clientData = null;
        this.navigationService.getGroup(groupId).subscribe((group: any) => {
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
        this.navigationService.getGroupAccounts(groupId).subscribe((groupAccounts: any) => {
          this.selectedItemAccounts = groupAccounts;
        });
      }
    });
  }

  /**
   * Sets the client selector
   */
  setClientSelector() {
    this.clientSelector.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((clientId) => {
      if (clientId) {
        this.selectedItemAccounts = null;
        this.navigationService.getClient(clientId).subscribe((client: any) => {
          this.selectedItem = client;
          this.selectedItem.itemType = 'client';
        });
        this.navigationService.getClientAccounts(clientId).subscribe((clientAccounts: any) => {
          this.selectedItemAccounts = clientAccounts;
        });
      }
    });
  }
}
