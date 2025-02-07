import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanCollateralTabComponent } from './loan-collateral-tab.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

describe('LoanCollateralTabComponent', () => {
  let component: LoanCollateralTabComponent;
  let fixture: ComponentFixture<LoanCollateralTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoanCollateralTabComponent],
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [TranslateService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanCollateralTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
