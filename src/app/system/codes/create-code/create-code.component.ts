/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit  } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
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
  codeForm: UntypedFormGroup;

  /* Reference of create code form */
  @ViewChild('codeFormRef') codeFormRef: ElementRef<any>;
  /* Template for popover on create code form */
  @ViewChild('templateCodeFormRef') templateCodeFormRef: TemplateRef<any>;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private formBuilder: UntypedFormBuilder,
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

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showSystemCodesForm === true) {
      setTimeout(() => {
        this.showPopover(this.templateCodeFormRef, this.codeFormRef.nativeElement, 'right', true);
      });
    }
  }

  /**
   * Next Step (Roles and Permission) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showSystemCodesForm = false;
    this.configurationWizardService.showRolesandPermission = true;
    this.router.navigate(['/system']);
  }

  /**
   * Previous Step (Manage Codes Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showSystemCodesForm = false;
    this.configurationWizardService.showSystemCodesList = true;
    this.router.navigate(['/system/codes']);
  }
}
