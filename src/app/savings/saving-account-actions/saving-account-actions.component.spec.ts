import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingAccountActionsComponent } from './saving-account-actions.component';

describe('SavingAccountActionsComponent', () => {
  let component: SavingAccountActionsComponent;
  let fixture: ComponentFixture<SavingAccountActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingAccountActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingAccountActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
