/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { SystemService } from '../../system.service';

@Component({
  selector: 'mifosx-create-code',
  templateUrl: './create-code.component.html',
  styleUrls: ['./create-code.component.scss']
})
export class CreateCodeComponent implements OnInit {

  /** Code form. */
  codeForm: FormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private systemService: SystemService,
              private route: ActivatedRoute,
              private router: Router) { }

  /**
   * Creates the code form.
   */
  ngOnInit() {
    this.createCodeForm();
  }

  /**
   * Creates the create code form.
   */
  createCodeForm() {
    this.codeForm = this.formBuilder.group({
      'name': ['', Validators.required]
    });
  }

  /**
   * Submits the code form and creates a code,
   * if successful redirects to view created code.
   */
  submit() {
    this.systemService.createCode(this.codeForm.value)
      .subscribe((response: any) => {
        this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
