import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderComponent } from './loader/loader.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { CoreModule } from '../core/core.module';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    CoreModule
  ],
  declarations: [
    LoaderComponent,
    FileUploadComponent,
    DeleteDialogComponent
  ],
  exports: [
    LoaderComponent,
    FileUploadComponent
  ],
  entryComponents: [
    DeleteDialogComponent
  ]
})
export class SharedModule { }
