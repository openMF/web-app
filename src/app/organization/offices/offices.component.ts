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
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject,
  DestroyRef
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';
import { MatIconButton } from '@angular/material/button';
import { MatPrefix } from '@angular/material/form-field';
import { MatActionList, MatListItem } from '@angular/material/list';
import { MatMenu, MatMenuContent, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
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
import { ActivatedRoute, Router } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/** Custom Utils */
import { sanitizeCsvValue } from 'app/core/utils/csv.utils';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { OfficeTreeService } from './office-tree-service.service';

/** Custom Model */
import { Office, OfficeNode } from './office-node.model';

/** Custom Components */
import { ExternalIdentifierComponent } from '../../shared/external-identifier/external-identifier.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** A row of the offices tree table. */
export interface OfficeTreeRow {
  /** Office shown in the row. */
  node: OfficeNode;
  /** Depth of the row in the tree. */
  level: number;
  /** One entry per ancestor level, used to draw the guide lines. */
  guides: number[];
  /** Whether the row has sub-offices that can be shown. */
  expandable: boolean;
  /** Whether the sub-offices of the row are shown. */
  expanded: boolean;
}

/**
 * Offices component.
 */
@Component({
  selector: 'mifosx-offices',
  templateUrl: './offices.component.html',
  styleUrls: ['./offices.component.scss'],
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
    MatPrefix,
    MatMenu,
    MatMenuContent,
    MatMenuItem,
    MatMenuTrigger,
    MatActionList,
    MatListItem,
    ExternalIdentifierComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OfficesComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private officeTreeService = inject(OfficeTreeService);
  private popoverService = inject(PopoverService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  protected configurationWizardService = inject(ConfigurationWizardService);

  /** Button toggle group form control for type of view. (list/tree) */
  viewGroup = new FormControl('treeView', { nonNullable: true });
  /** Search by office name or external id. */
  searchControl = new FormControl('', { nonNullable: true });

  /** Offices tree. */
  treeData: OfficeNode[] = [];
  /** All offices as a flat list. */
  officeNodes: OfficeNode[] = [];
  /** Offices whose sub-offices are shown. */
  expandedNodes = new Set<OfficeNode>();
  /** Offices that were expanded before searching, restored once the search is cleared. */
  private expandedBeforeSearch: Set<OfficeNode> | undefined;
  /** Rows shown in the offices tree table. */
  treeRows: OfficeTreeRow[] = [];
  /** Number of offices that match the search. */
  shownOffices = 0;

  /** Columns to be displayed in offices tree table. */
  treeColumns: string[] = [
    'office',
    'externalId',
    'openingDate',
    'actions'
  ];
  /** Columns to be displayed in offices table. */
  displayedColumns: string[] = [
    'name',
    'externalId',
    'parentName',
    'openingDate',
    'actions'
  ];
  /** Data source for offices table. */
  dataSource = new MatTableDataSource<OfficeNode>([]);
  /** Selected Office. */
  office: OfficeNode | undefined;
  /** Offices above the selected office, starting from the top level. */
  officePath: OfficeNode[] = [];

  /** Paginator for offices table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for offices table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of tree view button */
  @ViewChild('buttonTreeView') buttonTreeView: ElementRef<any>;
  /* Template for popover on tree view button */
  @ViewChild('templateButtonTreeView') templateButtonTreeView: TemplateRef<any>;
  /* Reference of offices table */
  @ViewChild('tableOffices') tableOffices: ElementRef<any>;
  /* Template for popover on offices table */
  @ViewChild('templateTableOffices') templateTableOffices: TemplateRef<any>;

  /**
   * Retrieves the offices data from `resolve`.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed()).subscribe((data: { offices: Office[] }) => {
      this.officeTreeService.initialize(data.offices);
    });
  }

  /**
   * Sets the offices tree and table, and searches them as the search text changes.
   */
  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (office: OfficeNode, property: string) => {
      if (property === 'openingDate') {
        return this.getIsoDate(office.openingDate);
      }
      return String(office[property as keyof OfficeNode] ?? '').toLowerCase();
    };

    this.officeTreeService.treeDataChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((treeData: OfficeNode[]) => this.setTreeData(treeData));

    this.searchControl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.applySearch());
  }

  /**
   * Sets the offices tree, and shows the first level of sub-offices.
   * @param {OfficeNode[]} treeData Offices tree.
   */
  private setTreeData(treeData: OfficeNode[]) {
    this.treeData = treeData;
    this.officeNodes = this.flatten(treeData);
    this.expandedNodes = new Set(treeData);
    this.expandedBeforeSearch = undefined;
    this.closeOffice();
    this.applySearch();
  }

  /**
   * Gets the given offices and all the offices below them.
   * @param {OfficeNode[]} offices Offices.
   */
  private flatten(offices: OfficeNode[]): OfficeNode[] {
    return offices.flatMap((office) => [
      office,
      ...this.flatten(office.children)
    ]);
  }

  /** Search text in lower case. */
  private get searchText(): string {
    return this.searchControl.value.trim().toLowerCase();
  }

  /**
   * Checks if an office matches the search.
   * @param {OfficeNode} office Office.
   */
  private matchesSearch(office: OfficeNode): boolean {
    const search = this.searchText;
    return (
      !search || office.name.toLowerCase().includes(search) || (office.externalId || '').toLowerCase().includes(search)
    );
  }

  /**
   * Gets the offices above the given office, starting from its parent.
   * @param {OfficeNode} office Office.
   */
  private getAncestors(office: OfficeNode): OfficeNode[] {
    const ancestors: OfficeNode[] = [];
    for (let parent = office.parent; parent; parent = parent.parent) {
      ancestors.push(parent);
    }
    return ancestors;
  }

  /**
   * Applies the search, and opens the offices that contain matching offices so they can be seen.
   */
  private applySearch() {
    const matching = this.officeNodes.filter((office) => this.matchesSearch(office));
    if (this.searchText) {
      this.expandedBeforeSearch ??= this.expandedNodes;
      this.expandedNodes = new Set(matching.flatMap((office) => this.getAncestors(office)));
    } else if (this.expandedBeforeSearch) {
      this.expandedNodes = this.expandedBeforeSearch;
      this.expandedBeforeSearch = undefined;
    }

    // Close the details of the selected office when the search hides it
    if (this.office && !matching.includes(this.office)) {
      this.closeOffice();
    }

    this.shownOffices = matching.length;
    this.dataSource.data = matching;
    this.updateRows();
  }

  /**
   * Updates the rows of the offices tree table.
   */
  private updateRows() {
    // An office is shown in the tree if it matches the search or leads to an office that does
    const visible = new Set<OfficeNode>();
    for (const office of this.dataSource.data) {
      visible.add(office);
      this.getAncestors(office).forEach((ancestor) => visible.add(ancestor));
    }

    const rows: OfficeTreeRow[] = [];
    const addRows = (node: OfficeNode, level: number) => {
      if (!visible.has(node)) {
        return;
      }
      const expandable = node.children.some((child) => visible.has(child));
      const expanded = expandable && this.expandedNodes.has(node);
      rows.push({
        node,
        level,
        guides: Array.from({ length: level }, (_, index) => index),
        expandable,
        expanded
      });
      if (expanded) {
        node.children.forEach((child) => addRows(child, level + 1));
      }
    };
    this.treeData.forEach((office) => addRows(office, 0));

    this.treeRows = rows;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Tracks the rows of the tree by their office, so toggling an office does not re-render every row.
   */
  trackRow = (_: number, row: OfficeTreeRow) => row.node;

  /**
   * Shows or hides the sub-offices of a row of the tree.
   * @param {OfficeTreeRow} row Row of the tree.
   * @param {Event} event Event that triggered the toggle.
   */
  toggleRow(row: OfficeTreeRow, event: Event) {
    event.stopPropagation();
    if (this.expandedNodes.has(row.node)) {
      this.expandedNodes.delete(row.node);
    } else {
      this.expandedNodes.add(row.node);
    }
    this.updateRows();
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
    this.expandedNodes = new Set(this.officeNodes);
    this.updateRows();
  }

  /**
   * Collapses the whole tree.
   */
  collapseAll() {
    this.expandedNodes = new Set();
    this.updateRows();
  }

  /**
   * View selected office, and open the offices above it so its row can be seen.
   * @param {OfficeNode} office Office to be viewed.
   */
  viewOfficeNode(office: OfficeNode) {
    const ancestors = this.getAncestors(office);
    this.office = office;
    this.officePath = [...ancestors].reverse();
    ancestors.forEach((ancestor) => this.expandedNodes.add(ancestor));
    this.updateRows();
  }

  /**
   * Closes the current view for office
   */
  closeOffice() {
    this.office = undefined;
    this.officePath = [];
  }

  /**
   * Gets a date of the server in ISO format.
   * @param {number[] | string | undefined} date Date as [year, month, day] or as a string.
   */
  private getIsoDate(date: number[] | string | undefined): string {
    return Array.isArray(date) ? date.map((part) => String(part).padStart(2, '0')).join('-') : date || '';
  }

  /**
   * Downloads the offices that match the search as a CSV file.
   */
  exportOffices() {
    const header = [
      'Office Name',
      'External ID',
      'Parent Office',
      'Opened On'
    ];
    const rows = this.dataSource.data.map((office) =>
      [
        office.name,
        office.externalId,
        office.parentName,
        this.getIsoDate(office.openingDate)
      ]
        .map((value) => `"${sanitizeCsvValue(value).replace(/"/g, '""')}"`)
        .join()
    );
    const csv = [
      header.join(),
      ...rows
    ].join('\r\n');
    // The byte order mark lets spreadsheets read accented office names
    const url = URL.createObjectURL(
      new Blob(
        [
          '﻿',
          csv
        ],
        { type: 'text/csv;charset=utf-8' }
      )
    );
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'Offices.csv');
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
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showOfficeList) {
      setTimeout(() => {
        this.showPopover(this.templateButtonTreeView, this.buttonTreeView.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showOfficeTable) {
      setTimeout(() => {
        this.showPopover(this.templateTableOffices, this.tableOffices.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Next Step (Create Office Form) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showOfficeList = false;
    this.configurationWizardService.showOfficeTable = false;
    this.configurationWizardService.showOfficeForm = true;
    this.router.navigate(['/organization/offices/create']);
  }

  /**
   * Previous Step ( Manage Offices Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showOfficeList = false;
    this.configurationWizardService.showOfficeTable = false;
    this.configurationWizardService.showCreateOffice = true;
    this.router.navigate(['/organization']);
  }
}
