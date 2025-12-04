/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogTitle, MatDialogContent } from '@angular/material/dialog';
import { KeyboardShortcutsConfiguration } from '../../keyboards-shortcut-config';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatDivider } from '@angular/material/divider';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
/**
 * Delete dialog component.
 */
@Component({
  selector: 'mifosx-keyboard-shortcuts-dialog',
  templateUrl: './keyboard-shortcuts-dialog.component.html',
  styleUrls: ['./keyboard-shortcuts-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    CdkScrollable,
    MatDialogContent,
    MatDivider
  ]
})
export class KeyboardShortcutsDialogComponent implements OnInit {
  dialogRef = inject<MatDialogRef<KeyboardShortcutsDialogComponent>>(MatDialogRef);

  buttonConfig: KeyboardShortcutsConfiguration;

  ngOnInit() {
    this.dialogRef.updateSize(`800px`);
    this.buttonConfig = new KeyboardShortcutsConfiguration();
  }
}
