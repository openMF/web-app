import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RejectSavingsAccountComponent } from './reject-savings-account.component';

describe('RejectSavingsAccountComponent', () => {
  let component: RejectSavingsAccountComponent;
  let fixture: ComponentFixture<RejectSavingsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RejectSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
