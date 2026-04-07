/** Angular Imports */
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatList, MatListItem } from '@angular/material/list';
import { FindPipe } from '../../../../pipes/find.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Campaign Preview Step.
 */
@Component({
  selector: 'mifosx-campaign-preview-step',
  templateUrl: './campaign-preview-step.component.html',
  styleUrls: ['./campaign-preview-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatList,
    MatListItem,
    FindPipe
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
