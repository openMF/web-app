/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
  inject
} from '@angular/core';
import { ControlValueAccessor, NgControl, UntypedFormControl, Validators } from '@angular/forms';
import NepaliDate from 'nepali-date-converter';
import { MatIcon } from '@angular/material/icon';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

// Ported from Nepal-cms: packages/ui/src/components/BSDatePicker.tsx
const NEPALI_MONTHS = [
  'Baishakh',
  'Jestha',
  'Ashadh',
  'Shrawan',
  'Bhadra',
  'Ashwin',
  'Kartik',
  'Mangsir',
  'Poush',
  'Magh',
  'Falgun',
  'Chaitra'
];
const WEEKDAYS = [
  'S',
  'M',
  'T',
  'W',
  'T',
  'F',
  'S'
];
const MIN_BS_YEAR = 2000;
const MAX_BS_YEAR = 2089;

type BsDate = { year: number; month: number; day: number };

/**
 * How many days in a given BS (year, monthIdx)?
 * Probes 32→29 until NepaliDate round-trips cleanly.
 * Nepal months are irregular (29–32 days); nepali-date-converter holds the lookup table.
 */
function daysInBSMonth(year: number, monthIdx: number): number {
  for (let d = 32; d >= 29; d--) {
    try {
      const nd = new NepaliDate(year, monthIdx, d);
      if (nd.getMonth() === monthIdx && nd.getDate() === d && nd.getYear() === year) return d;
    } catch {
      /* out-of-range — try shorter */
    }
  }
  return 30;
}

/** Compare two BsDate objects: -1 | 0 | 1 */
function compareBs(a: BsDate, b: BsDate): number {
  if (a.year !== b.year) return a.year < b.year ? -1 : 1;
  if (a.month !== b.month) return a.month < b.month ? -1 : 1;
  if (a.day !== b.day) return a.day < b.day ? -1 : 1;
  return 0;
}

/**
 * Nepali (BS) date picker — a ControlValueAccessor drop-in for mat-datepicker.
 *
 *   <mifosx-nepali-date-input
 *     class="flex-13"
 *     label="Date of Birth"
 *     formControlName="dateOfBirth"
 *     [maxDate]="maxDate"
 *   />
 *
 * The parent FormControl receives a JS Date (same type as mat-datepicker),
 * so no backend or serialisation changes are needed.
 *
 * [minDate] and [maxDate] accept AD Date objects; they are converted to BS
 * internally and enforced on navigation, year select, and individual day buttons.
 */
