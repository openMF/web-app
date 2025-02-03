import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFundComponent } from './view-fund.component';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('ViewFundComponent', () => {
  let component: ViewFundComponent;
  let fixture: ComponentFixture<ViewFundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewFundComponent],
      imports: [
        RouterTestingModule,
        TranslateModule
      ],
      providers: [TranslateService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
