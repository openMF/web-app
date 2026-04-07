/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { ExternalServicesService } from '@fineract/client';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Amazon S3 Component.
 */
@Component({
  selector: 'mifosx-edit-amazon-s3',
  templateUrl: './edit-amazon-s3.component.html',
  styleUrls: ['./edit-amazon-s3.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIconButton,
    FaIconComponent
  ]
})
export class EditAmazonS3Component implements OnInit {
  /** Amazon S3 Configuration data */
  amazonS3ConfigurationData: any;
  /** Amazon S3 Configuration Form */
  amazonS3ConfigurationForm: UntypedFormGroup;
  /** Secret Key input field type. */
  secretKeyInputType: string;
  /** Access Key field type. */
  accessKeyInputType: string;

  /**
   * Retrieves the Amazon S3 configuration data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ExternalServicesService} externalServicesService External Services Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private externalServicesService: ExternalServicesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { amazonS3Configuration: any }) => {
      this.amazonS3ConfigurationData = data.amazonS3Configuration;
    });
  }

  /**
   * Creates Amazon S3 configuration form.
   */
  ngOnInit() {
    this.createAmazonS3ConfigurationForm();
    this.secretKeyInputType = 'password';
    this.accessKeyInputType = 'password';
  }

  /**
   * Creates Amazon S3 configuration form.
   */
  createAmazonS3ConfigurationForm() {
    this.amazonS3ConfigurationForm = this.formBuilder.group({
      s3_bucket_name: [
        this.amazonS3ConfigurationData[1].value,
        Validators.required
      ],
      s3_access_key: [
        this.amazonS3ConfigurationData[0].value,
        Validators.required
      ],
      s3_secret_key: [
        this.amazonS3ConfigurationData[2].value,
        Validators.required
      ]
    });
  }

  /**
   * Submits the Amazon S3 configuration and updates the Amazon S3 configuration,
   * if successful redirects to view Amazon S3 configuration.
   */
  submit() {
    const requestParams = {
      name: 'S3',
      body: this.amazonS3ConfigurationForm.value
    };
    const updateParams = {
      servicename: 'S3',
      putExternalServiceRequest: this.amazonS3ConfigurationForm.value
    };
    this.externalServicesService.updateExternalServiceProperties(updateParams).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
