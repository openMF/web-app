/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { NavigationRoutingModule } from './navigation-routing.module';

/** Custom Components */
import { NavigationComponent } from './navigation.component';
import { OfficeNavigationComponent } from './office-navigation/office-navigation.component';
import { StaffNavigationComponent } from './staff-navigation/staff-navigation.component';
import { CenterNavigationComponent } from './center-navigation/center-navigation.component';
import { GroupNavigationComponent } from './group-navigation/group-navigation.component';
import { ClientNavigationComponent } from './client-navigation/client-navigation.component';
import { LoanAccountTableComponent } from './loan-account-table/loan-account-table.component';
import { ShareAccountTableComponent } from './share-account-table/share-account-table.component';
import { SavingsAccountTableComponent } from './savings-account-table/savings-account-table.component';
import { MemberGroupsComponent } from './member-groups/member-groups.component';

/**
 * Navigation Module
 *
 * Navigation components should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    PipesModule,
    NavigationRoutingModule
  ],
  declarations: [
    NavigationComponent,
    OfficeNavigationComponent,
    StaffNavigationComponent,
    CenterNavigationComponent,
    GroupNavigationComponent,
    ClientNavigationComponent,
    LoanAccountTableComponent,
    ShareAccountTableComponent,
    SavingsAccountTableComponent,
    MemberGroupsComponent
  ]
})
export class NavigationModule { }
