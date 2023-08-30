/** Angular Imports. */
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { OfficeItemNode } from './office-item.class';
import { OfficeItemFlatNode } from './office-flat-item.class';
import { ChecklistDatabase } from './checklist-db.class';
import { CreateHoliday } from './create-holiday.service';

/**
 * Create Holiday component.
 */
@Component({
  selector: 'mifosx-create-holiday',
  templateUrl: './create-holiday.component.html',
  styleUrls: ['./create-holiday.component.scss']
})
export class CreateHolidayComponent implements OnInit {

  /** Create Holiday form. */
  holidayForm: UntypedFormGroup;
  /** Repayment Scheduling data. */
  repaymentSchedulingTypes: any;
  /** Offices Data */
  officesData: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date(2100, 0, 1);
  // Stores office data in a trie-like structure
  officesTrie: any;
  // Stores office data for access from DOM via Office ID
  officesDict = {};

  // Angular Material Tree Configuration start ------------

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<OfficeItemFlatNode, OfficeItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<OfficeItemNode, OfficeItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: OfficeItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<OfficeItemFlatNode>;

  treeFlattener: MatTreeFlattener<OfficeItemNode, OfficeItemFlatNode>;

  dataSource: MatTreeFlatDataSource<OfficeItemNode, OfficeItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<OfficeItemFlatNode>(true /* multiple */);

  // Angular Material Tree Configuration end ------------

  /**
   * Get offices and holiday template from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {Router} router Router.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private dateUtils: Dates,
              private organizationService: OrganizationService,
              private settings: SettingsService,
              private router: Router,
              private _database: ChecklistDatabase,
              private createHoliday: CreateHoliday  ) {
    this.route.data.subscribe((data: { offices: any, holidayTemplate: any }) => {
      this.officesData = data.offices;
      this.repaymentSchedulingTypes = data.holidayTemplate;
      // Constructs trie everytime data changes
      this.constructOfficeHierarchy();
      // Updates data in the CheckListDatabase
      _database.initialize(this.officesTrie);
    });
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<OfficeItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    // Listens for changes in CheckListDatabase
    this._database.dataChange.subscribe((data) => {
      this.dataSource.data = data;
    });
  }
  constructOfficeHierarchy() {
    const trie = {};
    // Iterates over all the offices
    this.officesData.forEach((office: any) => {
      this.officesDict[office.id] = office;

      let hierarchy = office.hierarchy.split('.');

      // Removes empty strings
      hierarchy = hierarchy.filter((stage: any) => {
        return stage.length > 0;
      });

      // Temporary variable to store current object

      let root = trie;

      if (hierarchy.length === 0) {
        root[office.id] = {};
      } else {
        // Sets root as the first object
        root = trie[Object.keys(trie)[0]];
        // Construction of hierarchy via Depth First Search
          hierarchy.forEach((stage: string) => {
          if (!(stage in root)) {
            root[stage] = {};
          }
          root = root[stage];
        });
      }
    });

    // Sets leaf offices to null as per the requirement of Angular Material
    this.createHoliday.setEmptyObjectsToNull(trie);

    this.officesTrie = trie;
  }

  // angular material tree config start ----------------------

  getLevel = (node: OfficeItemFlatNode) => node.level;

  isExpandable = (node: OfficeItemFlatNode) => node.expandable;

  getChildren = (node: OfficeItemNode): OfficeItemNode[] => node.children;

  hasChild = (_: number, _nodeData: OfficeItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: OfficeItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: OfficeItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item ? existingNode : new OfficeItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: OfficeItemFlatNode): boolean {
    return this.checklistSelection.isSelected(node);
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: OfficeItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some((child) => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  setSelectedOffices() {
    this.holidayForm.patchValue({
      offices: this.checklistSelection.selected.map((item) => item.item),
    });
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  officeItemSelectionToggle(node: OfficeItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach((child) => this.checklistSelection.isSelected(child));
    this.setSelectedOffices();
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  officeLeafItemSelectionToggle(node: OfficeItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.setSelectedOffices();
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: OfficeItemFlatNode): void {
    let parent: OfficeItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: OfficeItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: OfficeItemFlatNode): OfficeItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }

  // angular material tree config end ----------------------

  ngOnInit() {
    this.setHolidayForm();
    this.buildDependencies();
  }

  /**
   * Sets Holiday Form.
   */
  setHolidayForm() {
    this.holidayForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'fromDate': ['', Validators.required],
      'toDate': ['', Validators.required],
      'reschedulingType': ['', Validators.required],
      'description': [''],
      'offices': ['', Validators.required]
    });
  }

  /**
   * Sets the conditional controls.
   */
  buildDependencies() {
    this.holidayForm.get('reschedulingType').valueChanges.subscribe((option: any) => {
      if (option === 2) {
        this.holidayForm.addControl('repaymentsRescheduledTo', new UntypedFormControl('', Validators.required));
      } else {
        this.holidayForm.removeControl('repaymentsRescheduledTo');
      }
    });
  }

  /**
   * Submits the create holiday Form.
   */
  submit() {
    const holidayFormData = this.holidayForm.value;
    const dateFormat = this.settings.dateFormat;
    const locale = this.settings.language.code;
    const prevFromDate: Date = this.holidayForm.value.fromDate;
    const prevToDate: Date = this.holidayForm.value.toDate;
    holidayFormData.fromDate = this.dateUtils.formatDate(prevFromDate, dateFormat);
    holidayFormData.toDate = this.dateUtils.formatDate(prevToDate, dateFormat);
    if (this.holidayForm.contains('repaymentsRescheduledTo')) {
      const prevRepaymentsRescheduledTo: Date = this.holidayForm.value.repaymentsRescheduledTo;
      holidayFormData.repaymentsRescheduledTo = this.dateUtils.formatDate(prevRepaymentsRescheduledTo, dateFormat);
    }
    const offices = this.holidayForm.value.offices.map((office: string) => {
      return {'officeId': Number.parseInt(office, 10)};
    });
    const data = {
      ...holidayFormData,
      dateFormat,
      locale,
      offices
    };
    this.organizationService.createHoliday(data).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
