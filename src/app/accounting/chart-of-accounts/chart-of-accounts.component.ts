/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow,
  MatNoDataRow
} from '@angular/material/table';
import { FormControl, UntypedFormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** rxjs Imports */
import { merge } from 'rxjs';

/** Custom Models */
import { GLAccountNode } from './gl-account-node.model';

/** Custom Utils */
import { sanitizeCsvValue } from 'app/core/utils/csv.utils';

/** Custom Services */
import { GlAccountTreeService, GLAccountType, GL_ACCOUNT_TYPES } from './gl-account-tree.service';
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatActionList, MatListItem } from '@angular/material/list';
import { MatSelectTrigger } from '@angular/material/select';
import { MatPrefix } from '@angular/material/form-field';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatIconButton } from '@angular/material/button';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Account usage filter option. */
type UsageFilter = 'ALL' | 'HEADER' | 'DETAIL';
/** Account status filter option. */
type StatusFilter = 'ALL' | 'ACTIVE' | 'DISABLED';
/** Account type filter option. */
type TypeFilter = 'ALL' | GLAccountType;

/** A row of the chart of accounts tree table. */
export interface GLAccountTreeRow {
  /** Account type group or GL Account shown in the row. */
  node: GLAccountNode;
  /** Depth of the row in the tree. (0 for account type groups) */
  level: number;
  /** One entry per ancestor level, used to draw the guide lines. */
  guides: number[];
  /** Whether the row has children that can be shown. */
  expandable: boolean;
  /** Whether the children of the row are shown. */
  expanded: boolean;
}

/**
 * Chart of accounts component.
 */
