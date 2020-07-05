import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrematureCloseFixedDepositsAccountComponent } from './premature-close-fixed-deposits-account.component';

describe('PrematureCloseFixedDepositsAccountComponent', () => {
  let component: PrematureCloseFixedDepositsAccountComponent;
  let fixture: ComponentFixture<PrematureCloseFixedDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PrematureCloseFixedDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrematureCloseFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
