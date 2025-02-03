import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositAccountViewComponent } from './fixed-deposit-account-view.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('FixedDepositAccountViewComponent', () => {
  let component: FixedDepositAccountViewComponent;
  let fixture: ComponentFixture<FixedDepositAccountViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositAccountViewComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