@Component({
  selector: 'mifosx-nepali-date-input',
  templateUrl: './nepali-date-input.component.html',
  styleUrls: ['./nepali-date-input.component.scss'],
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NepaliDateInputComponent implements ControlValueAccessor {
  @Input() label = 'Date (BS)';
  @Input() minBsYear = MIN_BS_YEAR;
  @Input() maxBsYear = MAX_BS_YEAR;

  // ── minDate / maxDate (AD) — converted to BS for internal use ─────────────

  private minBs: BsDate | null = null;
  private maxBs: BsDate | null = null;

  @Input()
  set minDate(value: Date | null | undefined) {
    this.minBs = value ? this.adToBs(value) : null;
    this.cdr.markForCheck();
  }

  @Input()
  set maxDate(value: Date | null | undefined) {
    this.maxBs = value ? this.adToBs(value) : null;
    this.cdr.markForCheck();
  }

  // Wire CVA using inject() with self+optional flags
  readonly ngControl = inject(NgControl, { optional: true, self: true });

  private readonly cdr = inject(ChangeDetectorRef);
  private readonly el = inject(ElementRef);

  readonly nepaliMonths = NEPALI_MONTHS;
  readonly weekdays = WEEKDAYS;

  panelOpen = false;
  panelTop = 0;
  panelLeft = 0;
  viewYear = 0;
  viewMonth = 0; // 0-indexed

  emptySlots: null[] = [];
  dayNumbers: number[] = [];

  selectedBs: BsDate | null = null;
  adPreview: string | null = null;

  /** Read-only display input; user interacts only via the calendar panel */
  readonly bsInputControl = new UntypedFormControl('');

  @ViewChild('wrapper') wrapperRef!: ElementRef<HTMLElement>;
  @ViewChild('yearList') yearListRef?: ElementRef<HTMLElement>;

  pickerMode: 'days' | 'months' | 'years' = 'days';

  private readonly today = new NepaliDate();
  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    if (this.ngControl) {
      this.ngControl.valueAccessor = this;
    }
    const now = new NepaliDate();
    this.viewYear = now.getYear();
    this.viewMonth = now.getMonth();
    this.recomputeCalendar();
  }

  // ── Derived state ──────────────────────────────────────────────────────────

  get yearRange(): number[] {
    const lo = this.minBs?.year ?? this.minBsYear;
    const hi = this.maxBs?.year ?? this.maxBsYear;
    const out: number[] = [];
    for (let y = hi; y >= lo; y--) out.push(y);
    return out;
  }

  /** Prev-month button is disabled when the view is already at the min month. */
  get isAtMin(): boolean {
    if (this.minBs) {
      return this.viewYear === this.minBs.year && this.viewMonth === this.minBs.month;
    }
    return this.viewYear === this.minBsYear && this.viewMonth === 0;
  }

  /** Next-month button is disabled when the view is already at the max month. */
  get isAtMax(): boolean {
    if (this.maxBs) {
      return this.viewYear === this.maxBs.year && this.viewMonth === this.maxBs.month;
    }
    return this.viewYear === this.maxBsYear && this.viewMonth === 11;
  }

  get isRequired(): boolean {
    return this.ngControl?.control?.hasValidator(Validators.required) ?? false;
  }

  get hasRequiredError(): boolean {
    const ctrl = this.ngControl?.control;
    return !!(ctrl && ctrl.touched && ctrl.hasError('required'));
  }

  get isDisabled(): boolean {
    return this.bsInputControl.disabled;
  }

  /** True when the calendar day should be greyed out and not selectable. */
  isDayDisabled(day: number): boolean {
    const candidate: BsDate = { year: this.viewYear, month: this.viewMonth, day };
    if (this.minBs && compareBs(candidate, this.minBs) < 0) return true;
    if (this.maxBs && compareBs(candidate, this.maxBs) > 0) return true;
    return false;
  }

  /** Today button is disabled when today falls outside the allowed range. */
  get isTodayDisabled(): boolean {
    const todayBs: BsDate = {
      year: this.today.getYear(),
      month: this.today.getMonth(),
      day: this.today.getDate()
    };
    if (this.minBs && compareBs(todayBs, this.minBs) < 0) return true;
    if (this.maxBs && compareBs(todayBs, this.maxBs) > 0) return true;
    return false;
  }

  // ── ControlValueAccessor ───────────────────────────────────────────────────

  writeValue(value: Date | string | null): void {
    if (!value) {
      this.clearState(false);
    } else {
      this.syncFromAd(value);
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.bsInputControl.disable() : this.bsInputControl.enable();
    this.cdr.markForCheck();
  }

  // ── Panel open/close ───────────────────────────────────────────────────────

  openPanel(): void {
    if (this.panelOpen || this.isDisabled) return;
    if (this.selectedBs) {
      this.viewYear = this.selectedBs.year;
      this.viewMonth = this.selectedBs.month;
    }
    // Clamp view to min/max so the panel always opens at a valid month
    if (this.minBs) {
      if (this.viewYear < this.minBs.year || (this.viewYear === this.minBs.year && this.viewMonth < this.minBs.month)) {
        this.viewYear = this.minBs.year;
        this.viewMonth = this.minBs.month;
      }
    }
    if (this.maxBs) {
      if (this.viewYear > this.maxBs.year || (this.viewYear === this.maxBs.year && this.viewMonth > this.maxBs.month)) {
        this.viewYear = this.maxBs.year;
        this.viewMonth = this.maxBs.month;
      }
    }
    this.pickerMode = 'days';
    this.recomputeCalendar();
    const rect = this.wrapperRef.nativeElement.getBoundingClientRect();
    const panelW = 264;
    const panelH = 310; // max height: header(36) + weekdays(26) + 6 rows×33px(198) + footer(36)
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Flip upward if the panel would overflow the bottom of the viewport
    this.panelTop = rect.bottom + 4 + panelH > vh ? rect.top - panelH - 4 : rect.bottom + 4;

    // Shift left if the panel would overflow the right edge of the viewport
    this.panelLeft = rect.left + panelW > vw ? vw - panelW - 8 : rect.left;

    this.panelOpen = true;
    this.cdr.markForCheck();
  }

  closePanel(): void {
    this.panelOpen = false;
    this.bsInputControl.markAsTouched();
    this.onTouched();
    this.cdr.markForCheck();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.panelOpen && !this.el.nativeElement.contains(event.target as Node)) {
      this.closePanel();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.panelOpen) this.closePanel();
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  prevMonth(): void {
    if (this.viewMonth === 0) {
      this.viewYear--;
      this.viewMonth = 11;
    } else {
      this.viewMonth--;
    }
    this.recomputeCalendar();
    this.cdr.markForCheck();
  }

  nextMonth(): void {
    if (this.viewMonth === 11) {
      this.viewYear++;
      this.viewMonth = 0;
    } else {
      this.viewMonth++;
    }
    this.recomputeCalendar();
    this.cdr.markForCheck();
  }

  onMonthChange(event: Event): void {
    this.viewMonth = Number((event.target as HTMLSelectElement).value);
    this.recomputeCalendar();
    this.cdr.markForCheck();
  }

  onYearChange(event: Event): void {
    this.selectViewYear(Number((event.target as HTMLSelectElement).value));
  }

  // ── Picker mode (month / year grid views) ──────────────────────────────────

  setMode(mode: 'days' | 'months' | 'years'): void {
    this.pickerMode = mode;
    this.cdr.markForCheck();
    if (mode === 'years') {
      // After Angular renders the year grid, scroll the selected year into view
      setTimeout(() => {
        const el = this.yearListRef?.nativeElement.querySelector(
          `[data-year="${this.viewYear}"]`
        ) as HTMLElement | null;
        el?.scrollIntoView({ block: 'center', behavior: 'instant' });
      }, 0);
    }
  }

  selectViewMonth(monthIdx: number): void {
    this.viewMonth = monthIdx;
    // Clamp to maxBs if needed
    if (this.maxBs && this.viewYear === this.maxBs.year && this.viewMonth > this.maxBs.month) {
      this.viewMonth = this.maxBs.month;
    }
    if (this.minBs && this.viewYear === this.minBs.year && this.viewMonth < this.minBs.month) {
      this.viewMonth = this.minBs.month;
    }
    this.recomputeCalendar();
    this.pickerMode = 'days';
    this.cdr.markForCheck();
  }

  selectViewYear(year: number): void {
    this.viewYear = year;
    // Clamp month into valid range for the new year
    if (this.minBs && this.viewYear === this.minBs.year && this.viewMonth < this.minBs.month) {
      this.viewMonth = this.minBs.month;
    }
    if (this.maxBs && this.viewYear === this.maxBs.year && this.viewMonth > this.maxBs.month) {
      this.viewMonth = this.maxBs.month;
    }
    this.recomputeCalendar();
    this.pickerMode = 'days';
    this.cdr.markForCheck();
  }

  // ── Day selection ──────────────────────────────────────────────────────────

  selectDay(day: number): void {
    if (this.isDayDisabled(day)) return; // guard against keyboard/programmatic calls
    const nd = new NepaliDate(this.viewYear, this.viewMonth, day);
    const adDate = nd.toJsDate();

    this.selectedBs = { year: this.viewYear, month: this.viewMonth, day };
    this.bsInputControl.setValue(nd.format('D MMMM YYYY'), { emitEvent: false });
    this.adPreview = adDate.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    this.onChange(adDate);
    this.closePanel();
  }

  clearDate(): void {
    this.clearState(true);
    this.closePanel();
  }

  selectToday(): void {
    if (this.isTodayDisabled) return;
    const now = new NepaliDate();
    this.viewYear = now.getYear();
    this.viewMonth = now.getMonth();
    this.recomputeCalendar();
    this.selectDay(now.getDate());
  }

  isSelected(day: number): boolean {
    return (
      !!this.selectedBs &&
      this.selectedBs.year === this.viewYear &&
      this.selectedBs.month === this.viewMonth &&
      this.selectedBs.day === day
    );
  }

  isToday(day: number): boolean {
    return (
      this.today.getYear() === this.viewYear && this.today.getMonth() === this.viewMonth && this.today.getDate() === day
    );
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private adToBs(date: Date): BsDate | null {
    try {
      const nd = new NepaliDate(date);
      return { year: nd.getYear(), month: nd.getMonth(), day: nd.getDate() };
    } catch {
      return null;
    }
  }

  private recomputeCalendar(): void {
    const days = daysInBSMonth(this.viewYear, this.viewMonth);
    const firstWeekday = new NepaliDate(this.viewYear, this.viewMonth, 1).toJsDate().getDay();
    this.emptySlots = Array(firstWeekday).fill(null);
    this.dayNumbers = Array.from({ length: days }, (_, i) => i + 1);
  }

  private syncFromAd(adDate: Date | string): void {
    try {
      const jsDate = adDate instanceof Date ? adDate : new Date(adDate as string);
      if (isNaN(jsDate.getTime())) return;
      const nd = new NepaliDate(jsDate);

      this.selectedBs = { year: nd.getYear(), month: nd.getMonth(), day: nd.getDate() };
      this.viewYear = nd.getYear();
      this.viewMonth = nd.getMonth();
      this.bsInputControl.setValue(nd.format('D MMMM YYYY'), { emitEvent: false });
      this.adPreview = jsDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      this.recomputeCalendar();
    } catch {
      // AD date outside NepaliDate supported range — leave display empty
    }
  }

  private clearState(emitChange: boolean): void {
    this.selectedBs = null;
    this.adPreview = null;
    this.bsInputControl.setValue('', { emitEvent: false });
    if (emitChange) this.onChange(null);
  }
}
