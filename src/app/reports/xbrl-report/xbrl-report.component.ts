/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, UntypedFormControl} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { DomSanitizer } from '@angular/platform-browser';

/** Custom Services */
import { ReportsService } from '../reports.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

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
  xbrlForm: UntypedFormGroup;
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
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(private reportService: ReportsService,
              private formBuilder: UntypedFormBuilder,
              private settingsService: SettingsService,
              private dateUtils: Dates,
              private sanitizer: DomSanitizer) {}

 /**
  * Creates the XBRL form.
  */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
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
        value: new UntypedFormControl(element.textContent)
      };
      this.xmlData.push(entry);
    });
  }

  /**
   * Fetches XML Response, parses it and initializes mat-table with parsed data.
   */
  runreport() {
    const xbrlFormData = this.xbrlForm.value;
    const prevStartDate: Date = this.xbrlForm.value.startDate;
    const prevEndDate: Date = this.xbrlForm.value.endDate;
    const dateFormat = this.settingsService.dateFormat;
    if (xbrlFormData.startDate instanceof Date) {
      xbrlFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    if (xbrlFormData.endDate instanceof Date) {
      xbrlFormData.endDate = this.dateUtils.formatDate(prevEndDate, dateFormat);
    }
    this.reportService.getMixReport(xbrlFormData).subscribe((response: any) => {
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

