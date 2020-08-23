/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * View Hook Component.
 */
@Component({
  selector: 'mifosx-view-hook',
  templateUrl: './view-hook.component.html',
  styleUrls: ['./view-hook.component.scss']
})
export class ViewHookComponent implements OnInit {

  /** Hook Data. */
  hookData: any;

  /**
   * Retrieves the hook data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {MatDialog} dialog Dialog Reference.
   * @param {SystemService} systemService System Service.
   * @param {Router} router Router for navigation.
   */
  constructor(private route: ActivatedRoute,
              private dialog: MatDialog,
              private systemService: SystemService,
              private router: Router) {
    this.route.data.subscribe((data: { hook: any }) => {
      this.hookData = data.hook;
    });
  }

  ngOnInit() {
  }

  /**
   * Deletes the current hook.
   */
  delete() {
    const deleteHookDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `hook ${this.hookData.id}` }
    });
    deleteHookDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.systemService.deleteHook(this.hookData.id)
          .subscribe(() => {
            this.router.navigate(['/system/hooks']);
          });
      }
    });
  }

}
