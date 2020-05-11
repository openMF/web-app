/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit  } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { SystemService } from '../../system.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { PopoverRef } from '../../../configuration-wizard/popover/popover-ref';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

@Component({
  selector: 'mifosx-create-code',
  templateUrl: './create-code.component.html',
  styleUrls: ['./create-code.component.scss']
})
export class CreateCodeComponent implements OnInit, AfterViewInit {

  /** Code form. */
  codeForm: FormGroup;
  @ViewChild('codeFormRef') codeFormRef: ElementRef<any>;
  @ViewChild('templateCodeFormRef') templateCodeFormRef: TemplateRef<any>;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
              private systemService: SystemService,
              private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) { }

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
        if (this.configurationWizardService.showSystemCodesForm === true) {
          this.configurationWizardService.showSystemCodesForm = false;
          this.configurationWizardService.showRolesandPermission = true;
          this.router.navigate(['/system']);
        } else {
        this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
        }
    });
  }

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showSystemCodesForm === true) {
      setTimeout(() => {
        this.showPopover(this.templateCodeFormRef, this.codeFormRef.nativeElement, 'right', true);
      });
    }
  }

  nextStep() {
    this.configurationWizardService.showSystemCodesForm = false;
    this.configurationWizardService.showRolesandPermission = true;
    this.router.navigate(['/system']);
  }

  previousStep() {
    this.configurationWizardService.showSystemCodesForm = false;
    this.configurationWizardService.showSystemCodesList = true;
    this.router.navigate(['/system/codes']);
  }
}
