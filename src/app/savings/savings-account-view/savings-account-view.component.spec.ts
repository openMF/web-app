import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavingsAccountViewComponent } from './savings-account-view.component';

describe('SavingsAccountViewComponent', () => {
  let component: SavingsAccountViewComponent;
  let fixture: ComponentFixture<SavingsAccountViewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingsAccountViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
