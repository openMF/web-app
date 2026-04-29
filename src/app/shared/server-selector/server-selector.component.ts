/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormBuilder, Validators } from '@angular/forms';
/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { MatFormField, MatLabel, MatPrefix, MatError } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Server Selector Component
 */
@Component({
  selector: 'mifosx-server-selector',
  templateUrl: './server-selector.component.html',
  styleUrls: ['./server-selector.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatPrefix,
    MatIcon
  ]
})
export class ServerSelectorComponent implements OnInit {
  /** Input server. */
  form: any;

  /** Server Settings. */
  servers: string[];

  /** Server Setting */
  serverSelector = new UntypedFormControl('');

  /** Server list to show */
  existMoreThanOneServer = false;

  /**
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private settingsService: SettingsService,
    public dialog: MatDialog,
    private formBuilder: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.servers = this.settingsService.servers;
    this.existMoreThanOneServer = this.servers && this.servers.length > 1;
    if (!this.existMoreThanOneServer) {
      this.settingsService.setServer(this.servers[0]);
    } else {
      this.existMoreThanOneServer = true;
      this.serverSelector.patchValue(this.settingsService.server);
      this.form = this.formBuilder.group({
        url: [
          '',
          [Validators.required]
        ]
      });
    }
  }

  /**
   * Set backend server from the list
   */
  setServer(): void {
    this.settingsService.setServer(this.serverSelector.value);
  }

  /**
   * Add new server to the list.
   */
  addNewServer(): void {
    let servers;
    let url = this.form.value.url;
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }
    this.settingsService.setServer(url);
    servers = this.settingsService.servers;
    servers.push(url);
    this.settingsService.setServers(servers);
    window.location.reload();
  }
}
