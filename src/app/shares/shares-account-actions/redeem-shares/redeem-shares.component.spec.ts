import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RedeemSharesComponent } from './redeem-shares.component';

describe('RedeemSharesComponent', () => {
  let component: RedeemSharesComponent;
  let fixture: ComponentFixture<RedeemSharesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RedeemSharesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RedeemSharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
