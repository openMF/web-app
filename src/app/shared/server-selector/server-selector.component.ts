/** Angular Imports */
import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';

/** Custom Dialogs */
import { CustomServerComponent } from 'app/shared/server-selector/custom-server/custom-server.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

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
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(public dialog: MatDialog, private settingsService: SettingsService) { }

  ngOnInit(): void {
    this.servers = this.settingsService.servers;
    this.serverSelector.patchValue(this.settingsService.server);
    this.buildDependencies();
  }

  customServersDialog(): void {
    const editNoteDialogRef = this.dialog.open(CustomServerComponent, {});
    editNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.servers = response.data;
        this.settingsService.setServers(response.data);
      }
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

}
