/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { SharedModule } from '../shared/shared.module';
import { DirectivesModule } from '../directives/directives.module';
import { TemplatesRoutingModule } from './templates-routing.module';

/** Custom Components */
import { TemplatesComponent } from './templates.component';
import { ViewTemplateComponent } from './view-template/view-template.component';
import { EditTemplateComponent } from './edit-template/edit-template.component';
import { CreateTemplateComponent } from './create-template/create-template.component';

/**
 * Templates Module
 *
 * Templates components should be declared here.
 */
@NgModule({
  imports: [
    CKEditorModule,
    SharedModule,
    DirectivesModule,
    TemplatesRoutingModule
  ],
  declarations: [
    TemplatesComponent,
    ViewTemplateComponent,
    EditTemplateComponent,
    CreateTemplateComponent,
  ]
})
export class TemplatesModule { }
