/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ProductEditorComponent } from './product-editor.component';

export const productEditorGuard: CanDeactivateFn<{
  editor?: ProductEditorComponent;
  core?: { readonly dirty: boolean };
}> = (component) =>
  !component.editor?.busy &&
  !component.editor?.interest?.saving &&
  (!(component.editor?.dirty || component.core?.dirty) ||
    window.confirm(inject(TranslateService).instant('SavingsEditor.Discard')));
