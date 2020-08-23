/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KeyboardShortcutsConfiguration } from '../../keyboards-shortcut-config';
/**
 * Delete dialog component.
 */
@Component({
  selector: 'mifosx-keyboard-shortcuts-dialog',
  templateUrl: './keyboard-shortcuts-dialog.component.html',
  styleUrls: ['./keyboard-shortcuts-dialog.component.scss']
})
export class KeyboardShortcutsDialogComponent implements OnInit {

  buttonConfig: KeyboardShortcutsConfiguration;

  /**
   * @param {MatDialogRef} dialogRef Component reference to dialog.
   * @param {any} data Provides a deleteContext.
   */
  constructor(public dialogRef: MatDialogRef<KeyboardShortcutsDialogComponent>) { }

  ngOnInit() {
    this.dialogRef.updateSize(`800px`);
    this.buttonConfig = new KeyboardShortcutsConfiguration();
  }

}
