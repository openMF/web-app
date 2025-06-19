import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { GLAccount } from 'app/shared/models/general.model';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NgIf, NgFor, AsyncPipe } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-gl-account-selector',
  templateUrl: './gl-account-selector.component.html',
  styleUrls: ['./gl-account-selector.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    NgxMatSelectSearchModule,
    AsyncPipe
  ]
})
export class GlAccountSelectorComponent implements OnInit, OnChanges, OnDestroy {
  @Input() inputFormControl: UntypedFormControl;
  @Input() glAccountList: GLAccount[] = [];
  @Input() required = false;
  @Input() inputLabel = '';

  /** GL Account data. */
  protected glAccountData: ReplaySubject<GLAccount[]> = new ReplaySubject<GLAccount[]>(1);

  /** control for the filter select */
  protected filterFormCtrl: UntypedFormControl = new UntypedFormControl('');

  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();

  placeHolderLabel = '';
  noEntriesFoundLabel = '';

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    // listen for search field value changes
    this.filterFormCtrl.valueChanges.pipe(takeUntil(this._onDestroy)).subscribe(() => {
      this.searchGLAccount();
    });

    this.placeHolderLabel = this.translateService.instant('labels.text.Search');
    this.noEntriesFoundLabel = this.translateService.instant('labels.text.No data found');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.glAccountList) {
      this.glAccountData.next(this.glAccountList.slice());
    }
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  searchGLAccount(): void {
    if (this.glAccountList) {
      const search: string = this.filterFormCtrl.value.toLowerCase();

      if (!search) {
        this.glAccountData.next(this.glAccountList.slice());
      } else {
        this.glAccountData.next(
          this.glAccountList.filter((option: GLAccount) => {
            return option.name.toLowerCase().indexOf(search) >= 0 || option.glCode.toLowerCase().indexOf(search) >= 0;
          })
        );
      }
    }
  }
}
