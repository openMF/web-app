/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { CodesService } from '@fineract/client';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Code Component.
 */
@Component({
  selector: 'mifosx-edit-code',
  templateUrl: './edit-code.component.html',
  styleUrls: ['./edit-code.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class EditCodeComponent implements OnInit {
  /** Code Form */
  codeForm: UntypedFormGroup;
  /** Code Data */
  codeData: any;

  /**
   * Retrieves the code data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {CodesService} codesService Codes Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private codesService: CodesService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { code: any }) => {
      this.codeData = data.code;
    });
  }

  /**
   * Creates and sets the code form.
   */
  ngOnInit() {
    this.createCodeForm();
  }

  /**
   * Creates and sets code form.
   */
  createCodeForm() {
    this.codeForm = this.formBuilder.group({
      name: [
        this.codeData.name,
        Validators.required
      ]
    });
  }

  /**
   * Submits the code form and updates code,
   * if successful redirects to view updated code.
   */
  submit() {
    let codeId = this.codeData?.id;
    if (!codeId) {
      codeId = Number(this.route.snapshot.params['id']);
    }
    const payload = {
      codeId,
      putCodesRequest: {
        name: this.codeForm.value.name
      }
    };
    this.codesService.updateCode(payload).subscribe((response: any) => {
      this.router.navigate(
        [
          '../../',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}
