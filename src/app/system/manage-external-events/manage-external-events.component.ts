import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { SystemService } from '../system.service';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-manage-external-events',
  templateUrl: './manage-external-events.component.html',
  styleUrls: ['./manage-external-events.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatSlideToggle,
    FormsModule,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class ManageExternalEventsComponent implements OnInit {
  /** Events Data. */
  eventsData: any;
  externalEventConfigurations: any = {};

  existAnyUpdate = false;

  /** Columns to be displayed in events table. */
  displayedColumns: string[] = [
    'eventType',
    'status'
  ];
  /** Data source for reports table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for reports table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for reports table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private route: ActivatedRoute,
    private systemService: SystemService
  ) {
    this.route.data.subscribe((data: { events: any }) => {
      this.eventsData = data.events.externalEventConfiguration;
    });
  }

  ngOnInit() {
    this.setEventDatasource();
  }

  /**
   * Initializes the data source, paginator and sorter for events table.
   */
  setEventDatasource() {
    this.dataSource = new MatTableDataSource(this.eventsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Enables/Disables respective event
   */
  toggleStatus(event: any) {
    this.externalEventConfigurations[event.type] = event.enabled;
    this.existAnyUpdate = true;
  }

  /**
   * Filter using the event type value
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * send the changes to the backend
   */
  applyChanges() {
    const payload = {
      externalEventConfigurations: this.externalEventConfigurations
    };

    this.systemService.putExternalEventConfiguration(payload).subscribe(() => {
      this.existAnyUpdate = false;
    });
  }
}
