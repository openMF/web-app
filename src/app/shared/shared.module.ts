 /** Angular Imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

/** Custom Components */
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { FooterComponent } from './footer/footer.component';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';

/** Custom Modules */
import { IconsModule } from './icons.module';
import { MaterialModule } from './material.module';

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
    ReactiveFormsModule
  ],
  declarations: [
    DeleteDialogComponent,
    FileUploadComponent,
    FooterComponent,
    LanguageSelectorComponent
  ],
  exports: [
    FileUploadComponent,
    FooterComponent,
    LanguageSelectorComponent,
    CommonModule,
    IconsModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  entryComponents: [
    DeleteDialogComponent
  ]
})
export class SharedModule { }
