import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApproveLoanComponent } from './approve-loan.component';

describe('ApproveLoanComponent', () => {
  let component: ApproveLoanComponent;
  let fixture: ComponentFixture<ApproveLoanComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveLoanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
