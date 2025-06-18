/** Angular Imports */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { FindPipe } from '../../../../pipes/find.pipe';

/**
 * Campaign Preview Step.
 */
@Component({
  selector: 'mifosx-campaign-preview-step',
  templateUrl: './campaign-preview-step.component.html',
  styleUrls: ['./campaign-preview-step.component.scss'],
  imports: [
    MatList,
    MatListItem,
    MatInput,
    MatButton,
    RouterLink,
    TranslatePipe,
    FindPipe,
    NgxTranslatePipe
  ]
})
export class CampaignPreviewStepComponent implements OnInit {
  /** SMS Campaign */
  @Input() campaign: any;
  /** [Optional] SMS Campaign Template for create form */
  @Input() smsCampaignTemplate: any;
  /** [Optional] SMS Campaign Message for edit form */
  @Input() editedCampaignMessage: any;

  /** Trigger types options */
  triggerTypes: any[];
  /** SMS providers options */
  smsProviders: any[];

  /** Emits submit() event */
  @Output() submitEvent = new EventEmitter();

  constructor() {}

  /**
   * Sets SMS providers and trigger types options.
   */
  ngOnInit() {
    this.triggerTypes = this.smsCampaignTemplate.triggerTypeOptions;
    this.smsProviders = this.smsCampaignTemplate.smsProviderOptions;
  }
}
