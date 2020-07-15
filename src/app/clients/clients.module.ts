/** Angular Imports */
import { NgModule } from '@angular/core';
import { DatePipe } from '@angular/common';

/** Custom Modules */
import { ClientsRoutingModule } from './clients-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { PipesModule } from '../pipes/pipes.module';
import { DirectivesModule } from '../directives/directives.module';

/** Custom Components */
import { ClientsComponent } from './clients.component';
import { ClientsViewComponent } from './clients-view/clients-view.component';
import { GeneralTabComponent } from './clients-view/general-tab/general-tab.component';
import { FamilyMembersTabComponent } from './clients-view/family-members-tab/family-members-tab.component';
import { AddFamilyMemberComponent } from './clients-view/family-members-tab/add-family-member/add-family-member.component';
import { EditFamilyMemberComponent } from './clients-view/family-members-tab/edit-family-member/edit-family-member.component';
import { IdentitiesTabComponent } from './clients-view/identities-tab/identities-tab.component';
import { UploadDocumentDialogComponent } from './clients-view/custom-dialogs/upload-document-dialog/upload-document-dialog.component';
import { NotesTabComponent } from './clients-view/notes-tab/notes-tab.component';
import { EditNotesDialogComponent } from './clients-view/custom-dialogs/edit-notes-dialog/edit-notes-dialog.component';
import { DocumentsTabComponent } from './clients-view/documents-tab/documents-tab.component';
import { DatatableTabComponent } from './clients-view/datatable-tab/datatable-tab.component';
import { MultiRowComponent } from './clients-view/datatable-tab/multi-row/multi-row.component';
import { SingleRowComponent } from './clients-view/datatable-tab/single-row/single-row.component';
import { AddressTabComponent } from './clients-view/address-tab/address-tab.component';
import { ChargesOverviewComponent } from './clients-view/charges-overview/charges-overview.component';
import { ClientActionsComponent } from './clients-view/client-actions/client-actions.component';
import { ClientAssignStaffComponent } from './clients-view/client-actions/client-assign-staff/client-assign-staff.component';
import { UnassignStaffDialogComponent } from './clients-view/custom-dialogs/unassign-staff-dialog/unassign-staff-dialog.component';
import { CloseClientComponent } from './clients-view/client-actions/close-client/close-client.component';
import { ViewSurveyComponent } from './clients-view/client-actions/view-survey/view-survey.component';
import { RejectClientComponent } from './clients-view/client-actions/reject-client/reject-client.component';
import { ActivateClientComponent } from './clients-view/client-actions/activate-client/activate-client.component';
import { WithdrawClientComponent } from './clients-view/client-actions/withdraw-client/withdraw-client.component';
import { TakeSurveyComponent } from './clients-view/client-actions/view-survey/take-survey/take-survey.component';
import { UpdateClientSavingsAccountComponent } from './clients-view/client-actions/update-client-savings-account/update-client-savings-account.component';
import { TransferClientComponent } from './clients-view/client-actions/transfer-client/transfer-client.component';
import { UndoClientTransferComponent } from './clients-view/client-actions/undo-client-transfer/undo-client-transfer.component';
import { RejectClientTransferComponent } from './clients-view/client-actions/reject-client-transfer/reject-client-transfer.component';
import { AcceptClientTransferComponent } from './clients-view/client-actions/accept-client-transfer/accept-client-transfer.component';
import { ReactivateClientComponent } from './clients-view/client-actions/reactivate-client/reactivate-client.component';
import { UndoClientRejectionComponent } from './clients-view/client-actions/undo-client-rejection/undo-client-rejection.component';
import { AddClientChargeComponent } from './clients-view/client-actions/add-client-charge/add-client-charge.component';


/**
 * Clients Module
 *
 * All components related to Clients should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    ClientsRoutingModule,
    PipesModule,
    DirectivesModule
  ],
  declarations: [
    ClientsComponent,
    ClientsViewComponent,
    GeneralTabComponent,
    FamilyMembersTabComponent,
    AddFamilyMemberComponent,
    EditFamilyMemberComponent,
    IdentitiesTabComponent,
    UploadDocumentDialogComponent,
    NotesTabComponent,
    EditNotesDialogComponent,
    DocumentsTabComponent,
    DatatableTabComponent,
    MultiRowComponent,
    SingleRowComponent,
    AddressTabComponent,
    ChargesOverviewComponent,
    ClientActionsComponent,
    ClientAssignStaffComponent,
    UnassignStaffDialogComponent,
    CloseClientComponent,
    ViewSurveyComponent,
    RejectClientComponent,
    ActivateClientComponent,
    WithdrawClientComponent,
    TakeSurveyComponent,
    UpdateClientSavingsAccountComponent,
    TransferClientComponent,
    UndoClientTransferComponent,
    RejectClientTransferComponent,
    AcceptClientTransferComponent,
    ReactivateClientComponent,
    UndoClientRejectionComponent,
    AddClientChargeComponent
  ],
  entryComponents: [
    UploadDocumentDialogComponent,
    EditNotesDialogComponent,
    UnassignStaffDialogComponent
  ],
  providers: [DatePipe]

})
export class ClientsModule { }
