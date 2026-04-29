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
import { CreateEditComponent } from './create-edit-template/create-edit-template.component';

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
    TemplatesRoutingModule,
    TemplatesComponent,
    ViewTemplateComponent,
    CreateEditComponent
  ]
})
export class TemplatesModule {}
