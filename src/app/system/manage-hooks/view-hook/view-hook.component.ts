/** Angular Imports */
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { TranslateService } from '@ngx-translate/core';
import { SystemService } from '../../system.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Hook Component.
 */
@Component({
  selector: 'mifosx-view-hook',
  templateUrl: './view-hook.component.html',
  styleUrls: ['./view-hook.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    DateFormatPipe
  ]
})
export class ViewHookComponent {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private systemService = inject(SystemService);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  /** Hook Data. */
  hookData: any;

  /**
   * Retrieves the hook data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {MatDialog} dialog Dialog Reference.
   * @param {SystemService} systemService System Service.
   * @param {Router} router Router for navigation.
   * @param {TranslateService} translateService Translate Service.
   */
  constructor() {
    this.route.data.subscribe((data: { hook: any }) => {
      this.hookData = data.hook;
    });
  }

  /**
   * Deletes the current hook.
   */
  delete() {
    const deleteHookDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.inputs.hook') + ' ' + this.hookData.id }
    });
    deleteHookDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.systemService.deleteHook(this.hookData.id).subscribe(() => {
          this.router.navigate(['/system/hooks']);
        });
      }
    });
  }
}
