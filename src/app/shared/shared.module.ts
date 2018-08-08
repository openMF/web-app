 /** Angular Imports */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

/** Custom Components */
import { FileUploadComponent } from './file-upload/file-upload.component';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';

/** Custom Modules */
import { MaterialModule } from './material.module';
import { IconsModule } from './icons.module';

/**
 * Shared Module
 * Modules and components that are shared throughout the application should be here.
 */
@NgModule({
  imports: [
    CommonModule,
    IconsModule,
    MaterialModule
  ],
  declarations: [
    DeleteDialogComponent,
    FileUploadComponent
  ],
  exports: [
    FileUploadComponent,
    CommonModule,
    IconsModule,
    MaterialModule
  ],
  entryComponents: [
    DeleteDialogComponent
  ]
})
export class SharedModule { }
