/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';

/**
 * Custom Server Selector Dialog Component
 */
@Component({
  selector: 'mifosx-custom-server',
  templateUrl: './custom-server.component.html',
  styleUrls: ['./custom-server.component.scss']
})
export class CustomServerComponent implements OnInit {

  /** List of selected custom servers */
  serversDataSource: string[] = [];
  /** To identify if data has been changed due to user interaction */
  pristine = true;
  /** Column headers to be displayed in table */
  displayedColumns: string[] = ['URL', 'action'];
  /** Form to add custom servers */
  addServerForm: any;

  /**
   * @param {MatDialogRef} dialogRef Component Reference to dialog
   * @param {any} data provides any data
   * @param {FormBuilder} formBuilder helps to create form for adding custom servers
   * @param {SettingsService} settingsService to add/remove servers in localstorage
   */
  constructor(public dialogRef: MatDialogRef<CustomServerComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private formBuilder: FormBuilder,
              private settingsService: SettingsService) { }

  ngOnInit() {
    this.serversDataSource = this.settingsService.servers;
    this.createAddServerForm();
  }

  /** Add Server Form */
  createAddServerForm() {
    this.addServerForm = this.formBuilder.group({
      'server': [''],
    });
  }

  /**
   * Add selected server to custom servers table
   * @param server any
   */
  addCustomServer(server: any) {
    this.serversDataSource = this.serversDataSource.concat([server]);
    this.addServerForm.server = '';
    this.pristine = false;
  }

  /**
   * Delete specific server from custom servers table
   * @param server any
   */
  deleteCustomServer(server: any) {
    this.serversDataSource.splice(this.serversDataSource.indexOf(server), 1);
    this.serversDataSource = this.serversDataSource.concat([]);
    this.pristine = false;
  }

  onCancel() {
    this.serversDataSource = [];
    this.dialogRef.close();
  }

  onConfirm() {
    this.dialogRef.close({data: this.serversDataSource});
  }

  /**
   * return selected custom servers
   */
  get customServers() {
    return this.serversDataSource;
  }

}

