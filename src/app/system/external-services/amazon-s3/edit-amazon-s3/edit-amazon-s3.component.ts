/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { SystemService } from 'app/system/system.service';

/**
 * Edit Amazon S3 Component.
 */
@Component({
  selector: 'mifosx-edit-amazon-s3',
  templateUrl: './edit-amazon-s3.component.html',
  styleUrls: ['./edit-amazon-s3.component.scss']
})
export class EditAmazonS3Component implements OnInit {

  /** Amazon S3 Configuration data */
  amazonS3ConfigurationData: any;
  /** Amazon S3 Configuration Form */
  amazonS3ConfigurationForm: FormGroup;

  /**
   * Retrieves the Amazon S3 configuration data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private systemService: SystemService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { amazonS3Configuration: any }) => {
      this.amazonS3ConfigurationData = data.amazonS3Configuration;
    });
  }

  /**
   * Creates Amazon S3 configuration form.
   */
  ngOnInit() {
    this.createAmazonS3ConfigurationForm();
  }

  /**
   * Creates Amazon S3 configuration form.
   */
  createAmazonS3ConfigurationForm() {
    this.amazonS3ConfigurationForm = this.formBuilder.group({
      's3_access_key': [this.amazonS3ConfigurationData[0].value, Validators.required],
      's3_bucket_name': [this.amazonS3ConfigurationData[1].value, Validators.required],
      's3_secret_key': [this.amazonS3ConfigurationData[2].value, Validators.required]
    });
  }

  /**
   * Submits the Amazon S3 configuration and updates the Amazon S3 configuration,
   * if successful redirects to view Amazon S3 configuration.
   */
  submit() {
    this.systemService
      .updateExternalConfiguration('S3', this.amazonS3ConfigurationForm.value)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }

}
