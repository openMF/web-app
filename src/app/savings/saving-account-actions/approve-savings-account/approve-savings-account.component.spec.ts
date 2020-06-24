import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveSavingsAccountComponent } from './approve-savings-account.component';

describe('ApproveSavingsAccountComponent', () => {
  let component: ApproveSavingsAccountComponent;
  let fixture: ComponentFixture<ApproveSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
