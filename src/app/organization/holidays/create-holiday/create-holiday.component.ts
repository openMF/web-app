/** Angular Imports. */
import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { FlatTreeControl } from '@angular/cdk/tree';
import { BehaviorSubject } from 'rxjs';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';

export class TodoItemNode {
  children: TodoItemNode[];
  item: string;
}

/** Flat office node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents an office.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {


  // rxjs functionality to update DOM via subscribe
  dataChange = new BehaviorSubject<TodoItemNode[]>([]);
  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }
  TREE_DATA = {};

  constructor() {
  }

  // called every time the data in route changes
  initialize(trie: any) {
    this.TREE_DATA = trie;
    const data = this.buildFileTree(this.TREE_DATA, 0);
    this.dataChange.next(data);
  }

  // builds hierarchical tree of TodoItemNodes
  buildFileTree(obj: { [key: string]: any }, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }
}

@Component({
  selector: 'mifosx-create-holiday',
  templateUrl: './create-holiday.component.html',
  styleUrls: ['./create-holiday.component.scss'],
  providers: [ChecklistDatabase],
})
export class CreateHolidayComponent implements OnInit {
  /** Create Holiday form. */
  holidayForm: FormGroup;
  /** Repayment Scheduling data. */
  repaymentSchedulingTypes: any;
  /** Offices Data */
  officesData: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  // Stores office data in a trie-like structure
  officesTrie: any;
  // Stores office data for access from DOM via Office ID
  officesDict = {};

  // Angular Material Tree Configuration start ------------

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  // Angular Material Tree Configuration end ------------

  /**
   * Get offices and holiday template from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {DatePipe} datePipe Date Pipe.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {Router} router Router.
   */
  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    private organizationService: OrganizationService,
    private router: Router,
    private _database: ChecklistDatabase
  ) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    // Listens for changes in CheckListDatabase
    this._database.dataChange.subscribe((data) => {
      this.dataSource.data = data;
    });

    this.route.data.subscribe((data: { offices: any; holidayTemplate: any }) => {
      this.officesData = data.offices;
      this.repaymentSchedulingTypes = data.holidayTemplate;
      // Constructs trie everytime data changes
      this.constructOfficeHierarchy();
      // Updates data in the CheckListDatabase
      _database.initialize(this.officesTrie);
    });
  }

  ngOnInit() {
    this.setHolidayForm();
    this.buildDependencies();
  }

  setEmptyObjectsToNull(root: any) {
    Object.keys(root).forEach((key) => {
      if (Object.keys(root[key]).length === 0) {
        root[key] = null;
      } else {
        this.setEmptyObjectsToNull(root[key]);
      }
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
    this.setEmptyObjectsToNull(trie);

    this.officesTrie = trie;
  }

  // angular material tree config start ----------------------

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item ? existingNode : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected =
      descendants.length > 0 &&
      descendants.every((child) => {
        return this.checklistSelection.isSelected(child);
      });
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
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
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.forEach((child) => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
    this.setSelectedOffices();
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
    this.setSelectedOffices();
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TodoItemFlatNode): void {
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
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
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

  /**
   * Sets Holiday Form.
   */
  setHolidayForm() {
    this.holidayForm = this.formBuilder.group({
      name: ['', Validators.required],
      fromDate: ['', Validators.required],
      toDate: ['', Validators.required],
      reschedulingType: ['', Validators.required],
      description: [''],
      offices: ['', Validators.required],
    });
  }

  /**
   * Sets the conditional controls.
   */
  buildDependencies() {
    this.holidayForm.get('reschedulingType').valueChanges.subscribe((option: any) => {
      if (option === 2) {
        this.holidayForm.addControl('repaymentsRescheduledTo', new FormControl('', Validators.required));
      } else {
        this.holidayForm.removeControl('repaymentsRescheduledTo');
      }
    });
  }

  /**
   * Submits the create holiday Form.
   */
  submit() {
    const dateFormat = 'yyyy-MM-dd';
    const locale = 'en';
    this.holidayForm.patchValue({
      fromDate: this.datePipe.transform(this.holidayForm.value.fromDate, dateFormat),
      toDate: this.datePipe.transform(this.holidayForm.value.toDate, dateFormat),
    });
    if (this.holidayForm.contains('repaymentsRescheduledTo')) {
      this.holidayForm.patchValue({
        repaymentsRescheduledTo: this.datePipe.transform(this.holidayForm.value.repaymentsRescheduledTo, dateFormat),
      });
    }
    const holiday = {
      ...this.holidayForm.value,
      dateFormat,
      locale,
    };
    this.organizationService.createHoliday(holiday).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }
}
