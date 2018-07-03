import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoaderComponent } from './loader/loader.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { CoreModule } from '../core/core.module';

@NgModule({
  imports: [
    CommonModule,
    CoreModule
  ],
  declarations: [
    LoaderComponent,
    FileUploadComponent
  ],
  exports: [
    LoaderComponent,
    FileUploadComponent
  ]
})
export class SharedModule { }
