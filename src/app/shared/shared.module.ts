/** Angular Imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

/** Custom Components */
import { FormfieldComponent } from './form-dialog/formfield/formfield.component';
import { FormDialogComponent } from './form-dialog/form-dialog.component';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { CancelDialogComponent } from './cancel-dialog/cancel-dialog.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { FooterComponent } from './footer/footer.component';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { ThemePickerComponent } from './theme-picker/theme-picker.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { EnableDialogComponent } from './enable-dialog/enable-dialog.component';
import { DisableDialogComponent } from './disable-dialog/disable-dialog.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';
import { NotificationsTrayComponent } from './notifications-tray/notifications-tray.component';
import { SearchToolComponent } from './search-tool/search-tool.component';
import { KeyboardShortcutsDialogComponent } from './keyboard-shortcuts-dialog/keyboard-shortcuts-dialog.component';
import { ServerSelectorComponent } from './server-selector/server-selector.component';
import { TenantSelectorComponent } from './tenant-selector/tenant-selector.component';

/** Custom Modules */
import { IconsModule } from './icons.module';
import { MaterialModule } from './material.module';
import { TranslateModule } from '@ngx-translate/core';
import { ExternalIdentifierComponent } from './external-identifier/external-identifier.component';
import { PipesModule } from 'app/pipes/pipes.module';
import { EntityNotesTabComponent } from './tabs/entity-notes-tab/entity-notes-tab.component';
import { EntityDocumentsTabComponent } from './tabs/entity-documents-tab/entity-documents-tab.component';
import { DirectivesModule } from 'app/directives/directives.module';

/**
 * Shared Module
 *
 * Modules and components that are shared throughout the application should be here.
 */
@NgModule({
  imports: [
    CommonModule,
    IconsModule,
    MaterialModule,
    ReactiveFormsModule,
    TranslateModule.forRoot(),
    PipesModule,
    DirectivesModule
  ],
  declarations: [
    FormfieldComponent,
    FormDialogComponent,
    DeleteDialogComponent,
    CancelDialogComponent,
    FileUploadComponent,
    FooterComponent,
    LanguageSelectorComponent,
    ThemePickerComponent,
    ChangePasswordDialogComponent,
    EnableDialogComponent,
    DisableDialogComponent,
    ConfirmationDialogComponent,
    KeyboardShortcutsDialogComponent,
    ErrorDialogComponent,
    NotificationsTrayComponent,
    SearchToolComponent,
    ServerSelectorComponent,
    TenantSelectorComponent,
    ExternalIdentifierComponent,
    EntityNotesTabComponent,
    EntityDocumentsTabComponent
  ],
  exports: [
    FileUploadComponent,
    FooterComponent,
    LanguageSelectorComponent,
    ServerSelectorComponent,
    ThemePickerComponent,
    NotificationsTrayComponent,
    SearchToolComponent,
    ErrorDialogComponent,
    CommonModule,
    IconsModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    TenantSelectorComponent,
    ExternalIdentifierComponent,
    EntityNotesTabComponent,
    EntityDocumentsTabComponent
  ]
})
export class SharedModule { }
