/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';

@Injectable({ providedIn: 'root' })
export class ClientActionNotifierService {
  private readonly snackBar = inject(MatSnackBar);
  private readonly translateService = inject(TranslateService);
  private readonly router = inject(Router);

  notify(messageKey: string): void {
    this.snackBar.open(
      this.translateService.instant(messageKey),
      this.translateService.instant('labels.buttons.Close'),
      { duration: 3000 }
    );
  }

  notifyAndNavigate(messageKey: string, route: ActivatedRoute, commands: any[] = ['../../']): void {
    this.snackBar.open(
      this.translateService.instant(messageKey),
      this.translateService.instant('labels.buttons.Close'),
      { duration: 3000 }
    );
    this.router.navigate(commands, { relativeTo: route });
  }
}
