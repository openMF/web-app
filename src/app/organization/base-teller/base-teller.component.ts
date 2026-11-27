/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  computed,
  effect,
  inject,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { Router } from '@angular/router';

/** Third Party Imports */
import { TranslateService } from '@ngx-translate/core';
import { EMPTY, Observable, Subject, map, merge, of, switchMap, take, tap } from 'rxjs';

/** Custom Modules */
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CashHolding } from './cash-management/cash-management.models';
import { SearchableOperation, parseSearchTerms, searchOperations } from './workspace/base-teller-search';
import {
  BASE_TELLER_CATEGORIES,
  BASE_TELLER_FREQUENT_OPERATIONS,
  BaseTellerCategory,
  BaseTellerWorkflow,
  FrequentOperationSlot,
  WorkflowAvailability,
  authorizedWorkflows,
  isWorkflowAuthorized,
  resolveFrequentOperations,
  workflowAvailability,
  workflowById,
  workflowsInCategory
} from './workspace/base-teller-workflows';
import { ClosingDialogComponent, ClosingDialogData } from './workspace/closing-dialog.component';
import {
  CashLimitStatus,
  TELLER_CASH_POLICY,
  evaluateCashLimit,
  findCashLimit,
  resolveThresholds
} from './workspace/teller-cash-policy';
import { Decimal, absDecimal, isZeroDecimal, toDecimal } from './workspace/teller-decimal';
import {
  frequentShortcutOf,
  hasOpenOverlay,
  isEditableTarget,
  isMacPlatform,
  isSearchShortcut
} from './workspace/teller-keyboard';
import {
  AssignmentResolution,
  ClosingOutcome,
  LOADING,
  RegisterSnapshot,
  Section,
  TellerAssignment,
  WorkspaceIdentity
} from './workspace/teller-workspace.models';
import { TellerWorkspaceService } from './workspace/teller-workspace.service';
import {
  MovementSummary,
  RecentOperation,
  buildIdentityKey,
  buildMovement,
  deriveHistoryFacts,
  formatBusinessDate,
  formatClock,
  formatMoney,
  formatSignedMoney,
  matchingHoldings,
  recentOperations,
  resolveLocale,
  summarizeRegister
} from './workspace/teller-workspace.view';
import { TransactionHistorySearch } from './transaction-history/transaction-history.models';

/** Re-checks the visible data at most this often when the tab regains focus (no timer-based polling). */
const FOCUS_REFRESH_MIN_INTERVAL_MS = 60_000;
/** Teller-window lookups are reused for this long; a manual refresh always repeats them. */
const ASSIGNMENT_CACHE_MS = 10 * 60_000;

type SessionResolution =
  { kind: 'loading' } | AssignmentResolution | { kind: 'selection-required'; assignments: TellerAssignment[] };

interface AlertView {
  currencyCode: string;
  level: 'near' | 'exceeded';
  limitText: string;
}

interface FrequentView {
  slot: FrequentOperationSlot;
  workflow: BaseTellerWorkflow;
}

interface CategoryView {
  id: BaseTellerCategory;
  titleKey: string;
  descriptionKey: string;
  items: readonly BaseTellerWorkflow[];
}

/**
 * Base Teller workspace: a session-aware landing page for the cashier.
 *
 * It shows the signed-in cashier's own register (cash on hand, movement, recent operations) and groups every Base
 * Teller operation. It never sends a financial command: cards only navigate, and closings need an explicit
 * confirmation first. Backend rules and per-route guards remain the authority.
 */
