/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

/** Custom Services */
import { ReportsService } from '../reports.service';

/**
 * XBRL Report Component
 */
@Component({
  selector: 'mifosx-xbrl-report',
  templateUrl: './xbrl-report.component.html',
  styleUrls: ['./xbrl-report.component.scss']
})
export class XBRLReportComponent implements OnInit {

  /** Minimum Due Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Due Date allowed. */
  maxDate = new Date();
  /** XBRL Form */
  xbrlForm: FormGroup;
  /** XML response from API */
  rawXml: any;
  /** Parsed xml data */
  xmlData: any[] = [];
  /** Collapsing Boolean */
  isCollapsed = true;
  /** Trusted url resource for xml download */
  fileUrl: any;
  /** Columns to be displayed in XBRL reports table */
  displayedColumns: string[] = ['name', 'dimension', 'value'];
  /** Data source for XBRL reports table */
  dataSource = new MatTableDataSource();

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private reportService: ReportsService,
              private formBuilder: FormBuilder,
              private datePipe: DatePipe,
              private sanitizer: DomSanitizer) {}

 /**
  * Creates the XBRL form.
  */
  ngOnInit() {
    this.createXbrlForm();
  }

  createXbrlForm() {
    this.xbrlForm = this.formBuilder.group({
    'startDate': ['', Validators.required],
    'endDate': ['', Validators.required],
    });
  }

  /**
   * Parses XML for mat-table data
   * @param {any} response XML API response
   */
  buildXMLTable(response: any) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(response, 'text/xml');
    xml.querySelectorAll('[contextRef]').forEach( (element: HTMLElement) => {
      const contextId = element.getAttribute('contextRef');
      const scenario = xml.querySelector(`#${contextId}`).querySelector('scenario');
      const context = scenario ? scenario.textContent : undefined;
      const entry = {
        name: element.tagName,
        dimension: context,
        value: new FormControl(element.textContent)
      };
      this.xmlData.push(entry);
    });
  }

  /**
   * Fetches XML Response, parses it and initializes mat-table with parsed data.
   */
  runreport() {
    const startDate: Date = this.xbrlForm.value.startDate;
    const endDate: Date = this.xbrlForm.value.endDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.xbrlForm.patchValue({
      startDate: this.datePipe.transform(startDate, dateFormat),
      endDate: this.datePipe.transform(endDate, dateFormat)
    });
    const dates = this.xbrlForm.value;
    this.reportService.getMixReport(dates).subscribe((response: any) => {
      this.rawXml = response;
      this.buildXMLTable(response);
      this.dataSource = new MatTableDataSource(this.xmlData);
      this.isCollapsed = false;
    });
  }

  /**
   * Outputs XML File with desired changes to entry values.
   */
  submit() {
    const parser = new DOMParser();
    const xmlDOM = parser.parseFromString(this.rawXml, 'text/xml');
    xmlDOM.querySelectorAll('[contextRef]').forEach( (element: HTMLElement) => {
      this.xmlData.forEach( (entry: any) => {
        if (entry.name === element.tagName) {
          element.textContent = entry.value.value;
        }
      });
    });
    const serializer = new XMLSerializer();
    const xml = serializer.serializeToString(xmlDOM);
    const blob = new Blob([xml], { type: 'application/octet-stream' });
    this.fileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(blob));
    return this.fileUrl;
  }

}
