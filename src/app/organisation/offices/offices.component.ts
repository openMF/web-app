import { Component, OnInit, ViewChild } from '@angular/core';
import { OrganisationService } from '../organisation.service';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'mifosx-offices',
  templateUrl: './offices.component.html',
  styleUrls: ['./offices.component.scss']
})
export class OfficesComponent implements OnInit {
  displayedColumns: string[] = ['name', 'external-id', 'parent-office', 'opened-on'];
  dataSource = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(private organisationService: OrganisationService,
    private router: Router) { }

  ngOnInit() {
    this.getOffices();
  }

  getOffices() {
    return this.organisationService.getOffices().subscribe(
      response => {
        this.dataSource = new MatTableDataSource(response);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
      }
    );
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewOffice(office: any) {
    this.router.navigate(['/organisation/manage-offices/view', office.id]);
  }
}
