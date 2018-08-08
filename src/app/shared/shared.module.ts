import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderComponent } from './loader/loader.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';

import { MaterialModule } from './material.module';
import { IconsModule } from './icons.module';

@NgModule({
  imports: [
    CommonModule,
    IconsModule,
    MaterialModule
  ],
  declarations: [
    LoaderComponent,
    FileUploadComponent,
    DeleteDialogComponent
  ],
  exports: [
    CommonModule,
    FileUploadComponent,
    IconsModule,
    LoaderComponent,
    MaterialModule
  ],
  entryComponents: [
    DeleteDialogComponent
  ]
})
export class SharedModule { }
