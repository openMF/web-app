import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {CreditBureauService} from '../creditbureau.service';
import {DatePipe} from '@angular/common';
import {SettingsService} from '../../../../settings/settings.service';
import {MatTableDataSource} from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { CsvDataService } from './csv-data.service';

@Component({
  selector: 'mifosx-thitsaworks-view',
  templateUrl: './thitsaworks.component.html',
  styleUrls: ['./thitsaworks.component.scss']
})

 export class ThitsaworksComponent implements OnInit {


  CreditReportForm: FormGroup;

  @Input() creditBureauData: any;
  thitsaworksForm: FormGroup;
  @Input() thitsaworkCreditReportData: any;
  creditBureauReportData: any;
  creditBureauReportCreditScore: any;
  creditBureauReportBorrowerInfo: any;
  creditBureauReportOpenAccountsObject: any;
  creditBureauReportClosedAccountsObject: any;
  creditBureauReportBorrowerObject: any;
  displayedColumns: string[] = ['Key', 'Value'];
  displayedActiveLoans = ['Active Loans'];
  displayedPaidLoans = ['Paid Loans'];
  dataSource: MatTableDataSource<any>;
  borrowerInfoDataSource: MatTableDataSource<any>;
  creditScoreDataSource: MatTableDataSource<any>;
  ActiveLoanDataSource: MatTableDataSource<any>;
  PaidLoanDataSource: MatTableDataSource<any>;
  borrowerInfoData: {
    'key': string,
    'value'?: string
  }[];
  creditScoreInfoData: {
    'key': string,
    'value'?: string
  }[];
  @ViewChild('hBSort') hBSort: MatSort;
  @ViewChild('sBSort') sBSort: MatSort;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  params: any;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private creditBureauService: CreditBureauService,
              private datePipe: DatePipe,
              private settingsService: SettingsService) {}
  ngOnInit() {
    this.createThitsaWorksForm();
    this.setCreditReports();
    this.setBorrowerInformationData();
    this.setCreditScoreInformationData();
  }
  setCreditReports() {
  }
  createThitsaWorksForm() {
   this.thitsaworksForm = this.formBuilder.group({
     'NRC': ['', Validators.required],
     'creditBureauID': 1,
   });
  }

  setBorrowerInformationData() {
    this.borrowerInfoData = [
      {
        'key': 'MainIdentifier'
      },
      {
        'key': 'Name'
      },
      {
        'key': 'NRC'
      },
      {
        'key': 'Gender'
      },
      {
        'key': 'DOB'
      },
      {
        'key': 'FatherName'
      },
      {
        'key': 'Address'
      },
      {
        'key': 'LastUpdatedDtm'
      },
      {
        'key': 'PrintedDtm'
      },
    ];
    this.borrowerInfoDataSource = new MatTableDataSource(this.borrowerInfoData);
  }

  setCreditScoreInformationData() {
    this.creditScoreInfoData = [
      {
        'key': 'Score'
      },
      {
        'key': 'Class'
      },
      {
        'key': 'Note'
      }
    ];
    this.creditScoreDataSource = new MatTableDataSource(this.creditScoreInfoData);
  }
  submit() {
    this.thitsaworkCreditReportData = this.creditBureauService.postCreditReport(this.thitsaworksForm.value).subscribe((response: any) => {
      this.creditBureauReportData = response.creditBureauReportData;

      this.creditBureauReportBorrowerInfo = response.creditBureauReportData.borrowerInfo;
      const creditBureauReportBorrowerInfoObject = JSON.parse(this.creditBureauReportBorrowerInfo);
      this.creditBureauReportBorrowerObject = creditBureauReportBorrowerInfoObject;

      this.creditBureauReportCreditScore = response.creditBureauReportData.creditScore;

      const openAccounts = response.creditBureauReportData.openAccounts;
      const openAccountsFilter = openAccounts.toString().replace(/^\|\$/, '' );
      const openAccountsFilterObject = '[' + openAccountsFilter + ']';
      this.creditBureauReportOpenAccountsObject = JSON.parse(openAccountsFilterObject);

      const closedAccounts = response.creditBureauReportData.closedAccounts;
      const closedAccountsFilter = closedAccounts.toString().replace(/^\|\$/, '' );
      const closedAccountsFilterObject = '[' + closedAccountsFilter + ']';
      this.creditBureauReportClosedAccountsObject  =  JSON.parse(closedAccountsFilterObject);

      this.ActiveLoanDataSource = new MatTableDataSource<any>(this.creditBureauReportOpenAccountsObject);
      this.PaidLoanDataSource = new MatTableDataSource<any>(this.creditBureauReportClosedAccountsObject);
    });

     // return this.CreditReport;
    return this.creditBureauReportData;
  }
  // exporting to pdf
  exportOpenAccounts() {
    const btn: HTMLElement = document.getElementById('exportOpenAccounts');
    btn.addEventListener('click', () => {
      CsvDataService.exportToCsv(this.creditBureauReportBorrowerObject.NRC + '_OpenAccounts' + '.csv', this.creditBureauReportOpenAccountsObject);
    });
  }
  exportClosedAccounts() {
    const btn: HTMLElement = document.getElementById('exportClosedAccounts');
    btn.addEventListener('click', () => {
      CsvDataService.exportToCsv(this.creditBureauReportBorrowerObject.NRC + '_ClosedAccounts' + '.csv', this.creditBureauReportClosedAccountsObject);
    });
  }
}