@Component({
  selector: 'mifosx-base-teller',
  templateUrl: './base-teller.component.html',
  styleUrls: ['./base-teller.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatAnchor,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatIcon,
    MatIconButton,
    MatProgressBar
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseTellerComponent {
  private readonly authentication = inject(AuthenticationService);
  private readonly settings = inject(SettingsService);
  private readonly translate = inject(TranslateService);
  private readonly workspace = inject(TellerWorkspaceService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cashPolicy = inject(TELLER_CASH_POLICY);
  private readonly frequentConfig = inject(BASE_TELLER_FREQUENT_OPERATIONS);

  readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  readonly searchControl = new FormControl('', { nonNullable: true });
  private readonly query = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  /** Current language; reading it makes translated, locale-formatted values recompute on a language switch. */
  private readonly language = toSignal(this.translate.onLangChange.pipe(map((event) => event.lang)), {
    initialValue: this.translate.currentLang || this.translate.defaultLang || 'en-US'
  });
  readonly locale = computed(() => resolveLocale(this.language()));

  private readonly permissions = signal<readonly string[]>(this.authentication.getCredentials()?.permissions ?? []);
  private readonly identity = signal<WorkspaceIdentity>(this.readIdentity());

  readonly resolution = signal<SessionResolution>({ kind: 'loading' });
  readonly selectedCashierId = signal<string | null>(null);
  readonly holdings = signal<Section<CashHolding[]>>(LOADING);
  readonly registers = signal<Section<RegisterSnapshot>>(LOADING);
  readonly history = signal<Section<TransactionHistorySearch>>(LOADING);
  private readonly selectedCurrency = signal<string | null>(null);

  private readonly refresh$ = new Subject<{ force: boolean; soft: boolean }>();
  private assignmentCache: { key: string; resolution: AssignmentResolution; at: number } | null = null;
  private lastLoadedAt = 0;
  private closingDialog: MatDialogRef<ClosingDialogComponent, boolean> | null = null;

  /* ---------- operations ---------- */

  readonly authorized = computed(() => authorizedWorkflows(this.permissions()));

  readonly frequent = computed<readonly FrequentView[]>(() => {
    const authorized = new Set(this.authorized().map((workflow) => workflow.id));
    return resolveFrequentOperations(this.frequentConfig).flatMap((slot) => {
      const workflow = workflowById(slot.operationId);
      return workflow && authorized.has(workflow.id) ? [{ slot, workflow }] : [];
    });
  });

  /** Groups below the frequent tiles. Closings are rendered in their own section, and frequent operations are not repeated. */
  readonly categories = computed<readonly CategoryView[]>(() => {
    const shown = new Set(this.frequent().map((entry) => entry.workflow.id));
    return BASE_TELLER_CATEGORIES.filter((category) => category.id !== 'closings')
      .map((category) => ({
        ...category,
        items: workflowsInCategory(this.authorized(), category.id).filter((workflow) => !shown.has(workflow.id))
      }))
      .filter((category) => category.items.length > 0);
  });

  readonly closings = computed(() => workflowsInCategory(this.authorized(), 'closings'));

  /* ---------- session ---------- */

  readonly assignment = computed<TellerAssignment | null>(() => {
    const resolution = this.resolution();
    if (resolution.kind !== 'resolved') {
      return null;
    }
    const selected = this.selectedCashierId();
    return (
      resolution.assignments.find((candidate) => String(candidate.cashierId) === selected) ??
      (resolution.assignments.length === 1 ? resolution.assignments[0] : null)
    );
  });

  private readonly holdingRows = computed(() => {
    const section = this.holdings();
    const assignment = this.assignment();
    if (section.status !== 'ready' || !assignment) {
      return null;
    }
    return matchingHoldings(section.data, assignment.cashierId, this.identity().businessDate);
  });

  /** True when the backend answered but the cashier has no cash movement today (so no register is opened). */
  readonly holdingRowsEmpty = computed(() => this.holdingRows()?.rows.length === 0);

  readonly currencies = computed(() => [...new Set((this.holdingRows()?.rows ?? []).map((row) => this.codeOf(row)))]);
  readonly activeCurrency = computed(() => {
    const available = this.currencies();
    const selected = this.selectedCurrency();
    return selected && available.includes(selected) ? selected : (available[0] ?? null);
  });
  private readonly activeHolding = computed(
    () => this.holdingRows()?.rows.find((row) => this.codeOf(row) === this.activeCurrency()) ?? null
  );
  readonly movement = computed<MovementSummary | null>(() => {
    const holding = this.activeHolding();
    return holding ? buildMovement(holding) : null;
  });

  readonly registerState = computed(() => {
    const section = this.registers();
    return section.status === 'ready' ? summarizeRegister(section.data.registers) : summarizeRegister(null);
  });
  readonly closingOutcome = computed(() => {
    const section = this.registers();
    const currency = this.activeCurrency();
    return section.status === 'ready'
      ? (section.data.outcomes.find((outcome) => outcome.currencyCode === currency) ?? null)
      : null;
  });

  readonly facts = computed(() => {
    const section = this.history();
    return section.status === 'ready' ? deriveHistoryFacts(section.data) : null;
  });
  readonly recent = computed<RecentOperation[]>(() => {
    const section = this.history();
    return section.status === 'ready' ? recentOperations(section.data.items) : [];
  });

  /* ---------- cash limit ---------- */

  private readonly thresholds = computed(() => resolveThresholds(this.cashPolicy.thresholds));
  private readonly limitStatuses = computed(() =>
    (this.holdingRows()?.rows ?? []).map((row) => ({
      currencyCode: this.codeOf(row),
      status: evaluateCashLimit(
        toDecimal(row.currentBalance),
        findCashLimit(this.cashPolicy, row.currencyCode),
        this.thresholds()
      )
    }))
  );
  readonly activeLimit = computed<CashLimitStatus | null>(
    () => this.limitStatuses().find((entry) => entry.currencyCode === this.activeCurrency())?.status ?? null
  );
  readonly alerts = computed<AlertView[]>(() =>
    this.limitStatuses().flatMap(({ currencyCode, status }) =>
      status.state === 'available' && status.alert !== 'none'
        ? [{ currencyCode, level: status.alert, limitText: this.money(status.limit, currencyCode) }]
        : []
    )
  );
  /** The vault-deposit link is only offered to users who may open that screen. */
  readonly canDepositToVault = computed(() => {
    const vault = workflowById('vaultDeposit');
    return !!vault && isWorkflowAuthorized(vault, this.permissions());
  });
  readonly vaultRoute = workflowById('vaultDeposit')?.route ?? [];

  /* ---------- search ---------- */

  readonly searching = computed(() => this.query().trim() !== '');
  private readonly searchable = computed<SearchableOperation[]>(() => {
    this.language();
    return this.authorized().map((workflow) => ({
      workflow,
      label: this.translate.instant(workflow.label),
      description: this.translate.instant(workflow.descriptionKey),
      terms: parseSearchTerms(this.translate.instant(workflow.termsKey), workflow.termsKey)
    }));
  });
  readonly results = computed(() => searchOperations(this.searchable(), this.query()));

  constructor() {
    this.refresh$
      .pipe(
        switchMap((request) => this.load(request.force, request.soft)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
    // A change of the business date (e.g. the day rolls over) reloads everything for the new date.
    effect(() => {
      const next = this.formatDate(this.settings.businessDate);
      untracked(() => {
        if (next !== this.identity().businessDate) {
          this.refresh({ force: true });
        }
      });
    });
    this.destroyRef.onDestroy(() => this.closingDialog?.close(false));
    this.refresh({ force: true });
  }

  /* ---------- loading ---------- */

  /**
   * Reloads the session panels. Stale in-flight requests are cancelled by the `switchMap`.
   *
   * `force` repeats the teller-window lookup; `soft` keeps the current figures on screen until the new ones arrive
   * (used by the focus refresh) instead of blanking them.
   */
  refresh(options: { force?: boolean; soft?: boolean } = {}): void {
    this.refresh$.next({ force: options.force ?? false, soft: options.soft ?? false });
  }

  @HostListener('document:visibilitychange')
  onVisibilityChange(): void {
    if (this.document.visibilityState === 'visible' && Date.now() - this.lastLoadedAt > FOCUS_REFRESH_MIN_INTERVAL_MS) {
      this.refresh({ soft: true });
    }
  }

  private load(force: boolean, soft: boolean): Observable<unknown> {
    const identity = this.readIdentity();
    const changed = identity.key !== this.identity().key;
    this.identity.set(identity);
    this.permissions.set(this.authentication.getCredentials()?.permissions ?? []);
    if (changed) {
      // Nothing from another user, office or business date may linger on screen.
      this.resolution.set({ kind: 'loading' });
      this.selectedCashierId.set(null);
      this.selectedCurrency.set(null);
      this.assignmentCache = null;
    }
    if (!soft || changed) {
      this.holdings.set(LOADING);
      this.registers.set(LOADING);
      this.history.set(LOADING);
    }
    this.lastLoadedAt = Date.now();

    const cache = this.assignmentCache;
    const reuse = !force && cache !== null && cache.key === identity.key && Date.now() - cache.at < ASSIGNMENT_CACHE_MS;
    const resolution$: Observable<AssignmentResolution> = reuse
      ? of(cache.resolution)
      : this.workspace
          .resolveAssignments(identity)
          .pipe(
            tap((resolved) => (this.assignmentCache = { key: identity.key, resolution: resolved, at: Date.now() }))
          );

    return resolution$.pipe(
      switchMap((resolved) => {
        if (!this.isCurrent(identity)) {
          return EMPTY;
        }
        if (resolved.kind !== 'resolved') {
          this.resolution.set(resolved);
          return EMPTY;
        }
        const assignment = this.pickAssignment(identity, resolved.assignments);
        if (!assignment) {
          this.resolution.set({ kind: 'selection-required', assignments: resolved.assignments });
          return EMPTY;
        }
        this.resolution.set(resolved);
        this.selectedCashierId.set(String(assignment.cashierId));
        return this.loadSession(identity, assignment);
      })
    );
  }

  private loadSession(identity: WorkspaceIdentity, assignment: TellerAssignment): Observable<unknown> {
    const { cashierId } = assignment;
    const holdings$ = this.workspace.loadHoldings(cashierId, identity.businessDate).pipe(
      tap((section) => {
        if (this.isCurrent(identity)) {
          this.holdings.set(section);
        }
      }),
      switchMap((section) => {
        if (!this.isCurrent(identity)) {
          return EMPTY;
        }
        if (section.status !== 'ready') {
          this.registers.set({ status: section.status });
          return EMPTY;
        }
        const rows = matchingHoldings(section.data, cashierId, identity.businessDate).rows;
        return this.workspace.loadRegisters(
          cashierId,
          rows.map((row) => row.currencyCode),
          identity.businessDate
        );
      }),
      tap((section) => {
        if (this.isCurrent(identity)) {
          this.registers.set(section);
        }
      })
    );
    const history$ = this.workspace.loadHistory(cashierId, identity.businessDate).pipe(
      tap((section) => {
        if (this.isCurrent(identity)) {
          this.history.set(section);
        }
      })
    );
    return merge(holdings$, history$);
  }

  /** The single cashier, or the user's remembered choice among several; `null` means the user must choose. */
  private pickAssignment(
    identity: WorkspaceIdentity,
    assignments: readonly TellerAssignment[]
  ): TellerAssignment | null {
    if (assignments.length === 1) {
      return assignments[0];
    }
    const remembered = this.readStoredChoice(identity);
    return assignments.find((candidate) => String(candidate.cashierId) === remembered) ?? null;
  }

  /** True while `identity` still describes the signed-in user, tenant, office and business date. */
  private isCurrent(identity: WorkspaceIdentity): boolean {
    return this.readIdentity().key === identity.key;
  }

  chooseAssignment(cashierId: string | number): void {
    this.storeChoice(this.identity(), String(cashierId));
    this.selectedCashierId.set(String(cashierId));
    this.refresh();
  }

  selectCurrency(currencyCode: string): void {
    this.selectedCurrency.set(currencyCode);
  }

  private readIdentity(): WorkspaceIdentity {
    const credentials = this.authentication.getCredentials();
    const staffId =
      typeof credentials?.staffId === 'number' && Number.isFinite(credentials.staffId) ? credentials.staffId : null;
    const parts = {
      tenant: this.settings.tenantIdentifier ?? '',
      userId: credentials?.userId ?? null,
      officeId: credentials?.officeId ?? null,
      staffId,
      businessDate: this.formatDate(this.settings.businessDate)
    };
    return { ...parts, key: buildIdentityKey(parts) };
  }

  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${date.getFullYear()}-${month}-${day}`;
  }

  private storageKey(identity: WorkspaceIdentity): string {
    return `mifosx.baseTeller.cashier.${identity.key}`;
  }

  private readStoredChoice(identity: WorkspaceIdentity): string | null {
    try {
      return sessionStorage.getItem(this.storageKey(identity));
    } catch {
      return null;
    }
  }

  private storeChoice(identity: WorkspaceIdentity, cashierId: string): void {
    try {
      sessionStorage.setItem(this.storageKey(identity), cashierId);
    } catch {
      // Storage can be unavailable; the choice then only lasts for this visit.
    }
  }

  /* ---------- presentation helpers ---------- */

  private codeOf(row: CashHolding): string {
    return row.currencyCode.trim().toUpperCase();
  }

  money(value: Decimal, currencyCode: string, decimalPlaces: number | null = null): string {
    return formatMoney(value, currencyCode, this.locale(), decimalPlaces);
  }

  differenceText(movement: MovementSummary): string {
    return this.money(absDecimal(movement.difference), movement.currencyCode);
  }

  /** "1 operation" / "5 operations": the translation service has no plural support, so the singular is its own key. */
  operationCountText(count: number): string {
    return this.translate.instant(
      count === 1 ? 'baseTellerWorkspace.movement.operationCountOne' : 'baseTellerWorkspace.movement.operationCount',
      { count }
    );
  }

  /** Shortcut hint shown in the search box: Cmd+K on macOS, Ctrl+K elsewhere. */
  readonly searchShortcutLabel = isMacPlatform() ? '\u2318 K' : 'Ctrl K';

  /** Backend-computed difference of a completed closing, with its shortage/overage meaning. */
  closingOutcomeText(outcome: ClosingOutcome): string {
    const difference = toDecimal(outcome.difference);
    if (difference === null) {
      return this.translate.instant('baseTellerWorkspace.movement.closingUnknown');
    }
    if (isZeroDecimal(difference)) {
      return this.translate.instant('baseTellerWorkspace.movement.closingBalanced');
    }
    const type = outcome.differenceType
      ? this.translate.instant(`web1232.differenceType.${outcome.differenceType}`)
      : '';
    return this.translate.instant('baseTellerWorkspace.movement.closingDifference', {
      amount: this.money(absDecimal(difference), outcome.currencyCode),
      type
    });
  }

  hasDifference(movement: MovementSummary): boolean {
    return !isZeroDecimal(movement.difference);
  }

  recentAmount(operation: RecentOperation): string | null {
    return operation.amount
      ? formatSignedMoney(
          operation.amount,
          operation.direction,
          operation.currencyCode,
          this.locale(),
          operation.decimalPlaces
        )
      : null;
  }

  clock(iso: string | null | undefined): string | null {
    return formatClock(iso, this.locale());
  }

  readonly businessDateLabel = computed(() => formatBusinessDate(this.identity().businessDate, this.locale()));

  /** Translation key for an operation code, falling back to a readable form of the code. */
  operationLabel(code: string): string {
    const key = `baseTellerWorkspace.operationTypes.${code}`;
    const translated = this.translate.instant(key);
    return translated !== key
      ? translated
      : code
          .toLowerCase()
          .split('_')
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
  }

  availabilityOf(workflow: BaseTellerWorkflow): WorkflowAvailability {
    return workflowAvailability(workflow, this.registerState());
  }

  /** History link that keeps the cashier and business date instead of opening institution-wide history. */
  readonly historyQueryParams = computed(() => {
    const assignment = this.assignment();
    return assignment ? { cashierId: assignment.cashierId, date: this.identity().businessDate } : null;
  });
  readonly historyRoute = workflowById('transactionHistory')?.route ?? [];
  readonly canViewHistory = computed(() => this.authorized().some((workflow) => workflow.id === 'transactionHistory'));
  readonly canViewCashOnHand = computed(() => this.authorized().some((workflow) => workflow.id === 'cashOnHand'));
  readonly cashOnHandRoute = workflowById('cashOnHand')?.route ?? [];
  readonly openRegisterRoute = workflowById('cashAllocation')?.route ?? [];
  readonly canOpenRegister = computed(() => this.authorized().some((workflow) => workflow.id === 'cashAllocation'));
  readonly closeRegister = computed(
    () => this.closings().find((workflow) => workflow.id === 'cashRegisterClosing') ?? null
  );

  /* ---------- navigation ---------- */

  /** Navigates to an operation. Closings are routed through the confirmation dialog, never opened directly. */
  open(workflow: BaseTellerWorkflow): void {
    if (!isWorkflowAuthorized(workflow, this.permissions()) || !this.availabilityOf(workflow).enabled) {
      return;
    }
    if (workflow.requiresConfirmation) {
      this.confirmClosing(workflow);
      return;
    }
    void this.router.navigate([...workflow.route]);
  }

  /**
   * Asks for confirmation before entering a closing workflow. Confirming only navigates: the closing command itself is
   * issued by the destination screen after its own confirmations, and end of day keeps its supervisor authorisation.
   */
  confirmClosing(workflow: BaseTellerWorkflow): void {
    if (this.closingDialog || !this.availabilityOf(workflow).enabled) {
      return;
    }
    const assignment = this.assignment();
    const data: ClosingDialogData = {
      workflowLabel: workflow.label,
      kind: workflow.id === 'endOfDayClosing' ? 'end-of-day' : 'cash-register',
      cashierName: assignment?.cashierName || null,
      tellerName: assignment?.tellerName || null
    };
    const reference = this.dialog.open<ClosingDialogComponent, ClosingDialogData, boolean>(ClosingDialogComponent, {
      data,
      maxWidth: '480px',
      autoFocus: 'first-tabbable',
      restoreFocus: true
    });
    this.closingDialog = reference;
    reference
      .afterClosed()
      .pipe(take(1))
      .subscribe((confirmed) => {
        this.closingDialog = null;
        if (confirmed === true) {
          void this.router.navigate([...workflow.route]);
        }
      });
  }

  /* ---------- search ---------- */

  /** Enter in the search box opens the first result that is enabled. Closing results still ask for confirmation. */
  openFirstResult(): void {
    const first = this.results().find((item) => this.availabilityOf(item.workflow).enabled);
    if (first) {
      this.open(first.workflow);
    }
  }

  clearSearch(): void {
    this.searchControl.setValue('');
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.openFirstResult();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusResult(0);
    } else if (event.key === 'Escape' && this.searching()) {
      event.preventDefault();
      this.clearSearch();
    }
  }

  /** Arrow-key navigation between result cards; Up from the first result returns to the search box. */
  onResultKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.focusResult(index + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (index === 0) {
        this.searchInput()?.nativeElement.focus();
      } else {
        this.focusResult(index - 1);
      }
    }
  }

  private focusResult(index: number): void {
    const items = this.document.querySelectorAll<HTMLElement>('[data-result-card]:not([disabled])');
    items.item(Math.min(index, items.length - 1))?.focus();
  }

  /* ---------- keyboard shortcuts ---------- */

  /**
   * Workspace shortcuts. The listener is declared with `@HostListener`, so Angular registers exactly one document
   * listener for this component and removes it on destroy.
   *
   * - Ctrl+K / Cmd+K focuses the local operation search.
   * - F2-F5 navigate to the configured frequent operation. They never run a transaction, are ignored while typing or
   *   while a dialog/menu is open, and are not intercepted when the operation is hidden or unavailable, so the browser
   *   keeps its own behaviour (for example F5 reload).
   */
  @HostListener('document:keydown', ['$event'])
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.defaultPrevented) {
      return;
    }
    if (isSearchShortcut(event)) {
      const input = this.searchInput()?.nativeElement;
      if (!input || hasOpenOverlay(this.document) || (isEditableTarget(event.target) && event.target !== input)) {
        return;
      }
      event.preventDefault();
      input.focus();
      input.select();
      return;
    }
    const shortcut = frequentShortcutOf(event);
    if (!shortcut || isEditableTarget(event.target) || hasOpenOverlay(this.document)) {
      return;
    }
    const entry = this.frequent().find((candidate) => candidate.slot.shortcut === shortcut);
    if (!entry || !this.availabilityOf(entry.workflow).enabled) {
      return;
    }
    event.preventDefault();
    this.open(entry.workflow);
  }
}
