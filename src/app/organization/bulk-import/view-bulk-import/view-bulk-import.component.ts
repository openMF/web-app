/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { UntypedFormGroup, UntypedFormBuilder } from '@angular/forms';

/** Custom Imports */
import { OrganizationService } from '../../organization.service';
import { BulkImports } from './bulk-imports';
import { ClientsService } from 'app/clients/clients.service';
import { AlertService } from 'app/core/alert/alert.service';

/**
 * View Bulk Imports Component
 */
@Component({
  selector: 'mifosx-view-bulk-import',
  templateUrl: './view-bulk-import.component.html',
  styleUrls: ['./view-bulk-import.component.scss'],
})
export class ViewBulkImportComponent implements OnInit {
  /** offices Data */
  officeData: any;
  officeDataSliced: any;
  /** Countries data */
  countriesData: any;
  countriesDataSliced: any;
  countryConfigurations: any;
  /** staff Data */
  staffData: any;
  /** Entity Template */
  template: File;
  /** imports Data */
  importsData: any;
  /** bulk-import form. */
  bulkImportForm: UntypedFormGroup;
  /** array of deined bulk-imports */
  bulkImportsArray = BulkImports;
  /** bulk-import which user navigated to */
  bulkImport: any = {};
  /** Data source for imports table. */
  dataSource = new MatTableDataSource();
  /** Columns to be displayed in imports table. */
  displayedColumns: string[] = [
    'name',
    'importTime',
    'endTime',
    'completed',
    'totalRecords',
    'successCount',
    'failureCount',
    'download',
  ];

  /** Paginator for imports table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for imports table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  /** Imports table reference */
  @ViewChild('importsTable', { static: true }) importsTableRef: MatTable<Element>;

  /**
   * fetches offices and imports data from resolve
   * @param {ActivatedRoute} route ActivatedRoute
   * @param {FormBuilder} formBuilder FormBuilder
   * @param {OrganizationService} organizationService OrganizationService
   */
  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private clientsService: ClientsService,
    private alertService: AlertService
  ) {
    this.bulkImport.name = this.route.snapshot.params['import-name'];

    this.route.data.subscribe((data: { offices: any; imports: any; countries: any }) => {
      this.officeData = data.offices;
      this.officeDataSliced = this.officeData;
      this.countriesData = data.countries;
      this.countriesDataSliced = this.countriesData;
      this.importsData = data.imports;
    });
  }

  /**
   * Gets bulk import's properties.
   */
  ngOnInit() {
    this.bulkImport = this.bulkImportsArray.find((entry) => entry.name === this.bulkImport.name);
    this.createBulkImportForm();
    this.setImports();
  }

  /**
   * Used for filtering office dropdownlist.
   */
  public isFiltered(office: any) {
    return this.officeDataSliced.find((item) => item.id === office.id);
  }

  /**
   * Used for filtering country dropdownlist.
   */
  public isCountryFiltered(country: any) {
    return this.countriesDataSliced.find((item) => item.id === country.id);
  }

  /**
   * Creates the bulk import form.
   */
  createBulkImportForm() {
    this.bulkImportForm = this.formBuilder.group({
      countryId: [''],
      officeId: [''],
      staffId: [''],
      legalForm: [''],
    });
  }

  /**
   * Fetches staff data where necessary.
   */
  retrieveStaffData(officeId: any) {
    if (this.bulkImport.formFields >= 2 || this.bulkImport.name == 'Healthy Path') {
      this.organizationService.getStaff(officeId).subscribe((data: any) => {
        this.staffData = data;
      });
    }
  }

  /**
   * Initializes the data source, paginator and sorter for imports table.
   */
  setImports() {
    this.dataSource = new MatTableDataSource(this.importsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Gets bulk import's downloadable template from API.
   */
  downloadTemplate() {
    const countryId = this.bulkImportForm.get('countryId').value;
    const officeId = this.bulkImportForm.get('officeId').value;
    const staffId = this.bulkImportForm.get('staffId').value;
    let legalFormType = '';
    /** Only for Client Bulk Imports */
    switch (this.bulkImportForm.get('legalForm').value) {
      case 'Person':
        legalFormType = 'CLIENTS_PERSON';
        break;
      case 'Entity':
        legalFormType = 'CLIENTS_ENTTTY';
        break;
    }
    this.organizationService
      .getImportTemplate(this.bulkImport.urlSuffix, countryId, officeId, staffId, legalFormType)
      .subscribe((res: any) => {
        this.organizationService.downloadFileFromAPIResponse(res);
      });
  }

  onCountryChange(countryId: any) {
    let commandParam,
      staffInSelectedOfficeOnly = true;

    switch (this.bulkImport.name) {
      case 'Clients':
      case 'Groups':
      case 'Offices':
      case 'Loan Accounts':
        commandParam = 'clientBulkImportTemplate';
        break;
      default:
        commandParam = '';
        break;
    }

    if (this.bulkImport.name != 'Loan Repayments' && this.bulkImport.name !== 'Health Path') {
      this.getClientCommandTemplateForBulkImport(countryId, commandParam, staffInSelectedOfficeOnly);
    }
  }

  getClientCommandTemplateForBulkImport(countryId: any, commandParam: string, staffInSelectedOfficeOnly: boolean) {
    this.clientsService
      .getClientCommandTemplateForBulkImport(commandParam, countryId, staffInSelectedOfficeOnly)
      .subscribe((data: any) => {
        this.officeData = data.officeOptions;
        this.officeDataSliced = this.officeData;
      });
  }
  /**
   * Sets file form control value.
   * @param {any} $event file change event.
   */
  onFileSelect($event: any) {
    if ($event.target.files.length > 0) {
      this.template = $event.target.files[0];
    }
  }

  /**
   * Upload excel file containing bulk import data.
   */
  uploadTemplate() {
    let legalFormType = '';
    /** Only for Client Bulk Imports */
    if (this.bulkImport.name === 'Clients') {
      if (this.template.name.toLowerCase().includes('entity')) {
        legalFormType = 'CLIENTS_ENTTTY';
      } else if (this.template.name.toLowerCase().includes('person')) {
        legalFormType = 'CLIENTS_PERSON';
      }
    }
    let countryId = null;
    if (this.bulkImport.name == 'Loan Repayments') {
      countryId = this.bulkImportForm.get('countryId').value;
      if (!countryId) {
        return this.alertService.alert({
          type: 'Error while uploading a file',
          message: 'Please select a country',
        });
      }
    }

    this.organizationService
      .uploadImportDocument(this.template, this.bulkImport.urlSuffix, legalFormType, countryId)
      .subscribe(() => {
        this.refreshDocuments();
      });
  }

  /**
   * Reloads imports data table.
   */
  refreshDocuments() {
    this.organizationService.getImports(this.bulkImport.entityType).subscribe((data: any) => {
      this.dataSource = new MatTableDataSource(data);
      this.importsTableRef.renderRows();
    });
  }

  /**
   * Download import document.
   * @param {string} name Import Name
   * @param {any} id ImportID
   */
  downloadDocument(name: string, id: any) {
    this.organizationService.getImportDocument(id).subscribe((res: any) => {
      const contentType = res.headers.get('Content-Type');
      const blob = new Blob([res.body], { type: contentType });
      const fileOfBlob = new File([blob], name, { type: contentType });
      window.open(window.URL.createObjectURL(fileOfBlob));
    });
  }
}
