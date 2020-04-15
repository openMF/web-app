/** Angular Imports */
import { NgModule } from '@angular/core';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';

/** Custom Modules */
import { SharedModule } from '../shared/shared.module';
import { TemplatesRoutingModule } from './templates-routing.module';

/** Custom Components */
import { TemplatesComponent } from './templates.component';
import { ViewTemplateComponent } from './view-template/view-template.component';
import { EditTemplateComponent } from './edit-template/edit-template.component';

/**
 * Templates Module
 *
 * Templates components should be declared here.
 */
@NgModule({
  imports: [
    SharedModule,
    TemplatesRoutingModule,
    CKEditorModule
  ],
  declarations: [
    TemplatesComponent,
    ViewTemplateComponent,
    EditTemplateComponent,
  ]
})
export class TemplatesModule { }
