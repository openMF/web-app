import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { OrganizationService } from 'app/organization/organization.service';

@Component({
  selector: 'mifosx-view-status-history',
  templateUrl: './view-status-history.component.html',
  styleUrls: ['./view-status-history.component.scss']
})
export class ViewStatusHistoryComponent implements OnInit {
  statusHistoryData: any[] = [];
  displayedColumns: any;
  /** Data source for status table. */
  dataSource: MatTableDataSource<any>;
  /** Paginator for status table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for status table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;


  constructor(private route: ActivatedRoute, private organizationService: OrganizationService) { }

  ngOnInit(): void {
    // this.route.data.subscribe(
    //   (data: {statusHistoryData: any}) => {
    //     this.statusHistoryData = data.statusHistoryData;
    //   }
    // );
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.organizationService.getStatusHistoryProjects(id).subscribe(data => {
        this.statusHistoryData = data;
        this.dataSource = new MatTableDataSource(this.statusHistoryData);
        this.dataSource.filterPredicate = (data: any, filter: string) => {
          return data.personInCharge?.toLowerCase().includes(filter);
        };

        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      });
    }


    this.displayedColumns = ['personInCharge', 'dateUpdate', 'status'];
  }

  /**
 * Filters
 * @param {string} filterValue Value to filter data.
 */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
