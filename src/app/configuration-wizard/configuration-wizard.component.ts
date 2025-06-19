/** Angular Imports */
import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogContent,
  MatDialogClose,
  MatDialogActions
} from '@angular/material/dialog';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatGridList, MatGridTile } from '@angular/material/grid-list';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Configuration Wizard Component.
 */
@Component({
  selector: 'mifosx-configuration-wizard',
  templateUrl: './configuration-wizard.component.html',
  styleUrls: ['./configuration-wizard.component.scss'],
  imports: [
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatGridList,
    MatGridTile,
    MatButton,
    MatDialogClose,
    MatProgressBar,
    MatDialogActions,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class ConfigurationWizardComponent {
  show: number;
  /**
   * @param {MatDialogRef<ConfigurationWizardComponent>} dialogRef MatDialogRef<ConfigurationWizardComponent>.
   */
  constructor(
    public dialogRef: MatDialogRef<ConfigurationWizardComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
}
