/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { SystemService } from '../../system.service';

/**
 * Edit Code Component.
 */
@Component({
  selector: 'mifosx-edit-code',
  templateUrl: './edit-code.component.html',
  styleUrls: ['./edit-code.component.scss']
})
export class EditCodeComponent implements OnInit {

  /** Code Form */
  codeForm: FormGroup;
  /** Code Data */
  codeData: any;

  /**
   * Retrieves the code data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService System Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private systemService: SystemService,
              private route: ActivatedRoute,
              private router: Router) {
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
      'name': [this.codeData.name, Validators.required]
    });
  }

  /**
   * Submits the code form and updates code,
   * if successful redirects to view updated code.
   */
  submit() {
    this.systemService.updateCode(this.codeForm.value, this.codeData.id)
      .subscribe((response: any) => {
        this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
      });
  }

}
