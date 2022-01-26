import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ActivateSavingsAccountComponent } from './activate-savings-account.component';

describe('ActivateSavingsAccountComponent', () => {
  let component: ActivateSavingsAccountComponent;
  let fixture: ComponentFixture<ActivateSavingsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivateSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivateSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
