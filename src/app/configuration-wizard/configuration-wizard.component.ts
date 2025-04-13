/** Angular Imports */
import { Component, Inject } from '@angular/core';
import {
  MatLegacyDialogRef as MatDialogRef,
  MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA
} from '@angular/material/legacy-dialog';

/**
 * Configuration Wizard Component.
 */
@Component({
  selector: 'mifosx-configuration-wizard',
  templateUrl: './configuration-wizard.component.html',
  styleUrls: ['./configuration-wizard.component.scss']
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
