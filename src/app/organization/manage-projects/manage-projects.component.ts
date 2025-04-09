import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { OrganizationService } from '../organization.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfigurationWizardService } from 'app/configuration-wizard/configuration-wizard.service';
import { PopoverService } from 'app/configuration-wizard/popover/popover.service';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { ContinueSetupDialogComponent } from 'app/configuration-wizard/continue-setup-dialog/continue-setup-dialog.component';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

@Component({
  selector: 'mifosx-manage-projects',
  templateUrl: './manage-projects.component.html',
  styleUrls: ['./manage-projects.component.scss']
})
export class ManageProjectsComponent implements OnInit {
  /** Manage Funds data. */
  projectsData: any[] = [];
  /** New Fund form */
  projectForm: any;
  /** Funds form reference */
  @ViewChild('formRef') formRef: any;

  /* Refernce of funds form */
  @ViewChild('projectFormRef') projectFormRef: ElementRef<any>;
  /* Template for popover on funds form */
  @ViewChild('templateFundFormRef') templateFundFormRef: TemplateRef<any>;
  /** Columns to be displayed in funds table. */
  displayedColumns: string[] = [
    'name',
    'country',
    'active',
    'occupancyPercentage',
    'amount',
    'rate'
  ];
  /** Data source for Funds table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for charges table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for charges table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the manage funds data from `resolve`.
   * @param {ActivatedRoute} route Activated Route
   * @param {FormBuilder} formBuilder Form Builder
   * @param {OrganizationService} organizationservice Organization Service
   * @param {MatDialog} dialog Mat Dialog
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private organizationservice: OrganizationService,
    public dialog: MatDialog,
    private router: Router,
    private configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService
  ) {
    this.route.data.subscribe((data: { projects: any }) => {
      this.projectsData = data.projects;
      this.dataSource = new MatTableDataSource(this.projectsData);
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.projectsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Filters data in charges table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Creates the fund form.
   */
  createFundForm() {
    this.projectForm = this.formBuilder.group({
      name: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Adds a new fund to the list.
   */
  addFund() {
    const newFund = this.projectForm.value;
    this.organizationservice.createFund(newFund).subscribe((response: any) => {
      this.projectsData.push({
        id: response.resourceId,
        name: newFund.name
      });
      this.formRef.resetForm();
      if (this.configurationWizardService.showManageFunds === true) {
        this.configurationWizardService.showManageFunds = false;
        this.openDialog();
      }
    });
  }

  /**
   * Edits the selected fund.
   * @param {string} fundId Fund Id.
   * @param {string} fundContent Fund's content.
   * @param {number} index  Index of fund.
   */
  editFund(fundId: string, fundContent: string, index: number) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'name',
        label: 'Fund Content',
        value: fundContent,
        type: 'text',
        required: true
      })

    ];
    const data = {
      title: 'Edit Fund',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editFundDialogRef = this.dialog.open(FormDialogComponent, { data });
    editFundDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.organizationservice.editFund(fundId, response.data.value).subscribe(() => {
          this.projectsData[index].name = response.data.value.name;
        });
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
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * Previous Step (Organization Page) Dialog Configuration Wizard.
   */
  previousStep() {
    this.router.navigate(['/organization']);
  }

  /**
   * Next Step (Manage Reports) Dialog Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showManageFunds = false;
    this.configurationWizardService.showManageReports = true;
    this.router.navigate(['/system']);
  }

  /**
   * Opens dialog if the user wants  to edit more funds.
   */
  openDialog() {
    const continueSetupDialogRef = this.dialog.open(ContinueSetupDialogComponent, {
      data: {
        stepName: 'fund'
      }
    });
    continueSetupDialogRef.afterClosed().subscribe((response: { step: number }) => {
      if (response.step === 1) {
        this.configurationWizardService.showManageFunds = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      } else if (response.step === 2) {
        this.configurationWizardService.showManageFunds = true;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/organization/manage-funds']);
      } else if (response.step === 3) {
        this.configurationWizardService.showManageFunds = false;
        this.configurationWizardService.showManageReports = true;
        this.router.navigate(['/system']);
      }
    });
  }
}
