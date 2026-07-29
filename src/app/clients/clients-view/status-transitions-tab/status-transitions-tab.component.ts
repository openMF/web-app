/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Angular Material Imports */
import { MatTableDataSource } from '@angular/material/table';

/** Custom Services */
import { ClientsService } from '../../clients.service';
import {SettingsService} from "../../../settings/settings.service";

/**
 * Client Status Transitions Tab Component.
 */
@Component({
  selector: 'mifosx-status-transitions-tab',
  templateUrl: './status-transitions-tab.component.html',
  styleUrls: ['./status-transitions-tab.component.scss']
})
export class StatusTransitionsTabComponent implements OnInit {

  /** Columns to be displayed in status transitions table. */
  displayedColumns: string[] = [
    'transitionType',
    'transition',
    'statusChangedOn',
    'createdOn'
  ];

  /** Data source for status transitions table. */
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);

  /** Client ID */
  clientId: string;
  /** Total number of filtered records for pagination */
  totalRecords = 0;
  /** Current page size */
  pageSize = 50;
  /** Loading indicator */
  isLoading = false;
  /** Flag to track whether resolver data has been applied */
  resolverDataApplied = false;

  /**
   * @param {ActivatedRoute} route Activated Route.
   * @param {ClientsService} clientsService Clients service.
   * @param {SettingsService} settingsService Settings service.
   */
  constructor(
    private route: ActivatedRoute,
    private clientsService: ClientsService,
    private settingsService: SettingsService
  ) {
    this.clientId = this.route.parent.snapshot.paramMap.get('clientId');
    this.route.data.subscribe((data: { clientStatusTransitions: any }) => {
      if (data.clientStatusTransitions) {
        this.setStatusTransitionsData(data.clientStatusTransitions);
        this.resolverDataApplied = true;
      }
    });
  }

  ngOnInit(): void {
    if (!this.resolverDataApplied) {
      this.fetchStatusTransitions(0, this.pageSize);
    }
  }

  /**
   * Sets status transitions data from API response.
   * @param {any} statusTransitionsData API response data.
   */
  private setStatusTransitionsData(statusTransitionsData: any): void {
    this.dataSource.data = statusTransitionsData?.pageItems || [];
    this.totalRecords = statusTransitionsData?.totalFilteredRecords || 0;
  }

  /**
   * Fetches status transitions for current page.
   * @param {number} pageIndex Current page index.
   * @param {number} pageSize Number of records per page.
   */
  fetchStatusTransitions(pageIndex: number, pageSize: number): void {
    this.isLoading = true;
    const offset = pageIndex * pageSize;

    this.clientsService.getClientStatusTransitions(this.clientId, offset, pageSize, 'statusChangedOn', 'DESC')
      .subscribe({
        next: (response: any) => {
          this.setStatusTransitionsData(response);
          this.isLoading = false;
        },
        error: () => {
          this.dataSource.data = [];
          this.totalRecords = 0;
          this.isLoading = false;
        }
      });
  }

  /**
   * Called when paginator emits a page event.
   * @param {any} event Material paginator event.
   */
  onPageChange(event: any): void {
    this.pageSize = event.pageSize;
    this.fetchStatusTransitions(event.pageIndex, event.pageSize);
  }

  get dateTimeFormat(): string {
    return this.settingsService.dateFormat.replace('dd', 'DD').concat(' HH:mm:ss');
  }
}
