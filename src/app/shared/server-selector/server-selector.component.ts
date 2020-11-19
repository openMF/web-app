/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

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

  /** Server Settings. */
  servers: string[];

  /** Server Setting */
  serverSelector =  new FormControl('');

  /**
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private settingsService: SettingsService) { }

  ngOnInit(): void {
    this.servers = this.settingsService.servers;
    this.serverSelector.patchValue(this.settingsService.server);
    this.buildDependencies();
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

}
