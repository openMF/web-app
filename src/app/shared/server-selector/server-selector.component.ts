/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, Validators } from '@angular/forms';
/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';

/**
 * Server Selector Component
 */
@Component({
  selector: 'mifosx-server-selector',
  templateUrl: './server-selector.component.html',
  styleUrls: ['./server-selector.component.scss']
})

export class ServerSelectorComponent implements OnInit {

  /** Input server. */
  form: any;

  /** Server Settings. */
  servers: string[];

  /** Server Setting */
  serverSelector =  new FormControl('');

  /**
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private settingsService: SettingsService, public dialog: MatDialog, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.servers = this.settingsService.servers;
    this.serverSelector.patchValue(this.settingsService.server);
    this.buildDependencies();
    this.form = this.formBuilder.group({
      'url': ['', [Validators.required]],
    });
  }

  /**
   * Subscribe to value changes.
   */
  buildDependencies() {
    this.serverSelector.valueChanges.subscribe((url: string) => {
      this.settingsService.setServer(url);
      window.location.reload(); // refreshes the environment.ts.
    });
  }

  /**
   * Set new server.
   */
  setNewServer() {
    let servers;
    this.settingsService.setServer(this.form.value.url);
    servers = this.settingsService.servers;
    servers.push(this.form.value.url);
    this.settingsService.setServers(servers);
    window.location.reload();
  }

}