@Component({
  selector: 'mifosx-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonToggleGroup,
    MatButtonToggle,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatNoDataRow,
    MatPaginator,
    MatIconButton,
    MatChipListbox,
    MatChipOption,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatActionList,
    MatListItem,
    MatSelectTrigger,
    MatPrefix
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartOfAccountsComponent implements AfterViewInit, OnInit {
  private glAccountTreeService = inject(GlAccountTreeService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private configurationWizardService = inject(ConfigurationWizardService);
  private popoverService = inject(PopoverService);

  /** Button toggle group form control for type of view. (list/tree) */
  viewGroup = new UntypedFormControl('treeView');
  /** Search by account name or GL code. */
  searchControl = new FormControl('', { nonNullable: true });
  /** Account usage filter. (ALL/HEADER/DETAIL) */
  usageControl = new FormControl<UsageFilter>('ALL', { nonNullable: true });
  /** Account status filter. (ALL/ACTIVE/DISABLED) */
  statusControl = new FormControl<StatusFilter>('ALL', { nonNullable: true });
  /** Account type filter. (ALL or one of the account types) */
  typeControl = new FormControl<TypeFilter>('ALL', { nonNullable: true });

  /** Account types in display order. */
  accountTypes = GL_ACCOUNT_TYPES;
  /** Translation keys of the account type group names. */
  typeLabels: Record<string, string> = {
    ASSET: 'labels.heading.Assets',
    LIABILITY: 'labels.heading.Liabilities',
    EQUITY: 'labels.inputs.Equity',
    INCOME: 'labels.heading.Income',
    EXPENSE: 'labels.heading.Expenses'
  };
  /** Account usage filter options and their translation keys. */
  usageOptions: UsageFilter[] = [
    'ALL',
    'HEADER',
    'DETAIL'
  ];
  usageLabels: Record<UsageFilter, string> = {
    ALL: 'labels.inputs.All',
    HEADER: 'labels.inputs.Header',
    DETAIL: 'labels.inputs.Detail'
  };
  /** Account status filter options and their translation keys. */
  statusOptions: StatusFilter[] = [
    'ALL',
    'ACTIVE',
    'DISABLED'
  ];
  statusLabels: Record<StatusFilter, string> = {
    ALL: 'labels.inputs.All',
    ACTIVE: 'labels.inputs.Active',
    DISABLED: 'labels.inputs.Disabled'
  };
  /** Number of accounts of each account type. */
  typeCounts: Record<string, number> = {};
  /** Total number of accounts. */
  totalAccounts = 0;

  /** GL Account data. */
  glAccountData: any;
  /** Chart of accounts tree. (one group per account type) */
  treeData: GLAccountNode[] = [];
  /** All GL Accounts as a flat list. */
  accountNodes: GLAccountNode[] = [];
  /** Nodes of the tree whose children are shown. */
  expandedNodes = new Set<GLAccountNode>();
  /** Rows shown in the chart of accounts tree table. */
  treeRows: GLAccountTreeRow[] = [];
  /** Number of accounts shown in the chart of accounts tree table. */
  shownAccounts = 0;

  /** Columns to be displayed in chart of accounts tree table. */
  treeColumns: string[] = [
    'account',
    'glCode',
    'usage',
    'manualEntries',
    'status',
    'actions'
  ];
  /** Columns to be displayed in chart of accounts table. */
  displayedColumns: string[] = [
    'name',
    'glCode',
    'glAccountType',
    'usedAs',
    'manualEntriesAllowed',
    'disabled',
    'actions'
  ];
  /** Data source for chart of accounts table. */
  tableDataSource = new MatTableDataSource<GLAccountNode>([]);
  /** Selected GL Account. */
  glAccount: GLAccountNode | undefined;
  /** Path from the account type to the selected GL Account. */
  glAccountPath: GLAccountNode[] = [];
  /** GL codes of the sub-accounts that do not follow the code of the selected GL Account. */
  codesOutsideRange: string[] = [];

  /** Paginator for chart of accounts table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for chart of accounts table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of Tree View Button */
  @ViewChild('buttonTreeView') buttonTreeView: ElementRef<any>;
  /* Template for popover on tree view button */
  @ViewChild('templateButtonTreeView') templateButtonTreeView: TemplateRef<any>;
  /* Reference of Accounts Table */
  @ViewChild('accountsTable') accountsTable: ElementRef<any>;
  /* Template for popover on accounts table */
  @ViewChild('templateAccountsTable') templateAccountsTable: TemplateRef<any>;

  /**
   * Retrieves the gl accounts data from `resolve` and initializes(generates) gl accounts tree.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe((data: { chartOfAccounts: any }) => {
      this.glAccountData = data.chartOfAccounts;
      this.glAccountTreeService.initialize(this.glAccountData);
    });
  }

  /**
   * Initializes the data source for chart of accounts table and tree.
   */
  ngOnInit() {
    this.glAccountTreeService.treeDataChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((glAccountTreeData: GLAccountNode[]) => {
        this.setTreeData(glAccountTreeData);
      });

    merge(
      this.searchControl.valueChanges,
      this.usageControl.valueChanges,
      this.statusControl.valueChanges,
      this.typeControl.valueChanges
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.applyFilters());
  }

  /**
   * Initializes the paginator and sorter for chart of accounts table.
   */
  ngAfterViewInit() {
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sortingDataAccessor = (glAccount: GLAccountNode, property: string) => {
      switch (property) {
        case 'glAccountType':
          return glAccount.type;
        case 'usedAs':
          return glAccount.usage;
        case 'disabled':
          return glAccount.disabled ? 1 : 0;
        case 'manualEntriesAllowed':
          return glAccount.manualEntriesAllowed ? 1 : 0;
        default:
          return (glAccount as any)[property];
      }
    };
    this.tableDataSource.sort = this.sort;
    if (this.configurationWizardService.showChartofAccountsPage) {
      setTimeout(() => {
        this.showPopover(this.templateButtonTreeView, this.buttonTreeView.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showChartofAccountsList) {
      setTimeout(() => {
        this.showPopover(this.templateAccountsTable, this.accountsTable.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Sets the chart of accounts tree, and shows the accounts of the first account type that has any.
   * @param {GLAccountNode[]} treeData Chart of accounts tree.
   */
  private setTreeData(treeData: GLAccountNode[]) {
    this.treeData = treeData;
    this.accountNodes = [];
    this.typeCounts = {};
    for (const typeGroup of treeData) {
      const accounts = this.getDescendants(typeGroup);
      this.typeCounts[typeGroup.type] = accounts.length;
      this.accountNodes.push(...accounts);
    }
    this.totalAccounts = this.accountNodes.length;

    this.expandedNodes.clear();
    const firstTypeGroup = treeData.find((typeGroup) => typeGroup.children.length);
    if (firstTypeGroup) {
      this.expandedNodes.add(firstTypeGroup);
      this.getDescendants(firstTypeGroup).forEach((node) => this.expandedNodes.add(node));
    }
    this.glAccount = undefined;
    this.updateRows();
  }

  /**
   * Gets all the GL Accounts below the given node.
   */
  private getDescendants(node: GLAccountNode): GLAccountNode[] {
    return node.children.reduce(
      (descendants: GLAccountNode[], child) => descendants.concat(child, this.getDescendants(child)),
      []
    );
  }

  /** Whether the search, usage or status filter is in use. */
  get isFiltering(): boolean {
    return !!this.searchText || this.usageControl.value !== 'ALL' || this.statusControl.value !== 'ALL';
  }

  /** Search text in lower case. */
  private get searchText(): string {
    return this.searchControl.value.trim().toLowerCase();
  }

  /**
   * Checks if a GL Account matches the search, usage, status and account type filters.
   */
  private matchesFilters(node: GLAccountNode): boolean {
    const search = this.searchText;
    const usage = this.usageControl.value;
    const status = this.statusControl.value;
    const type = this.typeControl.value;
    return (
      (!search || node.name.toLowerCase().includes(search) || node.glCode.toLowerCase().includes(search)) &&
      (usage === 'ALL' || node.usage === usage) &&
      (status === 'ALL' || node.disabled === (status === 'DISABLED')) &&
      (type === 'ALL' || node.type === type)
    );
  }

  /**
   * Applies the filters, and opens the groups that contain matching accounts so they can be seen.
   */
  private applyFilters() {
    if (this.isFiltering) {
      this.expandedNodes.clear();
      for (const node of this.accountNodes.filter((account) => this.matchesFilters(account))) {
        for (let parent = node.parent; parent; parent = parent.parent) {
          this.expandedNodes.add(parent);
        }
        const typeGroup = this.treeData.find((group) => group.type === node.type);
        if (typeGroup) {
          this.expandedNodes.add(typeGroup);
        }
      }
    } else if (this.typeControl.value !== 'ALL') {
      const typeGroup = this.treeData.find((group) => group.type === this.typeControl.value);
      if (typeGroup) {
        this.expandedNodes.add(typeGroup);
      }
    }
    this.updateRows();
  }

  /**
   * Updates the rows of the chart of accounts tree table and the data of the chart of accounts table.
   */
  private updateRows() {
    const filtering = this.isFiltering;
    const type = this.typeControl.value;
    const matching = this.accountNodes.filter((node) => this.matchesFilters(node));

    // An account is shown in the tree if it matches the filters or leads to an account that does
    const visible = new Set<GLAccountNode>();
    if (filtering) {
      for (const node of matching) {
        for (let current: GLAccountNode | undefined = node; current; current = current.parent) {
          visible.add(current);
        }
      }
    }

    const rows: GLAccountTreeRow[] = [];
    let shownAccounts = 0;
    const addRows = (node: GLAccountNode, level: number) => {
      const children = filtering ? node.children.filter((child) => visible.has(child)) : node.children;
      const expanded = children.length > 0 && this.expandedNodes.has(node);
      rows.push({
        node,
        level,
        guides: Array.from({ length: level }, (_, index) => index),
        expandable: children.length > 0,
        expanded
      });
      if (!node.isTypeGroup) {
        shownAccounts++;
      }
      if (expanded) {
        children.forEach((child) => addRows(child, level + 1));
      }
    };
    for (const typeGroup of this.treeData) {
      const hasMatches = !filtering || typeGroup.children.some((child) => visible.has(child));
      if ((type === 'ALL' || typeGroup.type === type) && hasMatches) {
        addRows(typeGroup, 0);
      }
    }

    // Close the details of the selected account when the filters hide it
    if (this.glAccount && !visible.has(this.glAccount) && !matching.includes(this.glAccount)) {
      this.closeDetails();
    }

    this.treeRows = rows;
    this.shownAccounts = shownAccounts;
    this.tableDataSource.data = matching;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Tracks the rows of the tree by their node, so toggling a group does not re-render every row.
   */
  trackRow = (_: number, row: GLAccountTreeRow) => row.node;

  /**
   * Shows or hides the children of a row of the tree.
   * @param {GLAccountTreeRow} row Row of the tree.
   */
  toggleRow(row: GLAccountTreeRow, event?: Event) {
    event?.stopPropagation();
    if (!row.expandable) {
      return;
    }
    if (this.expandedNodes.has(row.node)) {
      this.expandedNodes.delete(row.node);
    } else {
      this.expandedNodes.add(row.node);
    }
    this.updateRows();
  }

  /**
   * Selects the GL Account of a row of the tree, or toggles the row if it is an account type group.
   * @param {GLAccountTreeRow} row Row of the tree.
   */
  selectRow(row: GLAccountTreeRow) {
    if (row.node.isTypeGroup) {
      this.toggleRow(row);
    } else {
      this.viewGLAccountNode(row.node);
    }
  }

  /**
   * Checks if a keyboard event was triggered on the row itself, and not on a button inside the row.
   * @param {Event} event Keyboard event of the row.
   */
  isRowTarget(event: Event): boolean {
    return event.target === event.currentTarget;
  }

  /**
   * Expands the whole tree.
   */
  expandAll() {
    this.treeData.forEach((typeGroup) => this.expandedNodes.add(typeGroup));
    this.accountNodes.forEach((node) => this.expandedNodes.add(node));
    this.updateRows();
  }

  /**
   * Collapses the whole tree.
   */
  collapseAll() {
    this.expandedNodes.clear();
    this.updateRows();
  }

  /**
   * View selected gl account.
   * @param {GLAccountNode} glAccount GL Account to be viewed.
   */
  viewGLAccountNode(glAccount: GLAccountNode) {
    if (!glAccount || glAccount.isTypeGroup) {
      this.closeDetails();
      return;
    }
    this.glAccount = glAccount;
    this.glAccountPath = [];
    for (let current: GLAccountNode | undefined = glAccount; current; current = current.parent) {
      this.glAccountPath.unshift(current);
    }
    this.codesOutsideRange = this.getCodesOutsideRange(glAccount);
  }

  /**
   * Closes the details of the selected gl account.
   */
  closeDetails() {
    this.glAccount = undefined;
    this.glAccountPath = [];
    this.codesOutsideRange = [];
  }

  /**
   * Gets the GL codes of the sub-accounts that do not start with the significant digits of the code of
   * their parent. (for example, sub-accounts of 1100 are expected to start with 11)
   * Only parents whose code ends in zeros define such a range.
   * @param {GLAccountNode} glAccount Parent GL Account.
   * @returns {string[]} GL codes outside the range of the parent.
   */
  private getCodesOutsideRange(glAccount: GLAccountNode): string[] {
    if (!/^\d+$/.test(glAccount.glCode)) {
      return [];
    }
    const prefix = glAccount.glCode.replace(/0+$/, '');
    // A code without trailing zeros (or made only of zeros) does not define a range
    if (!prefix || prefix === glAccount.glCode) {
      return [];
    }
    return glAccount.children.filter((child) => !child.glCode.startsWith(prefix)).map((child) => child.glCode);
  }

  /**
   * Downloads the accounts that match the current filters as a CSV file.
   */
  exportAccounts() {
    const header = [
      'GL Code',
      'Account Name',
      'Account Type',
      'Account Usage',
      'Parent GL Code',
      'Manual Entries Allowed',
      'Disabled',
      'Tag',
      'Description'
    ];
    const rows = this.tableDataSource.data.map((node) =>
      [
        node.glCode,
        node.name,
        node.type,
        node.usage,
        node.parent?.glCode,
        node.manualEntriesAllowed,
        node.disabled,
        node.tagName,
        node.description
      ]
        .map((value) => `"${sanitizeCsvValue(value).replace(/"/g, '""')}"`)
        .join()
    );
    const csv = [
      header.join(),
      ...rows
    ].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Chart of Accounts.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
   * Next Step (Create Charts of Accounts Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showChartofAccountsPage = false;
    this.configurationWizardService.showChartofAccountsList = false;
    this.configurationWizardService.showChartofAccountsForm = true;
    this.router.navigate(['/accounting/chart-of-accounts/gl-accounts/create']);
  }

  /**
   * Previous Step (Charts of Accounts Accounting Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showChartofAccountsPage = false;
    this.configurationWizardService.showChartofAccountsList = false;
    this.configurationWizardService.showChartofAccounts = true;
    this.router.navigate(['/accounting']);
  }
}
