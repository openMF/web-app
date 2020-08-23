/** Angular Imports */
import { Component, OnInit, Renderer2, ViewChild, ElementRef, SecurityContext } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { ClientsService } from 'app/clients/clients.service';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * Client Screen Reports Component.
 */
@Component({
  selector: 'mifosx-client-screen-reports',
  templateUrl: './client-screen-reports.component.html',
  styleUrls: ['./client-screen-reports.component.scss']
})
export class ClientScreenReportsComponent implements OnInit {

  /** Client Screen Reportform. */
  clientScreenReportForm: FormGroup;
  /** Templates Data */
  templatesData: any;
  /** Client Id */
  clientId: any;
  /** HTML Template */
  template: any;

  /** Screen report output reference */
  @ViewChild('screenReport', { static: true }) screenReportRef: ElementRef;

  /**
   * Fetches Client Action Data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ClientsService} clientsService Clients Service
   * @param {ActivatedRoute} route Activated Route
   * @param {DomSanitizer} sanitizer DOM Sanitizer
   * @param {Renderer2} renderer Renderer 2
   */
  constructor(private formBuilder: FormBuilder,
              private clientsService: ClientsService,
              private route: ActivatedRoute,
              private sanitizer: DomSanitizer,
              private renderer: Renderer2) {
    this.route.data.subscribe((data: { clientActionData: any }) => {
      this.templatesData = data.clientActionData;
    });
    this.clientId = this.route.parent.snapshot.params['clientId'];
  }

  /**
   * Creates the client screen report form.
   */
  ngOnInit() {
    this.createClientScreenReportForm();
  }

  /**
   * Creates the client screen report form.
   */
  createClientScreenReportForm() {
    this.clientScreenReportForm = this.formBuilder.group({
      'templateId': ['']
    });
  }

  /**
   * Prints client screen report
   */
  print() {
    const templateWindow = window.open('', 'Screen Report', 'height=400,width=600');
    templateWindow.document.write('<html><head>');
    templateWindow.document.write('</head><body>');
    templateWindow.document.write(this.template);
    templateWindow.document.write('</body></html>');
    templateWindow.print();
    templateWindow.close();
  }

  /**
   * Submits the form and generates screen report for the client.
   */
  generate() {
    const templateId = this.clientScreenReportForm.get('templateId').value;
    this.clientsService.retrieveClientReportTemplate(templateId, this.clientId).subscribe((response: any) => {
      this.template = this.sanitizer.sanitize(SecurityContext.HTML, response);
      this.renderer.setProperty(this.screenReportRef.nativeElement, 'innerHTML', this.template);
    });
  }

}
