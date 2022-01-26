import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SharesAccountActionsComponent } from './shares-account-actions.component';

describe('SharesAccountActionsComponent', () => {
  let component: SharesAccountActionsComponent;
  let fixture: ComponentFixture<SharesAccountActionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SharesAccountActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharesAccountActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
