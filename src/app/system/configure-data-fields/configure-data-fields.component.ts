import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { SystemService } from '../system.service';

@Component({
  selector: 'mifosx-configure-data-fields',
  templateUrl: './configure-data-fields.component.html',
  styleUrls: ['./configure-data-fields.component.scss']
})
export class ConfigureDataFieldsComponent implements OnInit {

  /** Data table data. */
  configFieldData: any;
  /** Columns to be displayed in manage data tables table. */
  displayedColumns: string[] = ['entity'];
  /** Data source for manage data tables table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for manage data tables table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for manage data tables table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  countryList:any=[];
  countryListSliced:any=[];
  error:boolean=false;
  countryId:any;
  /**
   * Retrieves the data tables data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,private systemService:SystemService,private router:Router) {
    this.getCountries();
    this.route.data.subscribe(( data: { dataTables: any }) => {
      const configData = [...new Map(data.dataTables.map(v => [v.entity, v])).values()];
      this.configFieldData = configData;
    });
  }

  /**
   * Filters data in manage data tables table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the manage data tables table.
   */
  ngOnInit() {
    this.setConfigFieldData();
  }

  getCountries(){
    this.systemService.getCountries().subscribe((res:any)=>{
      this.countryList=res?.filter((x:any)=>x.status===true);
      this.countryListSliced=this.countryList;
    })
  }

  public isFiltered(country: any) {
    if(country)
    return this.countryListSliced.find(item => item.id === country.id);
  }
  /**
   * Initializes the data source, paginator and sorter for manage data tables table.
   */
  setConfigFieldData() {
    this.dataSource = new MatTableDataSource(this.configFieldData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  routeEntity(entity:any){
    if(this.countryId){
      let countryName=this.countryList.filter((x:any)=>x.id===this.countryId);
      if(countryName && countryName.length>0){
        let country=countryName[0].name;
        this.router.navigate([`system/configure-field/${entity}/${this.countryId}/${country}`]);
      }
    }
  }

}
