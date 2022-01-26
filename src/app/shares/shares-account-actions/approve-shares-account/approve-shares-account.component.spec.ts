import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApproveSharesAccountComponent } from './approve-shares-account.component';

describe('ApproveSharesAccountComponent', () => {
  let component: ApproveSharesAccountComponent;
  let fixture: ComponentFixture<ApproveSharesAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveSharesAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveSharesAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
