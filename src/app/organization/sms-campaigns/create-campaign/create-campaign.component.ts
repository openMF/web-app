/** Angular Imports */
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Components */
import { SmsCampaignStepComponent } from '../sms-campaign-stepper/sms-campaign-step/sms-campaign-step.component';
import { CampaignMessageStepComponent } from '../sms-campaign-stepper/campaign-message-step/campaign-message-step.component';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Create SMS Campaign Component
 */
@Component({
  selector: 'mifosx-create-campaign',
  templateUrl: './create-campaign.component.html',
  styleUrls: ['./create-campaign.component.scss']
})
export class CreateCampaignComponent {

  /** SMS Campaign Template */
  smsCampaignTemplate: any;
  /** Run report headers */
  templateParameters: any;

  /** SMS Campaign Step */
  @ViewChild(SmsCampaignStepComponent, { static: true }) smsCampaignStep: SmsCampaignStepComponent;
  /** Campaign Message Step */
  @ViewChild(CampaignMessageStepComponent, { static: true }) campaignMessageStep: CampaignMessageStepComponent;

  /**
   * Fetches campaign template from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {OrganizationService} organizationService Organization Service
   * @param {DatePipe} datePipe Date Pipe
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private organizationService: OrganizationService,
              private datePipe: DatePipe) {
    this.route.data.subscribe((data: { smsCampaignTemplate: any }) => {
      this.smsCampaignTemplate = data.smsCampaignTemplate;
    });
  }

  /**
   * Retrieves SMS Campaign forms in a single form group to check validity.
   */
  get smsCampaignForm() {
    return this.smsCampaignStep.smsCampaignFormGroup;
  }

  /**
   * Retrieves SMS Campaign object after formatting form values.
   */
  get smsCampaign() {
    return {
      ...this.smsCampaignStep.smsCampaignFormGroupValue,
      ...this.campaignMessageStep.campaignMessage
    };
  }

  /**
   * Passes template parameters to campaign-message-step.
   * @param {any} $event Template parameters
   */
  setParameters($event: any) {
    this.templateParameters = $event;
  }

  /**
   * Creates SMS Campaign.
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const dateTimeFormat = 'dd MMMM yyyy HH:mm:ss';
    const smsCampaign = {
      ...this.smsCampaign,
      campaignType: this.smsCampaign.isNotification ? 2 : 1,
      submittedOnDate: this.datePipe.transform(new Date(), dateFormat),
      dateTimeFormat,
      dateFormat,
      locale
    };
    if (this.smsCampaign.triggerType === 2) {
      const prevRecurrenceDate: Date = smsCampaign.recurrenceStartDate;
      smsCampaign.recurrenceStartDate = this.datePipe.transform(prevRecurrenceDate, dateTimeFormat);
    }
    this.organizationService.createSmsCampaign(smsCampaign).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
