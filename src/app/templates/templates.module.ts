/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { NgModule } from '@angular/core';

/** Custom Modules */
import { EditorModule } from '@tinymce/tinymce-angular';
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
    EditorModule,
    SharedModule,
    DirectivesModule,
    TemplatesRoutingModule,
    TemplatesComponent,
    ViewTemplateComponent,
    CreateEditComponent
  ]
})
export class TemplatesModule {}
