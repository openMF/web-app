/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { TemplatesService } from '../templates.service';

/** Custom Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/**
 * View Template Component.
 */
@Component({
  selector: 'mifosx-view-template',
  templateUrl: './view-template.component.html',
  styleUrls: ['./view-template.component.scss']
})
export class ViewTemplateComponent {

  /** Template Data */
  templateData: any;

  /**
   * Retrieves the template data from `resolve`.
   * @param {TemplateService} templateService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private route: ActivatedRoute,
              private templatesService: TemplatesService,
              private router: Router,
              private dialog: MatDialog) {
    this.route.data.subscribe((data: { template: any }) => {
      this.templateData = data.template;
    });
  }

  /**
   * Deletes the template and redirects to templates.
   */
  delete() {
    const deleteTemplateDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `template ${this.templateData.id}` }
    });
    deleteTemplateDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.templatesService.deleteTemplate(this.templateData.id)
          .subscribe(() => {
            this.router.navigate(['/templates']);
          });
      }
    });
  }

}
