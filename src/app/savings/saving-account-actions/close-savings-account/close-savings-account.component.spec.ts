import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CloseSavingsAccountComponent } from './close-savings-account.component';

describe('CloseSavingsAccountComponent', () => {
  let component: CloseSavingsAccountComponent;
  let fixture: ComponentFixture<CloseSavingsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CloseSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
