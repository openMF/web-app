/** Angular Imports */
import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Resolve } from '@angular/router';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**Importing environment */
import { environment } from 'environments/environment';

/** Import EmbedDashboard SDK */
import { embedDashboard } from "@superset-ui/embedded-sdk";

/** Custom Service */
import { SupersetService } from './superset.service'; 


/**
 * Superset Component
 */
@Component({
  selector: 'mifosx-superset',
  templateUrl: './superset.component.html',
  styleUrls: ['./superset.component.scss']
})
export class SupersetComponent implements OnInit {

  /**
   * 
   * @param { ElementRef } elementRef 
   * @param { SupersetServiceService } embedService 
   */
  constructor(private elementRef: ElementRef,
    private embedService: SupersetService) { }

  ngOnInit(): void {
    this.embedSupersetDashboard();
  }

  embedSupersetDashboard(): void {
    const dashboardElement = this.elementRef.nativeElement.querySelector('#dashboard');

    if (dashboardElement) {
      this.embedService.embedDashboard().subscribe(
        () => {
          // Adjust the size of the embedded iframe
          const iframe = dashboardElement.querySelector('iframe');
          if (iframe) {
            iframe.style.width = '100%'; // Set the width as needed
            iframe.style.height = '1000px'; // Set the height as needed
          }
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }
}